;; StacksMint NFT Contract v2.1
;; SIP-009 compliant NFT with batch minting, royalties, metadata, and delegation
;; Version: 2.1.0
;; Author: StacksMint Team
;; Upgrade: v2.1 - Delegation, reveal mechanism, rarity traits, bulk operations

(impl-trait .sip009-nft-trait.sip009-nft-trait)

;; ============================================================================
;; Error Constants
;; ============================================================================

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_OWNER (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_MINTED (err u102))
(define-constant ERR_INVALID_URI (err u103))
(define-constant ERR_NOT_AUTHORIZED (err u104))
(define-constant ERR_TOKEN_FROZEN (err u105))
(define-constant ERR_BATCH_LIMIT_EXCEEDED (err u106))
(define-constant ERR_INVALID_ROYALTY (err u107))
(define-constant ERR_NOT_REVEALED (err u108))
(define-constant ERR_ALREADY_REVEALED (err u109))
(define-constant ERR_DELEGATE_EXISTS (err u110))
(define-constant ERR_NOT_DELEGATE (err u111))
(define-constant ERR_INVALID_RARITY (err u112))

;; ============================================================================
;; Configuration Constants
;; ============================================================================

(define-constant MAX_BATCH_SIZE u25)
(define-constant MAX_ROYALTY_PERCENT u100) ;; 10% in basis points / 10

;; Rarity tiers
(define-constant RARITY_COMMON u1)
(define-constant RARITY_UNCOMMON u2)
(define-constant RARITY_RARE u3)
(define-constant RARITY_EPIC u4)
(define-constant RARITY_LEGENDARY u5)

;; ============================================================================
;; NFT Definition
;; ============================================================================

(define-non-fungible-token stacksmint-nft-v2-1-2 uint)

;; ============================================================================
;; Data Variables
;; ============================================================================

(define-data-var last-token-id uint u0)
(define-data-var total-burned uint u0)
(define-data-var minting-paused bool false)
(define-data-var reveal-block uint u0)
(define-data-var placeholder-uri (string-ascii 256) "ipfs://placeholder")

;; ============================================================================
;; Data Maps
;; ============================================================================

;; Token URI storage
(define-map token-uris uint (string-ascii 256))

;; Pre-reveal URIs (stored before reveal)
(define-map pre-reveal-uris uint (string-ascii 256))

;; Token metadata (creator, royalty, etc.)
(define-map token-metadata uint {
  creator: principal,
  royalty-percent: uint,
  created-at: uint,
  collection-id: (optional uint),
  rarity: uint,
  revealed: bool
})

;; Frozen tokens (cannot be transferred)
(define-map frozen-tokens uint bool)

;; Approved operators for transfers
(define-map token-approvals uint principal)

;; Operator approvals (approve all)
(define-map operator-approvals { owner: principal, operator: principal } bool)

;; Delegation system
(define-map delegates { owner: principal, delegate: principal } {
  can-mint: bool,
  can-transfer: bool,
  can-list: bool,
  expires-at: uint
})

;; Token traits for rarity calculation
(define-map token-traits uint (list 10 { trait-type: (string-ascii 32), value: (string-ascii 64) }))

;; Rarity scores
(define-map rarity-scores uint uint)

;; ============================================================================
;; Authorization Helpers
;; ============================================================================

(define-private (is-owner-or-approved (token-id uint) (sender principal))
  (let ((owner (unwrap! (nft-get-owner? stacksmint-nft-v2-1-2 token-id) false)))
    (or 
      (is-eq sender owner)
      (is-eq (some sender) (map-get? token-approvals token-id))
      (default-to false (map-get? operator-approvals { owner: owner, operator: sender }))
      (is-valid-delegate owner sender))))

(define-private (is-token-frozen (token-id uint))
  (default-to false (map-get? frozen-tokens token-id)))

(define-private (is-valid-delegate (owner principal) (delegate principal))
  (match (map-get? delegates { owner: owner, delegate: delegate })
    del (and (< block-height (get expires-at del)) (get can-transfer del))
    false))

(define-private (can-delegate-mint (owner principal) (delegate principal))
  (match (map-get? delegates { owner: owner, delegate: delegate })
    del (and (< block-height (get expires-at del)) (get can-mint del))
    false))

;; ============================================================================
;; Minting Functions
;; ============================================================================

;; Mint single NFT
(define-public (mint (uri (string-ascii 256)))
  (mint-with-royalty uri u0))

;; Mint with royalty percentage
(define-public (mint-with-royalty (uri (string-ascii 256)) (royalty-percent uint))
  (mint-full uri royalty-percent RARITY_COMMON none))

;; Full mint with all options
(define-public (mint-full 
  (uri (string-ascii 256)) 
  (royalty-percent uint) 
  (rarity uint)
  (collection-id (optional uint)))
  (begin
    (asserts! (not (var-get minting-paused)) ERR_NOT_AUTHORIZED)
    (asserts! (<= royalty-percent MAX_ROYALTY_PERCENT) ERR_INVALID_ROYALTY)
    (asserts! (and (>= rarity RARITY_COMMON) (<= rarity RARITY_LEGENDARY)) ERR_INVALID_RARITY)
    (let ((token-id (+ (var-get last-token-id) u1))
          (is-revealed (is-eq (var-get reveal-block) u0)))
      (try! (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-treasury-v2-1 collect-fee))
      (try! (nft-mint? stacksmint-nft-v2-1-2 token-id tx-sender))
      
      ;; Store URI based on reveal status
      (if is-revealed
        (map-set token-uris token-id uri)
        (begin
          (map-set pre-reveal-uris token-id uri)
          (map-set token-uris token-id (var-get placeholder-uri))))
      
      (map-set token-metadata token-id {
        creator: tx-sender,
        royalty-percent: royalty-percent,
        created-at: block-height,
        collection-id: collection-id,
        rarity: rarity,
        revealed: is-revealed
      })
      (map-set rarity-scores token-id (* rarity u100))
      (var-set last-token-id token-id)
      (ok token-id))))

;; Batch mint multiple NFTs
(define-public (batch-mint (uris (list 25 (string-ascii 256))))
  (let ((count (len uris)))
    (asserts! (<= count MAX_BATCH_SIZE) ERR_BATCH_LIMIT_EXCEEDED)
    (fold batch-mint-iter uris (ok u0))))

(define-private (batch-mint-iter (uri (string-ascii 256)) (prev (response uint uint)))
  (match prev
    success (match (mint uri)
      token-id (ok token-id)
      err prev)
    err prev))

;; ============================================================================
;; Delegation Functions
;; ============================================================================

;; Add delegate with permissions
(define-public (add-delegate 
  (delegate principal)
  (can-mint bool)
  (can-transfer bool)
  (can-list bool)
  (duration uint))
  (begin
    (asserts! (is-none (map-get? delegates { owner: tx-sender, delegate: delegate })) ERR_DELEGATE_EXISTS)
    (map-set delegates { owner: tx-sender, delegate: delegate } {
      can-mint: can-mint,
      can-transfer: can-transfer,
      can-list: can-list,
      expires-at: (+ block-height duration)
    })
    (ok true)))

;; Remove delegate
(define-public (remove-delegate (delegate principal))
  (begin
    (map-delete delegates { owner: tx-sender, delegate: delegate })
    (ok true)))

;; Mint on behalf of owner (as delegate)
(define-public (mint-as-delegate (owner principal) (uri (string-ascii 256)))
  (begin
    (asserts! (can-delegate-mint owner tx-sender) ERR_NOT_DELEGATE)
    (let ((token-id (+ (var-get last-token-id) u1)))
      (try! (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-treasury-v2-1 collect-fee))
      (try! (nft-mint? stacksmint-nft-v2-1-2 token-id owner))
      (map-set token-uris token-id uri)
      (map-set token-metadata token-id {
        creator: owner,
        royalty-percent: u0,
        created-at: block-height,
        collection-id: none,
        rarity: RARITY_COMMON,
        revealed: true
      })
      (var-set last-token-id token-id)
      (ok token-id))))

;; ============================================================================
;; Reveal Mechanism
;; ============================================================================

;; Set reveal block (owner only)
(define-public (set-reveal-block (reveal-at uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (var-set reveal-block reveal-at)
    (ok reveal-at)))

;; Reveal token (after reveal block)
(define-public (reveal-token (token-id uint))
  (let ((metadata (unwrap! (map-get? token-metadata token-id) ERR_NOT_FOUND))
        (pre-uri (unwrap! (map-get? pre-reveal-uris token-id) ERR_ALREADY_REVEALED)))
    (asserts! (>= block-height (var-get reveal-block)) ERR_NOT_REVEALED)
    (asserts! (not (get revealed metadata)) ERR_ALREADY_REVEALED)
    (map-set token-uris token-id pre-uri)
    (map-set token-metadata token-id (merge metadata { revealed: true }))
    (map-delete pre-reveal-uris token-id)
    (ok true)))

;; Batch reveal tokens
(define-public (batch-reveal (token-ids (list 25 uint)))
  (fold batch-reveal-iter token-ids (ok u0)))

(define-private (batch-reveal-iter (token-id uint) (prev (response uint uint)))
  (match prev
    success (match (reveal-token token-id)
      result (ok (+ success u1))
      err prev)
    err prev))

;; ============================================================================
;; Trait Functions
;; ============================================================================

;; Set token traits
(define-public (set-token-traits 
  (token-id uint) 
  (traits (list 10 { trait-type: (string-ascii 32), value: (string-ascii 64) })))
  (begin
    (asserts! (is-owner-or-approved token-id tx-sender) ERR_NOT_AUTHORIZED)
    (map-set token-traits token-id traits)
    (ok true)))

;; Calculate and set rarity score based on traits
(define-public (calculate-rarity-score (token-id uint) (score uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (map-set rarity-scores token-id score)
    (ok score)))

;; ============================================================================
;; Transfer Functions
;; ============================================================================

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-owner-or-approved token-id tx-sender) ERR_NOT_AUTHORIZED)
    (asserts! (not (is-token-frozen token-id)) ERR_TOKEN_FROZEN)
    (nft-transfer? stacksmint-nft-v2-1-2 token-id sender recipient)))

;; Bulk transfer
(define-public (bulk-transfer 
  (transfers (list 25 { token-id: uint, recipient: principal })))
  (fold bulk-transfer-iter transfers (ok u0)))

(define-private (bulk-transfer-iter 
  (item { token-id: uint, recipient: principal }) 
  (prev (response uint uint)))
  (match prev
    success (match (transfer (get token-id item) tx-sender (get recipient item))
      result (ok (+ success u1))
      err prev)
    err prev))

;; ============================================================================
;; Approval Functions
;; ============================================================================

(define-public (approve (spender principal) (token-id uint))
  (let ((owner (unwrap! (nft-get-owner? stacksmint-nft-v2-1-2 token-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender owner) ERR_NOT_OWNER)
    (map-set token-approvals token-id spender)
    (ok true)))

(define-public (set-approval-for-all (operator principal) (approved bool))
  (begin
    (map-set operator-approvals { owner: tx-sender, operator: operator } approved)
    (ok true)))

;; ============================================================================
;; Burn Function
;; ============================================================================

(define-public (burn (token-id uint))
  (begin
    (asserts! (is-owner-or-approved token-id tx-sender) ERR_NOT_AUTHORIZED)
    (try! (nft-burn? stacksmint-nft-v2-1-2 token-id tx-sender))
    (var-set total-burned (+ (var-get total-burned) u1))
    (map-delete token-uris token-id)
    (map-delete token-metadata token-id)
    (map-delete frozen-tokens token-id)
    (map-delete token-approvals token-id)
    (ok true)))

;; ============================================================================
;; Freeze Functions
;; ============================================================================

(define-public (freeze-token (token-id uint))
  (begin
    (asserts! (is-owner-or-approved token-id tx-sender) ERR_NOT_AUTHORIZED)
    (map-set frozen-tokens token-id true)
    (ok true)))

(define-public (unfreeze-token (token-id uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (map-delete frozen-tokens token-id)
    (ok true)))

;; ============================================================================
;; Admin Functions
;; ============================================================================

(define-public (set-minting-paused (paused bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (var-set minting-paused paused)
    (ok paused)))

(define-public (set-placeholder-uri (uri (string-ascii 256)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (var-set placeholder-uri uri)
    (ok uri)))

;; ============================================================================
;; SIP-009 Required Functions
;; ============================================================================

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok (map-get? token-uris token-id)))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? stacksmint-nft-v2-1-2 token-id)))

;; ============================================================================
;; Additional Read-Only Functions
;; ============================================================================

(define-read-only (get-token-metadata (token-id uint))
  (map-get? token-metadata token-id))

(define-read-only (get-total-supply)
  (- (var-get last-token-id) (var-get total-burned)))

(define-read-only (get-total-minted)
  (var-get last-token-id))

(define-read-only (get-total-burned)
  (var-get total-burned))

(define-read-only (is-frozen (token-id uint))
  (is-token-frozen token-id))

(define-read-only (is-revealed (token-id uint))
  (match (map-get? token-metadata token-id)
    metadata (get revealed metadata)
    false))

(define-read-only (get-rarity-score (token-id uint))
  (default-to u0 (map-get? rarity-scores token-id)))

(define-read-only (get-token-traits (token-id uint))
  (map-get? token-traits token-id))

(define-read-only (get-delegate-info (owner principal) (delegate principal))
  (map-get? delegates { owner: owner, delegate: delegate }))

(define-read-only (get-reveal-block)
  (var-get reveal-block))

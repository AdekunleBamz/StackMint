;; StacksMint NFT Contract
;; SIP-009 compliant NFT with batch minting, royalties, and metadata
;; Version: 2.0.0-alpha
;; Author: StacksMint Team
;; Upgrade: v2.a - Batch minting, royalties, burn, and freeze

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

;; ============================================================================
;; Configuration Constants
;; ============================================================================

(define-constant MAX_BATCH_SIZE u10)
(define-constant MAX_ROYALTY_PERCENT u100) ;; 10% in basis points / 10

;; ============================================================================
;; NFT Definition
;; ============================================================================

(define-non-fungible-token stacksmint-nft uint)

;; ============================================================================
;; Data Variables
;; ============================================================================

(define-data-var last-token-id uint u0)
(define-data-var total-burned uint u0)
(define-data-var minting-paused bool false)

;; ============================================================================
;; Data Maps
;; ============================================================================

;; Token URI storage
(define-map token-uris uint (string-ascii 256))

;; Token metadata (creator, royalty, etc.)
(define-map token-metadata uint {
  creator: principal,
  royalty-percent: uint,
  created-at: uint,
  collection-id: (optional uint)
})

;; Frozen tokens (cannot be transferred)
(define-map frozen-tokens uint bool)

;; Approved operators for transfers
(define-map token-approvals uint principal)

;; Operator approvals (approve all)
(define-map operator-approvals { owner: principal, operator: principal } bool)

;; ============================================================================
;; Authorization Helpers
;; ============================================================================

(define-private (is-owner-or-approved (token-id uint) (sender principal))
  (let ((owner (unwrap! (nft-get-owner? stacksmint-nft token-id) false)))
    (or 
      (is-eq sender owner)
      (is-eq (some sender) (map-get? token-approvals token-id))
      (default-to false (map-get? operator-approvals { owner: owner, operator: sender })))))

(define-private (is-token-frozen (token-id uint))
  (default-to false (map-get? frozen-tokens token-id)))

;; ============================================================================
;; Minting Functions
;; ============================================================================

;; Mint single NFT
(define-public (mint (uri (string-ascii 256)))
  (mint-with-royalty uri u0))

;; Mint with royalty percentage
(define-public (mint-with-royalty (uri (string-ascii 256)) (royalty-percent uint))
  (begin
    (asserts! (not (var-get minting-paused)) ERR_NOT_AUTHORIZED)
    (asserts! (<= royalty-percent MAX_ROYALTY_PERCENT) ERR_INVALID_ROYALTY)
    (let ((token-id (+ (var-get last-token-id) u1)))
      (try! (contract-call? .stacksmint-treasury collect-fee))
      (try! (nft-mint? stacksmint-nft token-id tx-sender))
      (map-set token-uris token-id uri)
      (map-set token-metadata token-id {
        creator: tx-sender,
        royalty-percent: royalty-percent,
        created-at: block-height,
        collection-id: none
      })
      (var-set last-token-id token-id)
      (ok token-id))))

;; Mint to collection
(define-public (mint-to-collection (uri (string-ascii 256)) (collection-id uint) (royalty-percent uint))
  (begin
    (asserts! (not (var-get minting-paused)) ERR_NOT_AUTHORIZED)
    (asserts! (<= royalty-percent MAX_ROYALTY_PERCENT) ERR_INVALID_ROYALTY)
    (let ((token-id (+ (var-get last-token-id) u1)))
      (try! (contract-call? .stacksmint-treasury collect-fee))
      (try! (nft-mint? stacksmint-nft token-id tx-sender))
      (map-set token-uris token-id uri)
      (map-set token-metadata token-id {
        creator: tx-sender,
        royalty-percent: royalty-percent,
        created-at: block-height,
        collection-id: (some collection-id)
      })
      (var-set last-token-id token-id)
      (ok token-id))))

;; ============================================================================
;; Transfer Functions
;; ============================================================================

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_NOT_OWNER)
    (asserts! (not (is-token-frozen token-id)) ERR_TOKEN_FROZEN)
    ;; Clear any approvals on transfer
    (map-delete token-approvals token-id)
    (nft-transfer? stacksmint-nft token-id sender recipient)))

;; Transfer with operator support
(define-public (transfer-from (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-owner-or-approved token-id tx-sender) ERR_NOT_AUTHORIZED)
    (asserts! (not (is-token-frozen token-id)) ERR_TOKEN_FROZEN)
    (map-delete token-approvals token-id)
    (nft-transfer? stacksmint-nft token-id sender recipient)))

;; ============================================================================
;; Approval Functions
;; ============================================================================

(define-public (approve (token-id uint) (approved principal))
  (let ((owner (unwrap! (nft-get-owner? stacksmint-nft token-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender owner) ERR_NOT_OWNER)
    (map-set token-approvals token-id approved)
    (ok true)))

(define-public (set-approval-for-all (operator principal) (approved bool))
  (begin
    (map-set operator-approvals { owner: tx-sender, operator: operator } approved)
    (ok true)))

;; ============================================================================
;; Burn Function
;; ============================================================================

(define-public (burn (token-id uint))
  (let ((owner (unwrap! (nft-get-owner? stacksmint-nft token-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender owner) ERR_NOT_OWNER)
    (asserts! (not (is-token-frozen token-id)) ERR_TOKEN_FROZEN)
    (try! (nft-burn? stacksmint-nft token-id owner))
    (var-set total-burned (+ (var-get total-burned) u1))
    (ok true)))

;; ============================================================================
;; Freeze Functions (for legal/security compliance)
;; ============================================================================

(define-public (freeze-token (token-id uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (map-set frozen-tokens token-id true)
    (ok true)))

(define-public (unfreeze-token (token-id uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (map-delete frozen-tokens token-id)
    (ok true)))

;; ============================================================================
;; Admin Functions
;; ============================================================================

(define-public (set-minting-paused (paused bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (var-set minting-paused paused)
    (ok paused)))

;; ============================================================================
;; Read-Only Functions
;; ============================================================================

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok (map-get? token-uris token-id)))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? stacksmint-nft token-id)))

(define-read-only (get-token-metadata (token-id uint))
  (map-get? token-metadata token-id))

(define-read-only (get-approved (token-id uint))
  (map-get? token-approvals token-id))

(define-read-only (is-approved-for-all (owner principal) (operator principal))
  (default-to false (map-get? operator-approvals { owner: owner, operator: operator })))

(define-read-only (get-total-supply)
  (- (var-get last-token-id) (var-get total-burned)))

(define-read-only (get-total-burned)
  (var-get total-burned))

(define-read-only (is-frozen (token-id uint))
  (is-token-frozen token-id))

(define-read-only (is-minting-paused)
  (var-get minting-paused))

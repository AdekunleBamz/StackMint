;; StacksMint Collection Contract v2.1
;; NFT collection management with metadata, royalties, allowlists, and analytics
;; Version: 2.1.0
;; Author: StacksMint Team
;; Upgrade: v2.1 - Allowlists, mint phases, collection analytics, airdrops

;; ============================================================================
;; Error Constants
;; ============================================================================

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_OWNER (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_COLLECTION_EXISTS (err u102))
(define-constant ERR_MAX_SUPPLY_REACHED (err u103))
(define-constant ERR_INVALID_NAME (err u104))
(define-constant ERR_NOT_CREATOR (err u105))
(define-constant ERR_COLLECTION_LOCKED (err u106))
(define-constant ERR_INVALID_ROYALTY (err u107))
(define-constant ERR_MINTING_CLOSED (err u108))
(define-constant ERR_NOT_ALLOWLISTED (err u109))
(define-constant ERR_PHASE_NOT_ACTIVE (err u110))
(define-constant ERR_MINT_LIMIT_REACHED (err u111))
(define-constant ERR_INVALID_PHASE (err u112))
(define-constant ERR_AIRDROP_FAILED (err u113))

;; ============================================================================
;; Configuration Constants
;; ============================================================================

(define-constant MAX_ROYALTY_PERCENT u100)     ;; 10% max royalty
(define-constant MIN_NAME_LENGTH u3)
(define-constant MAX_DESCRIPTION_LENGTH u500)
(define-constant MAX_AIRDROP_SIZE u50)

;; Mint phases
(define-constant PHASE_CLOSED u0)
(define-constant PHASE_ALLOWLIST u1)
(define-constant PHASE_PUBLIC u2)

;; ============================================================================
;; Data Variables
;; ============================================================================

(define-data-var collection-counter uint u0)
(define-data-var total-minted-all uint u0)

;; ============================================================================
;; Data Maps
;; ============================================================================

;; Collection core data
(define-map collections uint {
  name: (string-ascii 64),
  creator: principal,
  max-supply: uint,
  minted-count: uint,
  royalty-percent: uint,
  created-at: uint,
  is-locked: bool,
  minting-open: bool,
  mint-price: uint,
  current-phase: uint
})

;; Collection metadata
(define-map collection-metadata uint {
  description: (string-ascii 500),
  image-uri: (string-ascii 256),
  banner-uri: (string-ascii 256),
  website: (string-ascii 128),
  twitter: (string-ascii 64),
  discord: (string-ascii 64)
})

;; Verified collections (by platform admin)
(define-map verified-collections uint bool)

;; Collection statistics
(define-map collection-stats uint {
  floor-price: uint,
  total-volume: uint,
  total-sales: uint,
  unique-owners: uint,
  listed-count: uint,
  average-price: uint
})

;; Track collection ownership
(define-map collection-ownership { collection-id: uint, owner: principal } uint)

;; Allowlist for mint phases
(define-map allowlists { collection-id: uint, user: principal } {
  spots: uint,
  minted: uint,
  phase: uint
})

;; Mint limits per wallet
(define-map mint-limits { collection-id: uint, wallet: principal } {
  total-minted: uint,
  allowlist-minted: uint,
  public-minted: uint
})

;; Collection mint phases
(define-map mint-phases { collection-id: uint, phase: uint } {
  start-block: uint,
  end-block: uint,
  price: uint,
  max-per-wallet: uint
})

;; Airdrop recipients
(define-map airdrop-recipients { collection-id: uint, recipient: principal } uint)

;; ============================================================================
;; Authorization Helpers
;; ============================================================================

(define-private (is-collection-creator (collection-id uint))
  (match (map-get? collections collection-id)
    collection (is-eq tx-sender (get creator collection))
    false))

(define-private (is-phase-active (collection-id uint) (phase uint))
  (match (map-get? mint-phases { collection-id: collection-id, phase: phase })
    phase-data (and 
      (>= block-height (get start-block phase-data))
      (< block-height (get end-block phase-data)))
    false))

(define-private (is-on-allowlist (collection-id uint) (user principal))
  (match (map-get? allowlists { collection-id: collection-id, user: user })
    entry (> (get spots entry) (get minted entry))
    false))

;; ============================================================================
;; Collection Management Functions
;; ============================================================================

;; Create new collection
(define-public (create-collection (name (string-ascii 64)) (max-supply uint))
  (create-collection-full name max-supply u0 u1000000 "" "" "" "" "" ""))

;; Create collection with full metadata
(define-public (create-collection-full 
  (name (string-ascii 64))
  (max-supply uint)
  (royalty-percent uint)
  (mint-price uint)
  (description (string-ascii 500))
  (image-uri (string-ascii 256))
  (banner-uri (string-ascii 256))
  (website (string-ascii 128))
  (twitter (string-ascii 64))
  (discord (string-ascii 64)))
  (begin
    (asserts! (>= (len name) MIN_NAME_LENGTH) ERR_INVALID_NAME)
    (asserts! (<= royalty-percent MAX_ROYALTY_PERCENT) ERR_INVALID_ROYALTY)
    (let ((collection-id (+ (var-get collection-counter) u1)))
      (try! (contract-call? .stacksmint-treasury-v2-1 collect-fee))
      (map-set collections collection-id {
        name: name,
        creator: tx-sender,
        max-supply: max-supply,
        minted-count: u0,
        royalty-percent: royalty-percent,
        created-at: block-height,
        is-locked: false,
        minting-open: false,
        mint-price: mint-price,
        current-phase: PHASE_CLOSED
      })
      (map-set collection-metadata collection-id {
        description: description,
        image-uri: image-uri,
        banner-uri: banner-uri,
        website: website,
        twitter: twitter,
        discord: discord
      })
      (map-set collection-stats collection-id {
        floor-price: u0,
        total-volume: u0,
        total-sales: u0,
        unique-owners: u0,
        listed-count: u0,
        average-price: u0
      })
      (var-set collection-counter collection-id)
      (ok collection-id))))

;; ============================================================================
;; Mint Phase Functions
;; ============================================================================

;; Set mint phase
(define-public (set-mint-phase 
  (collection-id uint) 
  (phase uint) 
  (start-block uint) 
  (end-block uint) 
  (price uint)
  (max-per-wallet uint))
  (begin
    (asserts! (is-collection-creator collection-id) ERR_NOT_CREATOR)
    (asserts! (and (>= phase PHASE_CLOSED) (<= phase PHASE_PUBLIC)) ERR_INVALID_PHASE)
    (map-set mint-phases { collection-id: collection-id, phase: phase } {
      start-block: start-block,
      end-block: end-block,
      price: price,
      max-per-wallet: max-per-wallet
    })
    (ok true)))

;; Activate phase
(define-public (activate-phase (collection-id uint) (phase uint))
  (let ((collection (unwrap! (map-get? collections collection-id) ERR_NOT_FOUND)))
    (asserts! (is-collection-creator collection-id) ERR_NOT_CREATOR)
    (map-set collections collection-id (merge collection { 
      current-phase: phase,
      minting-open: (> phase PHASE_CLOSED)
    }))
    (ok phase)))

;; ============================================================================
;; Allowlist Functions
;; ============================================================================

;; Add to allowlist (single)
(define-public (add-to-allowlist (collection-id uint) (user principal) (spots uint))
  (begin
    (asserts! (is-collection-creator collection-id) ERR_NOT_CREATOR)
    (map-set allowlists { collection-id: collection-id, user: user } {
      spots: spots,
      minted: u0,
      phase: PHASE_ALLOWLIST
    })
    (ok true)))

;; Add multiple to allowlist
(define-public (batch-add-allowlist 
  (collection-id uint) 
  (users (list 50 { user: principal, spots: uint })))
  (begin
    (asserts! (is-collection-creator collection-id) ERR_NOT_CREATOR)
    (fold add-allowlist-iter users (ok collection-id))))

(define-private (add-allowlist-iter 
  (entry { user: principal, spots: uint }) 
  (prev (response uint uint)))
  (match prev
    collection-id (begin
      (map-set allowlists { collection-id: collection-id, user: (get user entry) } {
        spots: (get spots entry),
        minted: u0,
        phase: PHASE_ALLOWLIST
      })
      (ok collection-id))
    err prev))

;; Remove from allowlist
(define-public (remove-from-allowlist (collection-id uint) (user principal))
  (begin
    (asserts! (is-collection-creator collection-id) ERR_NOT_CREATOR)
    (map-delete allowlists { collection-id: collection-id, user: user })
    (ok true)))

;; ============================================================================
;; Minting Functions
;; ============================================================================

;; Mint from collection (respects phases)
(define-public (mint-from-collection (collection-id uint))
  (let ((collection (unwrap! (map-get? collections collection-id) ERR_NOT_FOUND))
        (current-phase (get current-phase collection)))
    (asserts! (get minting-open collection) ERR_MINTING_CLOSED)
    (asserts! (not (get is-locked collection)) ERR_COLLECTION_LOCKED)
    (asserts! (< (get minted-count collection) (get max-supply collection)) ERR_MAX_SUPPLY_REACHED)
    
    ;; Check phase requirements
    (if (is-eq current-phase PHASE_ALLOWLIST)
      (begin
        (asserts! (is-on-allowlist collection-id tx-sender) ERR_NOT_ALLOWLISTED)
        (mint-allowlist collection-id collection))
      (if (is-eq current-phase PHASE_PUBLIC)
        (mint-public collection-id collection)
        ERR_PHASE_NOT_ACTIVE))))

;; Allowlist mint logic
(define-private (mint-allowlist (collection-id uint) (collection {
  name: (string-ascii 64),
  creator: principal,
  max-supply: uint,
  minted-count: uint,
  royalty-percent: uint,
  created-at: uint,
  is-locked: bool,
  minting-open: bool,
  mint-price: uint,
  current-phase: uint
}))
  (let ((allowlist-entry (unwrap! (map-get? allowlists { collection-id: collection-id, user: tx-sender }) ERR_NOT_ALLOWLISTED))
        (phase-data (map-get? mint-phases { collection-id: collection-id, phase: PHASE_ALLOWLIST })))
    (asserts! (< (get minted allowlist-entry) (get spots allowlist-entry)) ERR_MINT_LIMIT_REACHED)
    
    ;; Get mint price
    (let ((mint-price (match phase-data data (get price data) (get mint-price collection))))
      ;; Pay mint price
      (try! (stx-transfer? mint-price tx-sender (get creator collection)))
      ;; Collect platform fee
      (try! (contract-call? .stacksmint-treasury-v2-1 collect-fee))
      
      ;; Update allowlist entry
      (map-set allowlists { collection-id: collection-id, user: tx-sender }
        (merge allowlist-entry { minted: (+ (get minted allowlist-entry) u1) }))
      
      ;; Update collection stats
      (map-set collections collection-id 
        (merge collection { minted-count: (+ (get minted-count collection) u1) }))
      (var-set total-minted-all (+ (var-get total-minted-all) u1))
      
      ;; Track mint
      (update-mint-tracking collection-id tx-sender true)
      
      (ok (get minted-count collection)))))

;; Public mint logic
(define-private (mint-public (collection-id uint) (collection {
  name: (string-ascii 64),
  creator: principal,
  max-supply: uint,
  minted-count: uint,
  royalty-percent: uint,
  created-at: uint,
  is-locked: bool,
  minting-open: bool,
  mint-price: uint,
  current-phase: uint
}))
  (let ((phase-data (map-get? mint-phases { collection-id: collection-id, phase: PHASE_PUBLIC }))
        (limits (default-to { total-minted: u0, allowlist-minted: u0, public-minted: u0 }
          (map-get? mint-limits { collection-id: collection-id, wallet: tx-sender }))))
    
    ;; Check wallet limit
    (match phase-data 
      data (asserts! (< (get public-minted limits) (get max-per-wallet data)) ERR_MINT_LIMIT_REACHED)
      true)
    
    ;; Get mint price
    (let ((mint-price (match phase-data data (get price data) (get mint-price collection))))
      ;; Pay mint price
      (try! (stx-transfer? mint-price tx-sender (get creator collection)))
      ;; Collect platform fee
      (try! (contract-call? .stacksmint-treasury-v2-1 collect-fee))
      
      ;; Update collection stats
      (map-set collections collection-id 
        (merge collection { minted-count: (+ (get minted-count collection) u1) }))
      (var-set total-minted-all (+ (var-get total-minted-all) u1))
      
      ;; Track mint
      (update-mint-tracking collection-id tx-sender false)
      
      (ok (get minted-count collection)))))

;; Update mint tracking
(define-private (update-mint-tracking (collection-id uint) (wallet principal) (is-allowlist bool))
  (let ((current (default-to { total-minted: u0, allowlist-minted: u0, public-minted: u0 }
          (map-get? mint-limits { collection-id: collection-id, wallet: wallet }))))
    (map-set mint-limits { collection-id: collection-id, wallet: wallet } {
      total-minted: (+ (get total-minted current) u1),
      allowlist-minted: (if is-allowlist (+ (get allowlist-minted current) u1) (get allowlist-minted current)),
      public-minted: (if is-allowlist (get public-minted current) (+ (get public-minted current) u1))
    })
    true))

;; ============================================================================
;; Airdrop Functions
;; ============================================================================

;; Airdrop to multiple recipients
(define-public (airdrop 
  (collection-id uint) 
  (recipients (list 50 principal)))
  (let ((collection (unwrap! (map-get? collections collection-id) ERR_NOT_FOUND)))
    (asserts! (is-collection-creator collection-id) ERR_NOT_CREATOR)
    (asserts! (<= (len recipients) MAX_AIRDROP_SIZE) ERR_AIRDROP_FAILED)
    (asserts! (<= (+ (get minted-count collection) (len recipients)) (get max-supply collection)) ERR_MAX_SUPPLY_REACHED)
    
    ;; Process airdrops
    (fold airdrop-iter recipients (ok { collection-id: collection-id, count: u0 }))))

(define-private (airdrop-iter 
  (recipient principal) 
  (prev (response { collection-id: uint, count: uint } uint)))
  (match prev
    data (let ((collection (unwrap! (map-get? collections (get collection-id data)) ERR_NOT_FOUND)))
      ;; Update collection
      (map-set collections (get collection-id data)
        (merge collection { minted-count: (+ (get minted-count collection) u1) }))
      ;; Track airdrop
      (map-set airdrop-recipients { collection-id: (get collection-id data), recipient: recipient }
        (+ (default-to u0 (map-get? airdrop-recipients { collection-id: (get collection-id data), recipient: recipient })) u1))
      (var-set total-minted-all (+ (var-get total-minted-all) u1))
      (ok { collection-id: (get collection-id data), count: (+ (get count data) u1) }))
    err prev))

;; ============================================================================
;; Collection Update Functions
;; ============================================================================

;; Update metadata
(define-public (update-collection-metadata
  (collection-id uint)
  (description (string-ascii 500))
  (image-uri (string-ascii 256))
  (banner-uri (string-ascii 256))
  (website (string-ascii 128))
  (twitter (string-ascii 64))
  (discord (string-ascii 64)))
  (begin
    (asserts! (is-collection-creator collection-id) ERR_NOT_CREATOR)
    (map-set collection-metadata collection-id {
      description: description,
      image-uri: image-uri,
      banner-uri: banner-uri,
      website: website,
      twitter: twitter,
      discord: discord
    })
    (ok true)))

;; Set mint price
(define-public (set-mint-price (collection-id uint) (price uint))
  (let ((collection (unwrap! (map-get? collections collection-id) ERR_NOT_FOUND)))
    (asserts! (is-collection-creator collection-id) ERR_NOT_CREATOR)
    (map-set collections collection-id (merge collection { mint-price: price }))
    (ok price)))

;; Lock collection (permanent)
(define-public (lock-collection (collection-id uint))
  (let ((collection (unwrap! (map-get? collections collection-id) ERR_NOT_FOUND)))
    (asserts! (is-collection-creator collection-id) ERR_NOT_CREATOR)
    (map-set collections collection-id (merge collection { is-locked: true }))
    (ok true)))

;; ============================================================================
;; Stats Update Functions (called by marketplace)
;; ============================================================================

(define-public (update-collection-stats 
  (collection-id uint)
  (floor-price uint)
  (sale-volume uint))
  (let ((stats (default-to {
    floor-price: u0,
    total-volume: u0,
    total-sales: u0,
    unique-owners: u0,
    listed-count: u0,
    average-price: u0
  } (map-get? collection-stats collection-id))))
    (let ((new-volume (+ (get total-volume stats) sale-volume))
          (new-sales (+ (get total-sales stats) u1)))
      (map-set collection-stats collection-id (merge stats {
        floor-price: floor-price,
        total-volume: new-volume,
        total-sales: new-sales,
        average-price: (/ new-volume new-sales)
      }))
      (ok true))))

;; ============================================================================
;; Admin Functions
;; ============================================================================

;; Verify collection (platform admin only)
(define-public (verify-collection (collection-id uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (map-set verified-collections collection-id true)
    (ok true)))

;; Unverify collection
(define-public (unverify-collection (collection-id uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (map-delete verified-collections collection-id)
    (ok true)))

;; ============================================================================
;; Read-Only Functions
;; ============================================================================

(define-read-only (get-collection (collection-id uint))
  (map-get? collections collection-id))

(define-read-only (get-collection-metadata (collection-id uint))
  (map-get? collection-metadata collection-id))

(define-read-only (get-collection-stats (collection-id uint))
  (map-get? collection-stats collection-id))

(define-read-only (is-verified (collection-id uint))
  (default-to false (map-get? verified-collections collection-id)))

(define-read-only (get-allowlist-status (collection-id uint) (user principal))
  (map-get? allowlists { collection-id: collection-id, user: user }))

(define-read-only (get-mint-limits (collection-id uint) (wallet principal))
  (map-get? mint-limits { collection-id: collection-id, wallet: wallet }))

(define-read-only (get-mint-phase (collection-id uint) (phase uint))
  (map-get? mint-phases { collection-id: collection-id, phase: phase }))

(define-read-only (get-total-collections)
  (var-get collection-counter))

(define-read-only (get-total-minted)
  (var-get total-minted-all))

(define-read-only (get-collection-full (collection-id uint))
  {
    collection: (map-get? collections collection-id),
    metadata: (map-get? collection-metadata collection-id),
    stats: (map-get? collection-stats collection-id),
    is-verified: (default-to false (map-get? verified-collections collection-id))
  })

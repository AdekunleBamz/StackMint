;; StacksMint Collection Contract
;; NFT collection management with metadata, royalties, and minting control
;; Version: 2.0.0-alpha
;; Author: StacksMint Team
;; Upgrade: v2.a - Enhanced metadata, verified collections, and stats

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

;; ============================================================================
;; Configuration Constants
;; ============================================================================

(define-constant MAX_ROYALTY_PERCENT u100)     ;; 10% max royalty
(define-constant MIN_NAME_LENGTH u3)
(define-constant MAX_DESCRIPTION_LENGTH u500)

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
  minting-open: bool
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
  unique-owners: uint
})

;; Track collection ownership
(define-map collection-ownership { collection-id: uint, owner: principal } uint)

;; ============================================================================
;; Authorization Helpers
;; ============================================================================

(define-private (is-collection-creator (collection-id uint))
  (match (map-get? collections collection-id)
    collection (is-eq tx-sender (get creator collection))
    false))

;; ============================================================================
;; Collection Management Functions
;; ============================================================================

;; Create new collection
(define-public (create-collection (name (string-ascii 64)) (max-supply uint))
  (create-collection-full name max-supply u0 "" "" "" "" "" ""))

;; Create collection with full metadata
(define-public (create-collection-full 
  (name (string-ascii 64))
  (max-supply uint)
  (royalty-percent uint)
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
      (try! (contract-call? .stacksmint-treasury collect-fee))
      
      ;; Set core collection data
      (map-set collections collection-id {
        name: name,
        creator: tx-sender,
        max-supply: max-supply,
        minted-count: u0,
        royalty-percent: royalty-percent,
        created-at: block-height,
        is-locked: false,
        minting-open: true
      })
      
      ;; Set metadata
      (map-set collection-metadata collection-id {
        description: description,
        image-uri: image-uri,
        banner-uri: banner-uri,
        website: website,
        twitter: twitter,
        discord: discord
      })
      
      ;; Initialize stats
      (map-set collection-stats collection-id {
        floor-price: u0,
        total-volume: u0,
        total-sales: u0,
        unique-owners: u0
      })
      
      (var-set collection-counter collection-id)
      (ok collection-id))))

;; Update collection metadata (creator only)
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
    (let ((collection (unwrap! (map-get? collections collection-id) ERR_NOT_FOUND)))
      (asserts! (not (get is-locked collection)) ERR_COLLECTION_LOCKED)
      (map-set collection-metadata collection-id {
        description: description,
        image-uri: image-uri,
        banner-uri: banner-uri,
        website: website,
        twitter: twitter,
        discord: discord
      })
      (ok true))))

;; Lock collection (permanent, prevents metadata changes)
(define-public (lock-collection (collection-id uint))
  (begin
    (asserts! (is-collection-creator collection-id) ERR_NOT_CREATOR)
    (let ((collection (unwrap! (map-get? collections collection-id) ERR_NOT_FOUND)))
      (map-set collections collection-id (merge collection { is-locked: true }))
      (ok true))))

;; Toggle minting status
(define-public (set-minting-open (collection-id uint) (open bool))
  (begin
    (asserts! (is-collection-creator collection-id) ERR_NOT_CREATOR)
    (let ((collection (unwrap! (map-get? collections collection-id) ERR_NOT_FOUND)))
      (map-set collections collection-id (merge collection { minting-open: open }))
      (ok true))))

;; Increment minted count (called by NFT contract)
(define-public (increment-minted (collection-id uint))
  (let ((collection (unwrap! (map-get? collections collection-id) ERR_NOT_FOUND)))
    (asserts! (get minting-open collection) ERR_MINTING_CLOSED)
    (asserts! (< (get minted-count collection) (get max-supply collection)) ERR_MAX_SUPPLY_REACHED)
    (map-set collections collection-id 
      (merge collection { minted-count: (+ (get minted-count collection) u1) }))
    (var-set total-minted-all (+ (var-get total-minted-all) u1))
    (ok (+ (get minted-count collection) u1))))

;; ============================================================================
;; Admin Functions
;; ============================================================================

;; Verify collection (admin only)
(define-public (verify-collection (collection-id uint) (verified bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (map-set verified-collections collection-id verified)
    (ok true)))

;; Update collection stats (called by marketplace)
(define-public (update-stats (collection-id uint) (sale-price uint))
  (let ((stats (default-to 
    { floor-price: u0, total-volume: u0, total-sales: u0, unique-owners: u0 }
    (map-get? collection-stats collection-id))))
    (map-set collection-stats collection-id {
      floor-price: (get floor-price stats),
      total-volume: (+ (get total-volume stats) sale-price),
      total-sales: (+ (get total-sales stats) u1),
      unique-owners: (get unique-owners stats)
    })
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

(define-read-only (get-collection-count)
  (var-get collection-counter))

(define-read-only (get-total-minted)
  (var-get total-minted-all))

(define-read-only (get-remaining-supply (collection-id uint))
  (match (map-get? collections collection-id)
    collection (some (- (get max-supply collection) (get minted-count collection)))
    none))

(define-read-only (can-mint (collection-id uint))
  (match (map-get? collections collection-id)
    collection (and 
      (get minting-open collection)
      (< (get minted-count collection) (get max-supply collection)))
    false))

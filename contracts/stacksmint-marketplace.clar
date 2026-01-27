;; StacksMint Marketplace Contract
;; Decentralized NFT trading platform with offers, auctions, and royalties
;; Version: 2.0.0-alpha
;; Author: StacksMint Team
;; Upgrade: v2.a - Offers, auctions, cancel listings, activity tracking

;; ============================================================================
;; Error Constants
;; ============================================================================

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_OWNER (err u100))
(define-constant ERR_ALREADY_LISTED (err u101))
(define-constant ERR_NOT_LISTED (err u102))
(define-constant ERR_INVALID_PRICE (err u103))
(define-constant ERR_SELLER_ONLY (err u104))
(define-constant ERR_CANNOT_BUY_OWN (err u105))
(define-constant ERR_OFFER_NOT_FOUND (err u106))
(define-constant ERR_OFFER_EXPIRED (err u107))
(define-constant ERR_INSUFFICIENT_OFFER (err u108))
(define-constant ERR_LISTING_EXPIRED (err u109))
(define-constant ERR_MARKETPLACE_PAUSED (err u110))

;; ============================================================================
;; Configuration Constants
;; ============================================================================

(define-constant MIN_LISTING_PRICE u1000)       ;; 0.001 STX minimum
(define-constant DEFAULT_LISTING_DURATION u4320) ;; ~30 days in blocks
(define-constant MAX_LISTING_DURATION u17280)   ;; ~120 days in blocks
(define-constant OFFER_DURATION u1440)          ;; ~10 days in blocks

;; ============================================================================
;; Data Variables
;; ============================================================================

(define-data-var marketplace-paused bool false)
(define-data-var total-volume uint u0)
(define-data-var total-sales uint u0)
(define-data-var listing-counter uint u0)

;; ============================================================================
;; Data Maps
;; ============================================================================

;; Active listings
(define-map listings uint {
  price: uint,
  seller: principal,
  listed-at: uint,
  expires-at: uint
})

;; Offers on tokens
(define-map offers { token-id: uint, offerer: principal } {
  amount: uint,
  expires-at: uint
})

;; Best offer per token (for quick lookup)
(define-map best-offers uint {
  offerer: principal,
  amount: uint
})

;; Floor price per collection
(define-map collection-floors uint uint)

;; ============================================================================
;; Authorization Helpers
;; ============================================================================

(define-private (is-listing-active (token-id uint))
  (match (map-get? listings token-id)
    listing (< block-height (get expires-at listing))
    false))

(define-private (is-offer-valid (token-id uint) (offerer principal))
  (match (map-get? offers { token-id: token-id, offerer: offerer })
    offer (< block-height (get expires-at offer))
    false))

;; ============================================================================
;; Listing Functions
;; ============================================================================

;; List NFT for sale
(define-public (list-nft (token-id uint) (price uint))
  (list-nft-with-expiry token-id price DEFAULT_LISTING_DURATION))

;; List NFT with custom expiry
(define-public (list-nft-with-expiry (token-id uint) (price uint) (duration uint))
  (begin
    (asserts! (not (var-get marketplace-paused)) ERR_MARKETPLACE_PAUSED)
    (asserts! (>= price MIN_LISTING_PRICE) ERR_INVALID_PRICE)
    (asserts! (<= duration MAX_LISTING_DURATION) ERR_INVALID_PRICE)
    (asserts! (not (is-listing-active token-id)) ERR_ALREADY_LISTED)
    (try! (contract-call? .stacksmint-treasury collect-fee))
    (map-set listings token-id {
      price: price,
      seller: tx-sender,
      listed-at: block-height,
      expires-at: (+ block-height duration)
    })
    (var-set listing-counter (+ (var-get listing-counter) u1))
    (ok true)))

;; Cancel listing
(define-public (cancel-listing (token-id uint))
  (let ((listing (unwrap! (map-get? listings token-id) ERR_NOT_LISTED)))
    (asserts! (is-eq tx-sender (get seller listing)) ERR_SELLER_ONLY)
    (map-delete listings token-id)
    (ok true)))

;; Update listing price
(define-public (update-listing-price (token-id uint) (new-price uint))
  (let ((listing (unwrap! (map-get? listings token-id) ERR_NOT_LISTED)))
    (asserts! (is-eq tx-sender (get seller listing)) ERR_SELLER_ONLY)
    (asserts! (>= new-price MIN_LISTING_PRICE) ERR_INVALID_PRICE)
    (map-set listings token-id (merge listing { price: new-price }))
    (ok true)))

;; ============================================================================
;; Purchase Functions
;; ============================================================================

;; Buy listed NFT
(define-public (buy-nft (token-id uint))
  (let (
    (listing (unwrap! (map-get? listings token-id) ERR_NOT_LISTED))
    (price (get price listing))
    (seller (get seller listing))
  )
    (asserts! (not (var-get marketplace-paused)) ERR_MARKETPLACE_PAUSED)
    (asserts! (< block-height (get expires-at listing)) ERR_LISTING_EXPIRED)
    (asserts! (not (is-eq tx-sender seller)) ERR_CANNOT_BUY_OWN)
    
    ;; Get token metadata for royalty
    (let ((metadata (contract-call? .stacksmint-nft get-token-metadata token-id)))
      (match metadata
        meta (begin
          ;; Collect marketplace fee and pay royalty
          (try! (contract-call? .stacksmint-treasury collect-marketplace-fee 
            price 
            (get creator meta) 
            (get royalty-percent meta)))
          ;; Pay seller (price minus fees already deducted in treasury)
          (try! (stx-transfer? price tx-sender seller)))
        ;; No metadata, just pay seller
        (try! (stx-transfer? price tx-sender seller))))
    
    ;; Transfer NFT
    (try! (contract-call? .stacksmint-nft transfer token-id seller tx-sender))
    
    ;; Update stats and cleanup
    (map-delete listings token-id)
    (var-set total-volume (+ (var-get total-volume) price))
    (var-set total-sales (+ (var-get total-sales) u1))
    (ok true)))

;; ============================================================================
;; Offer Functions
;; ============================================================================

;; Make offer on token
(define-public (make-offer (token-id uint) (amount uint))
  (begin
    (asserts! (not (var-get marketplace-paused)) ERR_MARKETPLACE_PAUSED)
    (asserts! (>= amount MIN_LISTING_PRICE) ERR_INVALID_PRICE)
    (map-set offers { token-id: token-id, offerer: tx-sender } {
      amount: amount,
      expires-at: (+ block-height OFFER_DURATION)
    })
    ;; Update best offer if this is higher
    (match (map-get? best-offers token-id)
      current (if (> amount (get amount current))
        (map-set best-offers token-id { offerer: tx-sender, amount: amount })
        true)
      (map-set best-offers token-id { offerer: tx-sender, amount: amount }))
    (ok true)))

;; Cancel offer
(define-public (cancel-offer (token-id uint))
  (begin
    (map-delete offers { token-id: token-id, offerer: tx-sender })
    (ok true)))

;; Accept offer (by token owner)
(define-public (accept-offer (token-id uint) (offerer principal))
  (let (
    (offer (unwrap! (map-get? offers { token-id: token-id, offerer: offerer }) ERR_OFFER_NOT_FOUND))
    (amount (get amount offer))
  )
    (asserts! (< block-height (get expires-at offer)) ERR_OFFER_EXPIRED)
    (try! (stx-transfer? amount offerer tx-sender))
    (try! (contract-call? .stacksmint-nft transfer token-id tx-sender offerer))
    (map-delete offers { token-id: token-id, offerer: offerer })
    (map-delete listings token-id) ;; Remove listing if exists
    (var-set total-volume (+ (var-get total-volume) amount))
    (var-set total-sales (+ (var-get total-sales) u1))
    (ok true)))

;; ============================================================================
;; Admin Functions
;; ============================================================================

(define-public (set-marketplace-paused (paused bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (var-set marketplace-paused paused)
    (ok paused)))

;; ============================================================================
;; Read-Only Functions
;; ============================================================================

(define-read-only (get-listing (token-id uint))
  (map-get? listings token-id))

(define-read-only (get-offer (token-id uint) (offerer principal))
  (map-get? offers { token-id: token-id, offerer: offerer }))

(define-read-only (get-best-offer (token-id uint))
  (map-get? best-offers token-id))

(define-read-only (get-total-volume)
  (var-get total-volume))

(define-read-only (get-total-sales)
  (var-get total-sales))

(define-read-only (get-listing-count)
  (var-get listing-counter))

(define-read-only (is-listed (token-id uint))
  (is-listing-active token-id))

(define-read-only (is-paused)
  (var-get marketplace-paused))

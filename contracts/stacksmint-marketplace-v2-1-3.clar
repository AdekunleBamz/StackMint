;; StacksMint Marketplace Contract v2.1
;; Decentralized NFT trading platform with offers, auctions, bundles, and analytics
;; Version: 2.1.0
;; Author: StacksMint Team
;; Upgrade: v2.1 - Bundle sales, auction system, price history, escrow

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
(define-constant ERR_AUCTION_ACTIVE (err u111))
(define-constant ERR_AUCTION_ENDED (err u112))
(define-constant ERR_BID_TOO_LOW (err u113))
(define-constant ERR_BUNDLE_EMPTY (err u114))
(define-constant ERR_BUNDLE_TOO_LARGE (err u115))
(define-constant ERR_ESCROW_LOCKED (err u116))
(define-constant ERR_NOT_BIDDER (err u117))

;; ============================================================================
;; Configuration Constants
;; ============================================================================

(define-constant MIN_LISTING_PRICE u1000)       ;; 0.001 STX minimum
(define-constant DEFAULT_LISTING_DURATION u4320) ;; ~30 days in blocks
(define-constant MAX_LISTING_DURATION u17280)   ;; ~120 days in blocks
(define-constant OFFER_DURATION u1440)          ;; ~10 days in blocks
(define-constant MIN_BID_INCREMENT u50)         ;; 5% minimum bid increment
(define-constant MAX_BUNDLE_SIZE u10)           ;; Maximum NFTs per bundle
(define-constant AUCTION_EXTENSION u72)         ;; ~12 hours extension on last-minute bids

;; ============================================================================
;; Data Variables
;; ============================================================================

(define-data-var marketplace-paused bool false)
(define-data-var total-volume uint u0)
(define-data-var total-sales uint u0)
(define-data-var listing-counter uint u0)
(define-data-var auction-counter uint u0)
(define-data-var bundle-counter uint u0)

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

;; Auctions
(define-map auctions uint {
  token-id: uint,
  seller: principal,
  reserve-price: uint,
  current-bid: uint,
  highest-bidder: (optional principal),
  start-block: uint,
  end-block: uint,
  settled: bool
})

;; Auction bids (for refunds)
(define-map auction-bids { auction-id: uint, bidder: principal } uint)

;; Bundle listings
(define-map bundles uint {
  token-ids: (list 10 uint),
  seller: principal,
  price: uint,
  listed-at: uint,
  expires-at: uint
})

;; Price history (last 10 sales per token)
(define-map price-history uint (list 10 { price: uint, block: uint, buyer: principal }))

;; Escrow balances
(define-map escrow-balances principal uint)

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

(define-private (is-auction-active (auction-id uint))
  (match (map-get? auctions auction-id)
    auction (and 
      (>= block-height (get start-block auction))
      (< block-height (get end-block auction))
      (not (get settled auction)))
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
    (try! (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-treasury-v2-1 collect-fee))
    (var-set listing-counter (+ (var-get listing-counter) u1))
    (map-set listings token-id {
      price: price,
      seller: tx-sender,
      listed-at: block-height,
      expires-at: (+ block-height duration)
    })
    (ok token-id)))

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
    (ok new-price)))

;; Buy listed NFT
(define-public (buy-nft (token-id uint))
  (let ((listing (unwrap! (map-get? listings token-id) ERR_NOT_LISTED)))
    (asserts! (is-listing-active token-id) ERR_LISTING_EXPIRED)
    (asserts! (not (is-eq tx-sender (get seller listing))) ERR_CANNOT_BUY_OWN)
    (let ((price (get price listing))
          (seller (get seller listing))
          (metadata (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-nft-v2-1-3 get-token-metadata token-id))
          (royalty-percent (match metadata data (get royalty-percent data) u0))
          (creator (match metadata data (get creator data) seller)))
      ;; Collect marketplace fee and royalty
      (try! (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-treasury-v2-1 collect-marketplace-fee price creator royalty-percent))
      ;; Calculate net payment to seller
      (let ((marketplace-fee (/ (* price u25) u1000))
            (royalty (/ (* price royalty-percent) u1000))
            (net-payment (- price (+ marketplace-fee royalty))))
        ;; Transfer payment to seller
        (try! (stx-transfer? net-payment tx-sender seller))
        ;; Transfer NFT
        (try! (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-nft-v2-1-3 transfer token-id seller tx-sender))
        ;; Update stats
        (var-set total-volume (+ (var-get total-volume) price))
        (var-set total-sales (+ (var-get total-sales) u1))
        ;; Record price history
        (record-sale token-id price tx-sender)
        ;; Clean up listing
        (map-delete listings token-id)
        (ok { token-id: token-id, price: price, seller: seller, buyer: tx-sender })))))

;; ============================================================================
;; Offer Functions
;; ============================================================================

;; Make offer on NFT
(define-public (make-offer (token-id uint) (amount uint))
  (begin
    (asserts! (>= amount MIN_LISTING_PRICE) ERR_INVALID_PRICE)
    ;; Lock funds in escrow
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set escrow-balances tx-sender (+ (default-to u0 (map-get? escrow-balances tx-sender)) amount))
    (map-set offers { token-id: token-id, offerer: tx-sender } {
      amount: amount,
      expires-at: (+ block-height OFFER_DURATION)
    })
    ;; Update best offer if higher
    (match (map-get? best-offers token-id)
      current (if (> amount (get amount current))
        (map-set best-offers token-id { offerer: tx-sender, amount: amount })
        true)
      (map-set best-offers token-id { offerer: tx-sender, amount: amount }))
    (ok amount)))

;; Cancel offer and get refund
(define-public (cancel-offer (token-id uint))
  (let ((offer (unwrap! (map-get? offers { token-id: token-id, offerer: tx-sender }) ERR_OFFER_NOT_FOUND)))
    ;; Refund from escrow
    (try! (as-contract (stx-transfer? (get amount offer) tx-sender tx-sender)))
    (map-set escrow-balances tx-sender 
      (- (default-to u0 (map-get? escrow-balances tx-sender)) (get amount offer)))
    (map-delete offers { token-id: token-id, offerer: tx-sender })
    (ok true)))

;; Accept offer
(define-public (accept-offer (token-id uint) (offerer principal))
  (let ((offer (unwrap! (map-get? offers { token-id: token-id, offerer: offerer }) ERR_OFFER_NOT_FOUND)))
    (asserts! (is-offer-valid token-id offerer) ERR_OFFER_EXPIRED)
    (let ((amount (get amount offer))
          (metadata (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-nft-v2-1-3 get-token-metadata token-id))
          (royalty-percent (match metadata data (get royalty-percent data) u0))
          (creator (match metadata data (get creator data) tx-sender)))
      ;; Collect fees from escrow
      (try! (as-contract (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-treasury-v2-1 collect-marketplace-fee amount creator royalty-percent)))
      ;; Calculate net payment
      (let ((marketplace-fee (/ (* amount u25) u1000))
            (royalty (/ (* amount royalty-percent) u1000))
            (net-payment (- amount (+ marketplace-fee royalty))))
        ;; Transfer payment from escrow to seller
        (try! (as-contract (stx-transfer? net-payment tx-sender tx-sender)))
        ;; Transfer NFT
        (try! (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-nft-v2-1-3 transfer token-id tx-sender offerer))
        ;; Update stats
        (var-set total-volume (+ (var-get total-volume) amount))
        (var-set total-sales (+ (var-get total-sales) u1))
        ;; Record price history
        (record-sale token-id amount offerer)
        ;; Clean up
        (map-delete offers { token-id: token-id, offerer: offerer })
        (map-set escrow-balances offerer 
          (- (default-to u0 (map-get? escrow-balances offerer)) amount))
        (ok { token-id: token-id, price: amount, seller: tx-sender, buyer: offerer })))))

;; ============================================================================
;; Auction Functions
;; ============================================================================

;; Create auction
(define-public (create-auction (token-id uint) (reserve-price uint) (duration uint))
  (begin
    (asserts! (not (var-get marketplace-paused)) ERR_MARKETPLACE_PAUSED)
    (asserts! (>= reserve-price MIN_LISTING_PRICE) ERR_INVALID_PRICE)
    (asserts! (<= duration MAX_LISTING_DURATION) ERR_INVALID_PRICE)
    (asserts! (not (is-listing-active token-id)) ERR_ALREADY_LISTED)
    (let ((auction-id (+ (var-get auction-counter) u1)))
      (try! (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-treasury-v2-1 collect-fee))
      (map-set auctions auction-id {
        token-id: token-id,
        seller: tx-sender,
        reserve-price: reserve-price,
        current-bid: u0,
        highest-bidder: none,
        start-block: block-height,
        end-block: (+ block-height duration),
        settled: false
      })
      (var-set auction-counter auction-id)
      (ok auction-id))))

;; Place bid on auction
(define-public (place-bid (auction-id uint) (bid-amount uint))
  (let ((auction (unwrap! (map-get? auctions auction-id) ERR_NOT_LISTED)))
    (asserts! (is-auction-active auction-id) ERR_AUCTION_ENDED)
    (asserts! (not (is-eq tx-sender (get seller auction))) ERR_CANNOT_BUY_OWN)
    (let ((current-bid (get current-bid auction))
          (min-bid (if (is-eq current-bid u0)
            (get reserve-price auction)
            (+ current-bid (/ (* current-bid MIN_BID_INCREMENT) u1000)))))
      (asserts! (>= bid-amount min-bid) ERR_BID_TOO_LOW)
      ;; Refund previous bidder
      (match (get highest-bidder auction)
        prev-bidder (try! (as-contract (stx-transfer? current-bid tx-sender prev-bidder)))
        true)
      ;; Accept new bid (escrow)
      (try! (stx-transfer? bid-amount tx-sender (as-contract tx-sender)))
      ;; Extend auction if bid in last 12 hours
      (let ((new-end (if (< (- (get end-block auction) block-height) AUCTION_EXTENSION)
            (+ (get end-block auction) AUCTION_EXTENSION)
            (get end-block auction))))
        (map-set auctions auction-id (merge auction {
          current-bid: bid-amount,
          highest-bidder: (some tx-sender),
          end-block: new-end
        }))
        (map-set auction-bids { auction-id: auction-id, bidder: tx-sender } bid-amount)
        (ok bid-amount)))))

;; Settle auction
(define-public (settle-auction (auction-id uint))
  (let ((auction (unwrap! (map-get? auctions auction-id) ERR_NOT_LISTED)))
    (asserts! (>= block-height (get end-block auction)) ERR_AUCTION_ACTIVE)
    (asserts! (not (get settled auction)) ERR_AUCTION_ENDED)
    (match (get highest-bidder auction)
      winner (let (
          (token-id (get token-id auction))
          (final-price (get current-bid auction))
          (seller (get seller auction))
          (metadata (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-nft-v2-1-3 get-token-metadata token-id))
          (royalty-percent (match metadata data (get royalty-percent data) u0))
          (creator (match metadata data (get creator data) seller)))
        ;; Collect fees
        (try! (as-contract (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-treasury-v2-1 collect-marketplace-fee final-price creator royalty-percent)))
        ;; Calculate net payment
        (let ((marketplace-fee (/ (* final-price u25) u1000))
              (royalty (/ (* final-price royalty-percent) u1000))
              (net-payment (- final-price (+ marketplace-fee royalty))))
          ;; Transfer payment from escrow to seller
          (try! (as-contract (stx-transfer? net-payment tx-sender seller)))
          ;; Transfer NFT
          (try! (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-nft-v2-1-3 transfer token-id seller winner))
          ;; Update stats
          (var-set total-volume (+ (var-get total-volume) final-price))
          (var-set total-sales (+ (var-get total-sales) u1))
          ;; Record price history
          (record-sale token-id final-price winner)
          ;; Mark settled
          (map-set auctions auction-id (merge auction { settled: true }))
          (ok { auction-id: auction-id, winner: winner, price: final-price })))
      ;; No bids - just mark settled
      (begin
        (map-set auctions auction-id (merge auction { settled: true }))
        (ok { auction-id: auction-id, winner: (get seller auction), price: u0 })))))

;; ============================================================================
;; Bundle Functions
;; ============================================================================

;; Create bundle listing
(define-public (create-bundle (token-ids (list 10 uint)) (price uint))
  (begin
    (asserts! (not (var-get marketplace-paused)) ERR_MARKETPLACE_PAUSED)
    (asserts! (> (len token-ids) u0) ERR_BUNDLE_EMPTY)
    (asserts! (<= (len token-ids) MAX_BUNDLE_SIZE) ERR_BUNDLE_TOO_LARGE)
    (asserts! (>= price MIN_LISTING_PRICE) ERR_INVALID_PRICE)
    (let ((bundle-id (+ (var-get bundle-counter) u1)))
      (try! (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-treasury-v2-1 collect-fee))
      (map-set bundles bundle-id {
        token-ids: token-ids,
        seller: tx-sender,
        price: price,
        listed-at: block-height,
        expires-at: (+ block-height DEFAULT_LISTING_DURATION)
      })
      (var-set bundle-counter bundle-id)
      (ok bundle-id))))

;; Buy bundle
(define-public (buy-bundle (bundle-id uint))
  (let ((bundle (unwrap! (map-get? bundles bundle-id) ERR_NOT_LISTED)))
    (asserts! (< block-height (get expires-at bundle)) ERR_LISTING_EXPIRED)
    (asserts! (not (is-eq tx-sender (get seller bundle))) ERR_CANNOT_BUY_OWN)
    (let ((price (get price bundle))
          (seller (get seller bundle)))
      ;; Collect marketplace fee (no individual royalties for bundles)
      (try! (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-treasury-v2-1 collect-marketplace-fee price seller u0))
      (let ((marketplace-fee (/ (* price u25) u1000))
            (net-payment (- price marketplace-fee)))
        ;; Transfer payment
        (try! (stx-transfer? net-payment tx-sender seller))
        ;; Transfer all NFTs in bundle
        (try! (fold transfer-bundle-nft (get token-ids bundle) (ok seller)))
        ;; Update stats
        (var-set total-volume (+ (var-get total-volume) price))
        (var-set total-sales (+ (var-get total-sales) u1))
        ;; Clean up
        (map-delete bundles bundle-id)
        (ok { bundle-id: bundle-id, price: price })))))

(define-private (transfer-bundle-nft (token-id uint) (prev (response principal uint)))
  (match prev
    seller (match (contract-call? 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-nft-v2-1-3 transfer token-id seller tx-sender)
      result (ok seller)
      err prev)
    err prev))

;; ============================================================================
;; Price History Functions
;; ============================================================================

(define-private (record-sale (token-id uint) (price uint) (buyer principal))
  (let ((current-history (default-to (list) (map-get? price-history token-id)))
        (new-entry { price: price, block: block-height, buyer: buyer }))
    (match (as-max-len? (concat (list new-entry) current-history) u10)
      new-history (begin (map-set price-history token-id new-history) true)
      (begin (map-set price-history token-id current-history) true))))

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

(define-read-only (get-auction (auction-id uint))
  (map-get? auctions auction-id))

(define-read-only (get-bundle (bundle-id uint))
  (map-get? bundles bundle-id))

(define-read-only (get-price-history (token-id uint))
  (default-to (list) (map-get? price-history token-id)))

(define-read-only (get-escrow-balance (user principal))
  (default-to u0 (map-get? escrow-balances user)))

(define-read-only (get-total-volume)
  (var-get total-volume))

(define-read-only (get-total-sales)
  (var-get total-sales))

(define-read-only (get-marketplace-stats)
  {
    total-volume: (var-get total-volume),
    total-sales: (var-get total-sales),
    total-listings: (var-get listing-counter),
    total-auctions: (var-get auction-counter),
    total-bundles: (var-get bundle-counter),
    is-paused: (var-get marketplace-paused)
  })

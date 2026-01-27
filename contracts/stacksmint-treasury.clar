;; StacksMint Treasury Contract
;; Handles creator fee collection, royalty distribution, and platform revenue
;; Version: 2.0.0-alpha
;; Author: StacksMint Team
;; Upgrade: v2.a - Enhanced fee system with royalties and withdrawal

;; ============================================================================
;; Configuration Constants
;; ============================================================================

(define-constant CONTRACT_OWNER tx-sender)
(define-constant CREATOR_FEE u10000)           ;; 0.01 STX in microSTX
(define-constant MARKETPLACE_FEE_PERCENT u25)   ;; 2.5% marketplace fee (basis points / 10)
(define-constant MAX_ROYALTY_PERCENT u100)      ;; Maximum 10% royalty (in basis points / 10)
(define-constant MIN_WITHDRAWAL u100000)        ;; Minimum 0.1 STX withdrawal

;; ============================================================================
;; Error Constants
;; ============================================================================

(define-constant ERR_INSUFFICIENT_BALANCE (err u200))
(define-constant ERR_UNAUTHORIZED (err u201))
(define-constant ERR_INVALID_AMOUNT (err u202))
(define-constant ERR_INVALID_ROYALTY (err u203))
(define-constant ERR_WITHDRAW_FAILED (err u204))
(define-constant ERR_ZERO_AMOUNT (err u205))
(define-constant ERR_BELOW_MINIMUM (err u206))

;; ============================================================================
;; Data Variables
;; ============================================================================

(define-data-var total-fees-collected uint u0)
(define-data-var total-royalties-distributed uint u0)
(define-data-var treasury-balance uint u0)
(define-data-var fee-paused bool false)

;; ============================================================================
;; Data Maps
;; ============================================================================

;; Track royalty earnings per creator
(define-map creator-royalties principal uint)

;; Track pending withdrawals
(define-map pending-withdrawals principal uint)

;; ============================================================================
;; Authorization Checks
;; ============================================================================

(define-private (is-contract-owner)
  (is-eq tx-sender CONTRACT_OWNER))

;; ============================================================================
;; Public Functions
;; ============================================================================

;; Collect standard minting fee
(define-public (collect-fee)
  (begin
    (asserts! (not (var-get fee-paused)) ERR_UNAUTHORIZED)
    (let ((fee CREATOR_FEE))
      (try! (stx-transfer? fee tx-sender CONTRACT_OWNER))
      (var-set total-fees-collected (+ (var-get total-fees-collected) fee))
      (var-set treasury-balance (+ (var-get treasury-balance) fee))
      (ok fee))))

;; Collect marketplace fee with royalty distribution
(define-public (collect-marketplace-fee (sale-price uint) (creator principal) (royalty-percent uint))
  (begin
    (asserts! (> sale-price u0) ERR_ZERO_AMOUNT)
    (asserts! (<= royalty-percent MAX_ROYALTY_PERCENT) ERR_INVALID_ROYALTY)
    (let (
      (marketplace-fee (/ (* sale-price MARKETPLACE_FEE_PERCENT) u1000))
      (royalty-amount (/ (* sale-price royalty-percent) u1000))
    )
      ;; Collect marketplace fee
      (try! (stx-transfer? marketplace-fee tx-sender CONTRACT_OWNER))
      (var-set total-fees-collected (+ (var-get total-fees-collected) marketplace-fee))
      
      ;; Distribute royalty to creator if applicable
      (if (> royalty-amount u0)
        (begin
          (try! (stx-transfer? royalty-amount tx-sender creator))
          (map-set creator-royalties creator 
            (+ (default-to u0 (map-get? creator-royalties creator)) royalty-amount))
          (var-set total-royalties-distributed (+ (var-get total-royalties-distributed) royalty-amount))
          (ok { marketplace-fee: marketplace-fee, royalty: royalty-amount }))
        (ok { marketplace-fee: marketplace-fee, royalty: u0 })))))

;; Withdraw accumulated royalties (for creators)
(define-public (withdraw-royalties)
  (let ((amount (default-to u0 (map-get? creator-royalties tx-sender))))
    (asserts! (>= amount MIN_WITHDRAWAL) ERR_BELOW_MINIMUM)
    (map-set creator-royalties tx-sender u0)
    (ok amount)))

;; Admin: Pause fee collection (emergency)
(define-public (set-fee-paused (paused bool))
  (begin
    (asserts! (is-contract-owner) ERR_UNAUTHORIZED)
    (var-set fee-paused paused)
    (ok paused)))

;; ============================================================================
;; Read-Only Functions
;; ============================================================================

(define-read-only (get-creator-fee)
  CREATOR_FEE)

(define-read-only (get-marketplace-fee-percent)
  MARKETPLACE_FEE_PERCENT)

(define-read-only (get-total-collected)
  (var-get total-fees-collected))

(define-read-only (get-total-royalties)
  (var-get total-royalties-distributed))

(define-read-only (get-creator-royalty-balance (creator principal))
  (default-to u0 (map-get? creator-royalties creator)))

(define-read-only (get-treasury-balance)
  (var-get treasury-balance))

(define-read-only (is-fee-paused)
  (var-get fee-paused))

(define-read-only (calculate-fees (sale-price uint) (royalty-percent uint))
  {
    marketplace-fee: (/ (* sale-price MARKETPLACE_FEE_PERCENT) u1000),
    royalty: (/ (* sale-price royalty-percent) u1000),
    seller-receives: (- sale-price 
      (+ (/ (* sale-price MARKETPLACE_FEE_PERCENT) u1000)
         (/ (* sale-price royalty-percent) u1000)))
  })

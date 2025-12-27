;; StacksMint Treasury Contract
;; Handles creator fee collection

(define-constant CONTRACT_OWNER tx-sender)
(define-constant CREATOR_FEE u10000) ;; 0.01 STX

(define-data-var total-fees-collected uint u0)

(define-public (collect-fee)
  (let ((fee CREATOR_FEE))
    (try! (stx-transfer? fee tx-sender CONTRACT_OWNER))
    (var-set total-fees-collected (+ (var-get total-fees-collected) fee))
    (ok fee)))

(define-read-only (get-creator-fee)
  CREATOR_FEE)

(define-read-only (get-total-collected)
  (var-get total-fees-collected))

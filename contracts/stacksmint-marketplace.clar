;; StacksMint Marketplace Contract
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_OWNER (err u100))
(define-constant ERR_NOT_LISTED (err u102))

(define-map listings uint { price: uint, seller: principal })

(define-public (list-nft (token-id uint) (price uint))
  (begin
    (try! (contract-call? .stacksmint-treasury collect-fee))
    (map-set listings token-id { price: price, seller: tx-sender })
    (ok true)))

(define-public (buy-nft (token-id uint))
  (let ((listing (unwrap! (map-get? listings token-id) ERR_NOT_LISTED)))
    (try! (stx-transfer? (get price listing) tx-sender (get seller listing)))
    (try! (contract-call? .stacksmint-nft transfer token-id (get seller listing) tx-sender))
    (map-delete listings token-id)
    (ok true)))

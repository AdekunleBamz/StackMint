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

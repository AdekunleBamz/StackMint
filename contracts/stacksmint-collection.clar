;; StacksMint Collection Contract

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_OWNER (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var collection-counter uint u0)

(define-map collections uint {
  name: (string-ascii 64),
  creator: principal,
  max-supply: uint
})

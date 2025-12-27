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

(define-public (create-collection (name (string-ascii 64)) (max-supply uint))
  (let ((collection-id (+ (var-get collection-counter) u1)))
    (try! (contract-call? .stacksmint-treasury collect-fee))
    (map-set collections collection-id {
      name: name,
      creator: tx-sender,
      max-supply: max-supply
    })
    (var-set collection-counter collection-id)
    (ok collection-id)))

;; StacksMint Collection Contract
;; NFT collection management and metadata
;; Version: 1.1.0
;; Author: StacksMint Team

;; Error constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_OWNER (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_COLLECTION_EXISTS (err u102))
(define-constant ERR_MAX_SUPPLY_REACHED (err u103))
(define-constant ERR_INVALID_NAME (err u104))

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

(define-read-only (get-collection (collection-id uint))
  (map-get? collections collection-id))

(define-read-only (get-collection-count)
  (var-get collection-counter))

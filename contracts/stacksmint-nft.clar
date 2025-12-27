;; StacksMint NFT Contract
;; SIP-009 compliant with minting fees

(impl-trait .sip009-nft-trait.sip009-nft-trait)

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_OWNER (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-non-fungible-token stacksmint-nft uint)
(define-data-var last-token-id uint u0)
(define-map token-uris uint (string-ascii 256))

(define-public (mint (uri (string-ascii 256)))
  (let ((token-id (+ (var-get last-token-id) u1)))
    (try! (contract-call? .stacksmint-treasury collect-fee))
    (try! (nft-mint? stacksmint-nft token-id tx-sender))
    (map-set token-uris token-id uri)
    (var-set last-token-id token-id)
    (ok token-id)))

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_NOT_OWNER)
    (nft-transfer? stacksmint-nft token-id sender recipient)))

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok (map-get? token-uris token-id)))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? stacksmint-nft token-id)))

;; SIP-009 NFT Trait Definition
;; Standard NFT interface for Stacks blockchain
;; Reference: https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md
;; Version: 1.0.0

(define-trait sip009-nft-trait
  (
    ;; Get the last token ID minted
    (get-last-token-id () (response uint uint))
    ;; Get the metadata URI for a token
    (get-token-uri (uint) (response (optional (string-ascii 256)) uint))
    ;; Get the owner of a token
    (get-owner (uint) (response (optional principal) uint))
    ;; Transfer a token between principals
    (transfer (uint principal principal) (response bool uint))
  )
)

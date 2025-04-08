;; Payment Processing Contract
;; This contract handles deposits and final payments

(define-constant DEPOSIT-PERCENT u30) ;; 30% deposit required

(define-map payments
  uint ;; booking-id
  {
    guest: principal,
    deposit-amount: uint,
    deposit-paid: bool,
    final-amount: uint,
    final-paid: bool,
    total-paid: uint
  }
)

;; Function to pay deposit
(define-public (pay-deposit (booking-id uint) (total-price uint))
  (let
    (
      (deposit-amount (/ (* total-price DEPOSIT-PERCENT) u100))
    )
    ;; Record the payment
    (map-set payments booking-id
      {
        guest: tx-sender,
        deposit-amount: deposit-amount,
        deposit-paid: true,
        final-amount: (- total-price deposit-amount),
        final-paid: false,
        total-paid: deposit-amount
      }
    )

    (ok deposit-amount)
  )
)

;; Function to pay final amount
(define-public (pay-final-amount (booking-id uint))
  (let
    (
      (payment (default-to
                 {
                   guest: tx-sender,
                   deposit-amount: u0,
                   deposit-paid: false,
                   final-amount: u0,
                   final-paid: false,
                   total-paid: u0
                 }
                 (map-get? payments booking-id)))
    )
    (asserts! (is-eq (get guest payment) tx-sender) (err u3))
    (asserts! (get deposit-paid payment) (err u5))
    (asserts! (not (get final-paid payment)) (err u6))

    ;; Record the payment
    (map-set payments booking-id
      (merge payment
        {
          final-paid: true,
          total-paid: (+ (get deposit-amount payment) (get final-amount payment))
        }
      )
    )

    (ok (get final-amount payment))
  )
)

;; Function to get payment details
(define-read-only (get-payment-details (booking-id uint))
  (map-get? payments booking-id)
)

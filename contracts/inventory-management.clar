;; Inventory Management Contract
;; This contract tracks available room inventory

(define-map room-types
  { property-owner: principal, room-type-id: uint }
  {
    name: (string-utf8 50),
    total-rooms: uint,
    price-per-night: uint
  }
)

(define-map room-availability
  { property-owner: principal, room-type-id: uint, date: uint }
  { available-rooms: uint }
)

;; Function to add a room type
(define-public (add-room-type (room-type-id uint) (name (string-utf8 50)) (total-rooms uint) (price-per-night uint))
  (ok (map-set room-types
    { property-owner: tx-sender, room-type-id: room-type-id }
    {
      name: name,
      total-rooms: total-rooms,
      price-per-night: price-per-night
    }
  ))
)

;; Function to update room availability for a specific date
(define-public (update-availability (room-type-id uint) (date uint) (available-rooms uint))
  (ok (map-set room-availability
    { property-owner: tx-sender, room-type-id: room-type-id, date: date }
    { available-rooms: available-rooms }
  ))
)

;; Function to check room availability
(define-read-only (check-availability (property-owner principal) (room-type-id uint) (date uint))
  (default-to { available-rooms: u0 }
    (map-get? room-availability { property-owner: property-owner, room-type-id: room-type-id, date: date })
  )
)

;; Function to get room details
(define-read-only (get-room-details (property-owner principal) (room-type-id uint))
  (map-get? room-types { property-owner: property-owner, room-type-id: room-type-id })
)

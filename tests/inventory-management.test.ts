import { describe, it, expect, beforeEach } from "vitest"

// Mock implementation for testing Clarity contracts

// Mock contract state
let roomTypes = new Map()
let roomAvailability = new Map()

// Mock property verification contract
function isVerified(propertyOwner: string) {
  // For testing, we'll consider these addresses verified
  const verifiedOwners = ["ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"]
  return verifiedOwners.includes(propertyOwner)
}

// Mock contract functions
function addRoomType(sender: string, roomTypeId: number, name: string, totalRooms: number, pricePerNight: number) {
  if (!isVerified(sender)) {
    return { error: 1 }
  }
  
  const key = `${sender}-${roomTypeId}`
  roomTypes.set(key, {
    name,
    totalRooms,
    pricePerNight,
  })
  
  return { success: true }
}

function updateAvailability(sender: string, roomTypeId: number, date: number, availableRooms: number) {
  if (!isVerified(sender)) {
    return { error: 1 }
  }
  
  const key = `${sender}-${roomTypeId}-${date}`
  roomAvailability.set(key, { availableRooms })
  
  return { success: true }
}

function checkAvailability(propertyOwner: string, roomTypeId: number, date: number) {
  const key = `${propertyOwner}-${roomTypeId}-${date}`
  return roomAvailability.get(key) || { availableRooms: 0 }
}

function getRoomDetails(propertyOwner: string, roomTypeId: number) {
  const key = `${propertyOwner}-${roomTypeId}`
  return roomTypes.get(key)
}

describe("Inventory Management Contract", () => {
  beforeEach(() => {
    // Reset state before each test
    roomTypes = new Map()
    roomAvailability = new Map()
  })
  
  it("should allow verified property to add a room type", () => {
    const verifiedOwner = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const result = addRoomType(verifiedOwner, 1, "Deluxe Room", 10, 100)
    
    expect(result).toHaveProperty("success", true)
    
    const roomDetails = getRoomDetails(verifiedOwner, 1)
    expect(roomDetails).toEqual({
      name: "Deluxe Room",
      totalRooms: 10,
      pricePerNight: 100,
    })
  })
  
  it("should not allow unverified property to add a room type", () => {
    const unverifiedOwner = "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5NH7B0M3Z"
    const result = addRoomType(unverifiedOwner, 1, "Deluxe Room", 10, 100)
    
    expect(result).toHaveProperty("error", 1)
    
    const roomDetails = getRoomDetails(unverifiedOwner, 1)
    expect(roomDetails).toBeUndefined()
  })
  
  it("should allow verified property to update room availability", () => {
    const verifiedOwner = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    
    // First add a room type
    addRoomType(verifiedOwner, 1, "Deluxe Room", 10, 100)
    
    // Then update availability
    const date = 20230601 // June 1, 2023
    const result = updateAvailability(verifiedOwner, 1, date, 5)
    
    expect(result).toHaveProperty("success", true)
    
    const availability = checkAvailability(verifiedOwner, 1, date)
    expect(availability).toEqual({ availableRooms: 5 })
  })
  
  it("should return zero availability for dates with no data", () => {
    const verifiedOwner = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const nonExistentDate = 20230701 // July 1, 2023
    
    const availability = checkAvailability(verifiedOwner, 1, nonExistentDate)
    expect(availability).toEqual({ availableRooms: 0 })
  })
})

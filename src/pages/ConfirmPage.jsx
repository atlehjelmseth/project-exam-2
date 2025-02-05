import React, { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../components/Auth"
import Styles from "../styles/General.module.css"
import ButtonStyles from "../styles/Button.module.css"
import ProfileStyles from "../styles/Profile.module.css"

import { API_KEY, VENUE_API, BOOKING_API } from "../common/constants"

function ConfirmPage() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [bookingDetails, setBookingDetails] = useState(null)
  const [venueInfo, setVenueInfo] = useState(null)
  const [guests, setGuests] = useState(1)
  const [bookingStatus, setBookingStatus] = useState("")

  useEffect(() => {
    const storedBooking = localStorage.getItem("bookingDetails")
    if (storedBooking) {
      setBookingDetails(JSON.parse(storedBooking))
    }
  }, [])

  useEffect(() => {
    if (bookingDetails && bookingDetails.venueId) {
      async function fetchVenueInfo() {
        try {
          const response = await fetch(
            `${VENUE_API}/${bookingDetails.venueId}`,
            {
              headers: { "x-api-key": API_KEY },
            }
          )
          if (!response.ok) {
            throw new Error("Failed to fetch venue info")
          }
          const data = await response.json()
          setVenueInfo(data)
        } catch (error) {
          console.error("Error fetching venue info:", error)
        }
      }
      fetchVenueInfo()
    }
  }, [bookingDetails])

  const handleBooking = async () => {
    if (!user || !bookingDetails) {
      alert("Something went wrong. Please try again.")
      return
    }
    const storedUser = JSON.parse(localStorage.getItem("user"))
    if (!storedUser || !storedUser.accessToken) {
      alert("Authorization failed: No token found.")
      return
    }
    const token = storedUser.accessToken

    const bookingData = {
      dateFrom: bookingDetails.checkIn,
      dateTo: bookingDetails.checkOut,
      guests: guests,
      venueId: bookingDetails.venueId,
    }

    try {
      const response = await fetch(BOOKING_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_KEY,
        },
        body: JSON.stringify(bookingData),
      })
      const data = await response.json()
      console.log("Booking Response:", data)
      if (!response.ok) {
        const errorMessage =
          data.errors?.map((err) => err.message).join(", ") ||
          data.message ||
          "Booking failed."
        setBookingStatus(` ${errorMessage}`)
      } else {
        localStorage.setItem("confirmedBooking", JSON.stringify(data.data))
        setBookingStatus("Booking successful! Redirecting...")
        setTimeout(() => navigate("/my-bookings"), 2000)
      }
    } catch (error) {
      console.error("Booking fail", error)
      setBookingStatus("An error occurred. Please try again.")
    }
  }

  let nights = 0
  let pricePerNight = 0
  let totalPrice = 0
  if (bookingDetails && venueInfo && venueInfo.data) {
    const checkInDate = new Date(bookingDetails.checkIn)
    const checkOutDate = new Date(bookingDetails.checkOut)
    nights = Math.max(
      1,
      Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
    )
    pricePerNight = venueInfo.data.price || 0
    totalPrice = nights * pricePerNight
  }

  return (
    <div className={ProfileStyles.profileContainer}>
      <h1>Confirm Your Booking</h1>
      {venueInfo &&
        venueInfo.data &&
        venueInfo.data.media &&
        venueInfo.data.media.length > 0 && (
          <div className={Styles.venueImageContainer}>
            <img
              src={venueInfo.data.media[0].url}
              alt={venueInfo.data.media[0].alt || "Venue Image"}
              className={Styles.venueImage}
            />
          </div>
        )}

      {bookingDetails ? (
        <div className={Styles.bookingDetails}>
          <p>
            <strong>Check-in:</strong>{" "}
            {new Date(bookingDetails.checkIn).toLocaleDateString()}
          </p>
          <p>
            <strong>Check-out:</strong>{" "}
            {new Date(bookingDetails.checkOut).toLocaleDateString()}
          </p>
          <p>
            <strong>Nights:</strong> {nights}
          </p>
          <p>
            <strong>Price per night:</strong> {pricePerNight} NOK
          </p>
          <p>
            <strong>Total Price:</strong> {totalPrice} NOK
          </p>
          <label htmlFor="guests">
            <strong>Number of Guests:</strong>
          </label>
          <input
            id="guests"
            type="number"
            value={guests === 0 ? "" : guests}
            min="1"
            onChange={(e) => {
              const value = e.target.value
              setGuests(value === "" ? "" : Math.max(1, Number(value)))
            }}
            className={ProfileStyles.inputGuests}
          />
          <br />
          <button
            className={ButtonStyles.primaryButton}
            onClick={handleBooking}
          >
            Confirm Booking
          </button>
        </div>
      ) : (
        <p>Loading booking details...</p>
      )}

      {bookingStatus && (
        <p className={Styles.bookingMessage}>{bookingStatus}</p>
      )}
    </div>
  )
}

export default ConfirmPage

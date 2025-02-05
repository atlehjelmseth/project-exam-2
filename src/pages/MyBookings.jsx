import React, { useEffect, useState, useContext } from "react"
import { AuthContext } from "../components/Auth"
import Styles from "../styles/Profile.module.css"
import ButtonStyles from "../styles/Button.module.css"

import { API_KEY, PROFILE_API } from "../common/constants"

function MyBookings() {
  const { user } = useContext(AuthContext)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!user) return
    const storedUser = JSON.parse(localStorage.getItem("user"))

    async function fetchProfile() {
      try {
        const response = await fetch(
          `${PROFILE_API}/${storedUser.name}?_bookings=true&sort=created`,
          {
            headers: {
              Authorization: `Bearer ${storedUser.accessToken}`,
              "X-Noroff-API-Key": API_KEY,
            },
          }
        )
        if (!response.ok) {
          throw new Error("Failed to fetch profile.")
        }
        const data = await response.json()
        setBookings(data.data.bookings || [])
      } catch (error) {
        console.error("Error fetching bookings:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to remove this booking?")) return
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"))
      const response = await fetch(
        `https://v2.api.noroff.dev/holidaze/bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${storedUser.accessToken}`,
            "X-Noroff-API-Key": API_KEY,
          },
        }
      )
      if (response.status === 204) {
        setBookings(bookings.filter((booking) => booking.id !== bookingId))
      } else {
        throw new Error("Failed to delete booking.")
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
    }
  }

  if (!user) return <p>Please log in to access your bookings.</p>
  if (loading) return <p>Loading bookings...</p>
  if (error) return <p>Failed to load bookings. Please try again later.</p>

  return (
    <div className={Styles.profileContainer}>
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <p>You have no bookings.</p>
      ) : (
        [...bookings].reverse().map((booking) => {
          const checkIn = new Date(booking.dateFrom)
          const checkOut = new Date(booking.dateTo)
          const nights = Math.max(
            1,
            Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))
          )
          const pricePerNight = booking.venue?.price || 0
          const totalPrice = nights * pricePerNight
          return (
            <div key={booking.id} className={Styles.bookingCard}>
              <h3>{booking.venue?.name}</h3>
              {booking.venue?.media && booking.venue.media.length > 0 && (
                <img
                  src={booking.venue.media[0].url}
                  alt={booking.venue.media[0].alt || "Venue Image"}
                  className={Styles.venueImage}
                />
              )}
              <p>
                <strong>Check-in:</strong> {checkIn.toLocaleDateString()}
              </p>
              <p>
                <strong>Check-out:</strong> {checkOut.toLocaleDateString()}
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
              <p>
                <strong>Guests:</strong> {booking.guests}
              </p>
              <button
                onClick={() => handleDeleteBooking(booking.id)}
                className={ButtonStyles.deleteButton}
              >
                Remove Booking
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}

export default MyBookings

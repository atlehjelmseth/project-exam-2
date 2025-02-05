import React, { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Carousel } from "react-responsive-carousel"
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { AuthContext } from "../components/Auth"
import CalendarComp from "../components/CalendarComp"
import Styles from "../styles/General.module.css"
import ButtonStyles from "../styles/Button.module.css"
import ProfileStyles from "../styles/Profile.module.css"
import { API_KEY, VENUE_API } from "../common/constants"

function VenuePage() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [venue, setVenue] = useState(null)
  const [bookedDates, setBookedDates] = useState([])
  const [dates, setDates] = useState({ checkIn: null, checkOut: null })

  useEffect(() => {
    async function fetchVenue() {
      try {
        const response = await fetch(`${VENUE_API}/${id}?_bookings=true`, {
          headers: { "x-api-key": API_KEY },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch venue details")
        }
        const data = await response.json()
        setVenue(data)

        if (data.data.bookings && Array.isArray(data.data.bookings)) {
          let bookedDays = []
          data.data.bookings.forEach((booking) => {
            let start = new Date(booking.dateFrom)
            let end = new Date(booking.dateTo)
            let current = new Date(start)
            while (current <= end) {
              bookedDays.push(new Date(current))
              current.setDate(current.getDate() + 1)
            }
          })
          setBookedDates(bookedDays)
        }
      } catch (error) {
        console.error("Error fetching venue:", error)
      }
    }
    fetchVenue()
  }, [id])

  const goToConfirmPage = () => {
    if (!dates.checkIn || !dates.checkOut) {
      alert("Please select check-in and check-out dates.")
      return
    }

    const bookingDetails = {
      venueId: id,
      checkIn: dates.checkIn.toISOString(),
      checkOut: dates.checkOut.toISOString(),
    }

    localStorage.setItem("bookingDetails", JSON.stringify(bookingDetails))
    navigate("/confirm")
  }

  return (
    <div className={Styles.underPageStructure}>
      <div className={ProfileStyles.profileContainer}>
        <h1>{venue?.data?.name || "Venue"}</h1>
        <p>{venue?.data?.description}</p>

        {venue?.data?.media && venue.data.media.length > 0 && (
          <div className={Styles.venueImagesContainer}>
            {venue.data.media.length > 1 ? (
              <Carousel
                showThumbs={true}
                infiniteLoop={true}
                useKeyboardArrows={true}
                autoPlay={true}
              >
                {venue.data.media.map((mediaItem, index) => (
                  <div key={index}>
                    <img
                      src={mediaItem.url}
                      alt={mediaItem.alt || `Venue Image ${index + 1}`}
                      className={Styles.venueImage}
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <img
                src={venue.data.media[0].url}
                alt={venue.data.media[0].alt || "Venue Image"}
                className={Styles.venueImage}
              />
            )}
          </div>
        )}

        <p className={Styles.price}>
          Price per night: {venue?.data?.price} NOK
        </p>

        <CalendarComp
          bookedDates={bookedDates}
          dates={dates}
          setDates={setDates}
        />

        {user ? (
          <button
            className={ButtonStyles.primaryButton}
            onClick={goToConfirmPage}
          >
            Proceed to Booking
          </button>
        ) : (
          <p>Please log in to book this venue.</p>
        )}
      </div>
    </div>
  )
}

export default VenuePage

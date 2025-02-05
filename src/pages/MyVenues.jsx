import React, { useEffect, useState, useContext } from "react"
import { AuthContext } from "../components/Auth"
import Styles from "../styles/Profile.module.css"
import ButtonStyles from "../styles/Button.module.css"
import AuthStyles from "../styles/Auth.module.css"

import { API_KEY, PROFILE_API, VENUE_API } from "../common/constants"

function MyVenues() {
  const { user } = useContext(AuthContext)
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null)
  const [editData, setEditData] = useState({})
  const [selectedBookings, setSelectedBookings] = useState(null)
  const [selectedVenueId, setSelectedVenueId] = useState(null)

  useEffect(() => {
    if (!user) return
    const storedUser = JSON.parse(localStorage.getItem("user"))

    async function fetchVenues() {
      try {
        const response = await fetch(
          `${PROFILE_API}/${storedUser.name}?_venues=true`,
          {
            headers: {
              Authorization: `Bearer ${storedUser.accessToken}`,
              "X-Noroff-API-Key": API_KEY,
            },
          }
        )
        if (!response.ok) {
          throw new Error("Failed to fetch venues.")
        }
        const data = await response.json()
        setVenues(data.data.venues || [])
      } catch (error) {
        console.error("Error fetching venues:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchVenues()
  }, [user])

  if (!user) return <p>Please log in to access your venues.</p>
  if (loading) return <p>Loading venues...</p>
  if (error) return <p>Failed to load venues. Please try again later.</p>

  const handleEditClick = (venue) => {
    setEditingVenue(venue)
    setEditData({
      name: venue.name || "",
      description: venue.description || "",
      price: venue.price || "",
      maxGuests: venue.maxGuests || "",
      media: venue.media || [],
      meta: venue.meta || {
        wifi: false,
        parking: false,
        breakfast: false,
        pets: false,
      },
      location: venue.location || {
        address: "",
        city: "",
        zip: "",
        country: "",
        continent: "",
        lat: 0,
        lng: 0,
      },
    })
  }

  const handleEditChange = (e) => {
    const { name, value, type } = e.target
    setEditData({
      ...editData,
      [name]: type === "number" ? Number(value) : value,
    })
  }

  const handleMediaChange = (index, field, value) => {
    const updatedMedia = [...editData.media]
    updatedMedia[index] = { ...updatedMedia[index], [field]: value }
    setEditData({ ...editData, media: updatedMedia })
  }

  const handleMetaChange = (e) => {
    const { name, checked } = e.target
    setEditData({
      ...editData,
      meta: { ...editData.meta, [name]: checked },
    })
  }

  const handleLocationChange = (e) => {
    const { name, value } = e.target
    setEditData({
      ...editData,
      location: { ...editData.location, [name]: value },
    })
  }

  const handleSave = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    const token = storedUser.accessToken
    try {
      const response = await fetch(`${VENUE_API}/${editingVenue.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_KEY,
        },
        body: JSON.stringify(editData),
      })
      const data = await response.json()
      if (!response.ok) {
        return
      }
      setVenues(venues.map((v) => (v.id === editingVenue.id ? data.data : v)))
      setEditingVenue(null)
    } catch (error) {
      console.error("Error updating venue:", error)
    }
  }

  const handleCancelEdit = () => {
    setEditingVenue(null)
  }

  const handleDeleteVenue = async (venueId) => {
    if (!window.confirm("Are you sure you want to delete this venue?")) return
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"))
      const token = storedUser.accessToken
      const response = await fetch(`${VENUE_API}/${venueId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_KEY,
        },
      })
      if (response.status === 204) {
        setVenues(venues.filter((v) => v.id !== venueId))
      } else {
        throw new Error("Failed to delete venue.")
      }
    } catch (error) {
      console.error("Error deleting venue:", error)
    }
  }
  const handleViewBookings = async (venue) => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    try {
      const response = await fetch(`${VENUE_API}/${venue.id}?_bookings=true`, {
        headers: {
          Authorization: `Bearer ${storedUser.accessToken}`,
          "X-Noroff-API-Key": API_KEY,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch bookings.")
      }
      const data = await response.json()
      setSelectedBookings(data.data.bookings)
      setSelectedVenueId(venue.id)
    } catch (error) {
      console.error("Error fetching bookings for venue:", error)
    }
  }

  return (
    <div className={Styles.profileContainer}>
      <h1>My Venues</h1>
      {venues.length === 0 ? (
        <p>You have not created any venues yet.</p>
      ) : (
        venues.map((venue) => (
          <div key={venue.id} className={AuthStyles.authContainer}>
            {editingVenue && editingVenue.id === venue.id ? (
              <div className={AuthStyles.editVenue}>
                <h3>Edit Venue</h3>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                />
                <label>Description:</label>
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                />
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={editData.price}
                  onChange={handleEditChange}
                />
                <label>Max Guests:</label>
                <input
                  type="number"
                  name="maxGuests"
                  value={editData.maxGuests}
                  onChange={handleEditChange}
                />
                {editData.media && editData.media.length > 0 && (
                  <div>
                    <label>Media URL:</label>
                    <input
                      type="text"
                      value={editData.media[0].url}
                      onChange={(e) =>
                        handleMediaChange(0, "url", e.target.value)
                      }
                    />
                  </div>
                )}
                <h4>Options:</h4>
                <label>
                  <input
                    type="checkbox"
                    name="wifi"
                    checked={editData.meta.wifi}
                    onChange={handleMetaChange}
                  />
                  Wifi
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="parking"
                    checked={editData.meta.parking}
                    onChange={handleMetaChange}
                  />
                  Parking
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="breakfast"
                    checked={editData.meta.breakfast}
                    onChange={handleMetaChange}
                  />
                  Breakfast
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="pets"
                    checked={editData.meta.pets}
                    onChange={handleMetaChange}
                  />
                  Pets Allowed
                </label>
                <h4>Location:</h4>
                <label>Address:</label>
                <input
                  type="text"
                  name="address"
                  value={editData.location.address}
                  onChange={handleLocationChange}
                />
                <label>City:</label>
                <input
                  type="text"
                  name="city"
                  value={editData.location.city}
                  onChange={handleLocationChange}
                />
                <label>Zip Code:</label>
                <input
                  type="text"
                  name="zip"
                  value={editData.location.zip}
                  onChange={handleLocationChange}
                />
                <label>Country:</label>
                <input
                  type="text"
                  name="country"
                  value={editData.location.country}
                  onChange={handleLocationChange}
                />
                <label>Continent:</label>
                <input
                  type="text"
                  name="continent"
                  value={editData.location.continent}
                  onChange={handleLocationChange}
                />
                <div className={ButtonStyles.buttonContainerRow}>
                  <button
                    onClick={handleSave}
                    className={ButtonStyles.primaryButton}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className={ButtonStyles.deleteButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3>{venue.name}</h3>
                {venue.media && venue.media.length > 0 && (
                  <div className={Styles.venueImagesContainer}>
                    {venue.media.map((mediaItem, index) => (
                      <img
                        key={index}
                        src={mediaItem.url}
                        alt={mediaItem.alt || `Venue Image ${index + 1}`}
                        className={Styles.venueImage}
                      />
                    ))}
                  </div>
                )}
                <p>{venue.description}</p>
                <p>
                  <strong>Price:</strong> {venue.price} NOK
                </p>
                <p>
                  <strong>Max Guests:</strong> {venue.maxGuests}
                </p>
                {venue.meta && (
                  <div>
                    <p>
                      <strong>Options:</strong> Wifi:{" "}
                      {venue.meta.wifi ? "Yes" : "No"}, Parking:{" "}
                      {venue.meta.parking ? "Yes" : "No"}, Breakfast:{" "}
                      {venue.meta.breakfast ? "Yes" : "No"}, Pets:{" "}
                      {venue.meta.pets ? "Yes" : "No"}
                    </p>
                  </div>
                )}
                {venue.location && (
                  <div>
                    <p>
                      <strong>Address:</strong> {venue.location.address}
                    </p>
                    <p>
                      <strong>City:</strong> {venue.location.city}
                    </p>
                    <p>
                      <strong>Zip Code:</strong> {venue.location.zip}
                    </p>
                    <p>
                      <strong>Country:</strong> {venue.location.country}
                    </p>
                    <p>
                      <strong>Continent:</strong> {venue.location.continent}
                    </p>
                  </div>
                )}
                <div className={ButtonStyles.buttonContainer}>
                  <button
                    onClick={() => handleEditClick(venue)}
                    className={ButtonStyles.primaryButton}
                  >
                    Edit Venue
                  </button>
                  <button
                    onClick={() => handleViewBookings(venue)}
                    className={ButtonStyles.primaryButton}
                  >
                    View Bookings
                  </button>
                  <button
                    onClick={() => handleDeleteVenue(venue.id)}
                    className={ButtonStyles.deleteButton}
                  >
                    Delete Venue
                  </button>
                </div>
                {selectedVenueId === venue.id && (
                  <div>
                    <h4>Bookings for this venue:</h4>
                    {selectedBookings && selectedBookings.length === 0 ? (
                      <p>No bookings for this venue.</p>
                    ) : (
                      selectedBookings &&
                      selectedBookings.map((booking) => (
                        <div key={booking.id} className={Styles.bookingDetail}>
                          <p>
                            <strong>ID:</strong> {booking.id}
                          </p>
                          <p>
                            <strong>Date From:</strong> {booking.dateFrom}
                          </p>
                          <p>
                            <strong>Date To:</strong> {booking.dateTo}
                          </p>
                          <p>
                            <strong>Guests:</strong> {booking.guests}
                          </p>
                          {booking.customer && (
                            <p>
                              <strong>Customer:</strong> {booking.customer.name}{" "}
                              ({booking.customer.email})
                            </p>
                          )}
                        </div>
                      ))
                    )}
                    <button
                      onClick={() => {
                        setSelectedBookings(null)
                        setSelectedVenueId(null)
                      }}
                      className={ButtonStyles.deleteButton}
                    >
                      Hide Bookings
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default MyVenues

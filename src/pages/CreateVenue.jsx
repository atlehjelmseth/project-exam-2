import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import Styles from "../styles/Auth.module.css"
import ButtonStyles from "../styles/Button.module.css"
import CreateStyles from "../styles/CreateVenue.module.css"
import { API_KEY, VENUE_API } from "../common/constants"

function CreateVenue() {
  const navigate = useNavigate()

  const [venueData, setVenueData] = useState({
    name: "",
    description: "",
    price: "",
    maxGuests: "",
    rating: 0,
    media: [],
    meta: { wifi: false, parking: false, breakfast: false, pets: false },
    location: { address: "", city: "", zip: "", country: "", continent: "" },
  })

  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [message, setMessage] = useState("")

  const handleChange = (e) => {
    setVenueData({ ...venueData, [e.target.name]: e.target.value })
  }

  const handleMetaChange = (e) => {
    setVenueData({
      ...venueData,
      meta: { ...venueData.meta, [e.target.name]: e.target.checked },
    })
  }

  const handleLocationChange = (e) => {
    setVenueData({
      ...venueData,
      location: { ...venueData.location, [e.target.name]: e.target.value },
    })
  }

  const handleAddImage = () => {
    if (!imageUrl.trim()) {
      setMessage("Please enter a valid image URL.")
      return
    }

    setVenueData({
      ...venueData,
      media: [...venueData.media, { url: imageUrl, alt: imageAlt }],
    })

    setImageUrl("")
    setImageAlt("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const storedUser = JSON.parse(localStorage.getItem("user"))
    if (!storedUser || !storedUser.accessToken) {
      setMessage("Authorization failed. Please log in.")
      return
    }

    if (
      !venueData.name ||
      !venueData.description ||
      !venueData.price ||
      !venueData.maxGuests
    ) {
      setMessage("Please fill in all required fields.")
      return
    }

    const token = storedUser.accessToken

    try {
      const response = await fetch(VENUE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_KEY,
        },
        body: JSON.stringify({
          name: venueData.name,
          description: venueData.description,
          media: venueData.media,
          price: Number(venueData.price),
          maxGuests: Number(venueData.maxGuests),
          rating: venueData.rating,
          meta: venueData.meta,
          location: venueData.location,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(
          data.errors?.[0]?.message || data.message || "Failed to create venue."
        )
        return
      }

      setMessage("Venue created successfully!")
      setTimeout(() => navigate("/"), 2000)
    } catch (error) {
      console.error("Error creating venue:", error)
      setMessage("An error occurred. Please try again.")
    }
  }

  return (
    <div className={CreateStyles.createContainer}>
      <h1>Create venue</h1>
      {message && <p className={Styles.errorText}>{message}</p>}
      <div className={CreateStyles.createForm}>
        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={venueData.name}
            onChange={handleChange}
            required
          />

          <label>Description:</label>
          <textarea
            name="description"
            value={venueData.description}
            onChange={handleChange}
            required
          />

          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={venueData.price}
            onChange={handleChange}
            required
          />

          <label>Max Guests:</label>
          <input
            type="number"
            name="maxGuests"
            value={venueData.maxGuests}
            onChange={handleChange}
            required
          />

          <h3>Venue Location</h3>
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={venueData.location.address}
            onChange={handleLocationChange}
          />

          <label>Zip Code:</label>
          <input
            type="text"
            name="zip"
            value={venueData.location.zip}
            onChange={handleLocationChange}
          />

          <label>City:</label>
          <input
            type="text"
            name="city"
            value={venueData.location.city}
            onChange={handleLocationChange}
          />

          <label>Country:</label>
          <input
            type="text"
            name="country"
            value={venueData.location.country}
            onChange={handleLocationChange}
          />

          <label>Continent:</label>
          <input
            type="text"
            name="continent"
            value={venueData.location.continent}
            onChange={handleLocationChange}
          />

          <h3>Options</h3>
          <label>
            <input
              type="checkbox"
              name="wifi"
              checked={venueData.meta.wifi}
              onChange={handleMetaChange}
            />
            Wifi
          </label>
          <label>
            <input
              type="checkbox"
              name="parking"
              checked={venueData.meta.parking}
              onChange={handleMetaChange}
            />
            Parking
          </label>
          <label>
            <input
              type="checkbox"
              name="breakfast"
              checked={venueData.meta.breakfast}
              onChange={handleMetaChange}
            />
            Breakfast
          </label>
          <label>
            <input
              type="checkbox"
              name="pets"
              checked={venueData.meta.pets}
              onChange={handleMetaChange}
            />
            Pets Allowed
          </label>

          <h3>Upload Images</h3>
          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <button
            className={ButtonStyles.primaryButton}
            type="button"
            onClick={handleAddImage}
          >
            Add Image
          </button>

          {venueData.media.length > 0 && (
            <div className={Styles.imagePreview}>
              <h3>Uploaded Images:</h3>
              {venueData.media.map((image, index) => (
                <div key={index} className={Styles.imageItem}>
                  <img
                    src={image.url}
                    alt={image.alt}
                    className={Styles.previewImage}
                  />
                  <p>{image.alt}</p>
                </div>
              ))}
            </div>
          )}

          <button className={ButtonStyles.primaryButton} type="submit">
            Create Venue
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateVenue

import React, { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../components/Auth"
import Styles from "../styles/Profile.module.css"
import ButtonStyles from "../styles/Button.module.css"
import { API_KEY, PROFILE_API } from "../common/constants"
import BecomeVenueManager from "../components/BecomeVenueManager"

function MyProfile() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [newAvatar, setNewAvatar] = useState("")
  const [updateMessage, setUpdateMessage] = useState("")

  useEffect(() => {
    if (!user) return

    const storedUser = JSON.parse(localStorage.getItem("user"))

    async function fetchProfile() {
      try {
        const response = await fetch(
          `${PROFILE_API}/${storedUser.name}?_bookings=true&_venues=true`,
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

        const updatedUser = {
          ...storedUser,
          venueManager: data.data.venueManager,
        }

        localStorage.setItem("user", JSON.stringify(updatedUser))
        setProfile(updatedUser)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleUpdateAvatar = async () => {
    if (!newAvatar.trim()) {
      setUpdateMessage("Please enter a valid image URL.")
      return
    }
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"))
      const userName = storedUser.name
      const response = await fetch(`${PROFILE_API}/${userName}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedUser.accessToken}`,
          "X-Noroff-API-Key": API_KEY,
        },
        body: JSON.stringify({
          avatar: {
            url: newAvatar,
            alt: `${userName}'s avatar`,
          },
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setUpdateMessage(
          data.errors?.[0]?.message ||
            data.message ||
            "Failed to update avatar."
        )
        return
      }

      const updatedUser = { ...storedUser, avatar: data.data.avatar }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setProfile(updatedUser)
      setUpdateMessage("Avatar updated successfully!")
      setNewAvatar("")
    } catch (error) {
      console.error("Error updating avatar:", error)
      setUpdateMessage("An error occurred. Please try again.")
    }
  }

  if (!user) return <p>Please log in to access your profile.</p>
  if (loading) return <p>Loading profile...</p>
  if (error) return <p>Failed to load data. Please try again later.</p>

  return (
    <div className={Styles.profileContainer}>
      <h1>My Profile</h1>
      {profile && (
        <div className={Styles.profileInfo}>
          <img
            src={profile.avatar?.url}
            alt={profile.avatar?.alt || "User Avatar"}
            className={Styles.avatar}
          />
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <BecomeVenueManager user={profile} updateProfile={setProfile} />
          <div className={Styles.updatePictureContainer}>
            <h3>Update Profile Picture</h3>
            <input
              className={Styles.inputField}
              type="text"
              placeholder="Enter image URL"
              value={newAvatar}
              onChange={(e) => setNewAvatar(e.target.value)}
            />
            <button
              onClick={handleUpdateAvatar}
              className={ButtonStyles.primaryButton}
            >
              Update Avatar
            </button>
            {updateMessage && (
              <p className={Styles.updateMessage}>{updateMessage}</p>
            )}
          </div>
        </div>
      )}

      <div className={ButtonStyles.buttonContainerRow}>
        <button
          onClick={() => navigate("/my-bookings")}
          className={ButtonStyles.primaryButton}
        >
          My Bookings
        </button>
        <button
          onClick={() => navigate("/my-venues")}
          className={ButtonStyles.primaryButton}
        >
          My Venues
        </button>
      </div>
    </div>
  )
}

export default MyProfile

import React, { useState } from "react"
import Styles from "../styles/Profile.module.css"
import { API_KEY, PROFILE_API } from "../common/constants"
import ButtonStyles from "../styles/Button.module.css"

function BecomeVenueManager({ user, updateProfile }) {
  const [updateMessage, setUpdateMessage] = useState("")

  const handleBecomeVenueManager = async () => {
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
          venueManager: true,
        }),
      })

      const data = await response.json()
      console.log("Become Venue Manager Response:", data)

      if (!response.ok) {
        setUpdateMessage(
          data.errors?.[0]?.message ||
            data.message ||
            "Failed to update profile."
        )
        return
      }

      const updatedUser = {
        ...storedUser,
        venueManager: data.data.venueManager,
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      updateProfile(updatedUser)
      setUpdateMessage("You are now a venue manager!")
    } catch (error) {
      console.error("Error updating profile:", error)
      setUpdateMessage("An error occurred. Please try again.")
    }
  }

  return (
    <>
      {user.venueManager ? (
        <div className={ButtonStyles.buttonContainer}>
          <strong>Venue Manager:</strong>
          <button
            onClick={() => (window.location.href = "/create-venue")}
            className={ButtonStyles.primaryButton}
          >
            Create venue
          </button>
        </div>
      ) : (
        <button
          onClick={handleBecomeVenueManager}
          className={Styles.becomeButton}
        >
          Become a Venue Manager
        </button>
      )}
      {updateMessage && <p className={Styles.updateMessage}>{updateMessage}</p>}
    </>
  )
}

export default BecomeVenueManager

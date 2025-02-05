import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import Styles from "../styles/Auth.module.css"
import { API_KEY, REGISTER_URL } from "../common/constants"
import ButtonStyles from "../styles/Button.module.css"

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    venueManager: false,
  })
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])
    setSuccessMessage("")

    try {
      const response = await fetch(REGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          venueManager: formData.venueManager,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors.map((err) => err.message))
        } else {
          setErrors([data.message || "Registration failed."])
        }
        throw new Error("Registration failed.")
      }

      setSuccessMessage("Registration successful! You will be redirected.")
      setTimeout(() => navigate("/login"), 3000)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={Styles.authContainer}>
      <h1>Register</h1>

      {successMessage && (
        <p className={Styles.successMessage}>{successMessage}</p>
      )}

      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label>
          <input
            type="checkbox"
            name="venueManager"
            checked={formData.venueManager}
            onChange={handleChange}
          />
          Register as Venue Manager
        </label>

        {errors.length > 0 && (
          <div className={Styles.errorContainer}>
            {errors.map((error, index) => (
              <p key={index} className={Styles.errorText}>
                {error}
              </p>
            ))}
          </div>
        )}

        <button
          className={ButtonStyles.primaryButton}
          type="submit"
          disabled={loading}
        >
          {loading ? "Processing..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  )
}

export default RegisterPage

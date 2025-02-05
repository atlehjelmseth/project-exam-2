import React, { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "./Auth"
import Styles from "../styles/Navbar.module.css"

function Navigation() {
  const { user, logout } = useContext(AuthContext)
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const handleLogout = (e) => {
    e.preventDefault()
    logout()
  }

  return (
    <>
      <nav>
        <ul className={Styles.links}>
          {user ? (
            <>
              <li className={Styles.desktop}>
                <Link to="/profile">My Profile</Link>
              </li>
              <li className={Styles.desktop}>
                <Link to="/" onClick={handleLogout}>
                  Logout
                </Link>
              </li>
            </>
          ) : (
            <li className={Styles.desktop}>
              <Link to="/login">Login</Link>
            </li>
          )}
          <li className={Styles.mobile}>
            <Link to="#" onClick={toggleMenu}>
              Menu
            </Link>
          </li>
        </ul>
      </nav>

      {menuOpen && (
        <div className={Styles.fullscreenMenu}>
          <button className={Styles.closeButton} onClick={toggleMenu}>
            Close
          </button>
          <ul className={Styles.fullscreenLinks}>
            {user ? (
              <>
                <li>
                  <Link to="/profile" onClick={toggleMenu}>
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    onClick={(e) => {
                      handleLogout(e)
                      toggleMenu()
                    }}
                  >
                    Logout
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" onClick={toggleMenu}>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  )
}

export default Navigation

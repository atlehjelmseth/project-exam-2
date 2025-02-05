import Nav from "./Navigation"
import { useNavigate } from "react-router-dom"
import Styles from "../styles/Navbar.module.css"
import logo from "../logo.png"

function Header() {
  const navigate = useNavigate()

  const handleHomeClick = () => {
    navigate("/")
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  return (
    <header className={Styles.navbar}>
      {/* Logo replaces the H1 */}
      <img
        src={logo}
        alt="Holidaze Logo"
        className={Styles.logo}
        onClick={handleHomeClick}
        style={{ cursor: "pointer" }}
      />
      <Nav />
    </header>
  )
}

export default Header

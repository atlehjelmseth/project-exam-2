import Styles from "../styles/Footer.module.css"

const Footer = () => {
  return (
    <footer className={Styles.footer}>
      Atle R. Hjelmseth © {new Date().getFullYear()}
    </footer>
  )
}

export default Footer

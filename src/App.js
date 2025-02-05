import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./components/Auth"
import Home from "./pages/HomePage"
import VenueDetails from "./pages/VenuePage"
import ConfirmPage from "./pages/ConfirmPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import MyProfile from "./pages/MyProfile"
import MyVenues from "./pages/MyVenues"
import MyBookings from "./pages/MyBookings"
import Header from "./components/HeaderComp"
import Footer from "./components/Footer"
import CreateVenue from "./pages/CreateVenue"

function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/venue/:id" element={<VenueDetails />} />
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<MyProfile />} />{" "}
        <Route path="/create-venue" element={<CreateVenue />} />
        <Route path="/my-venues" element={<MyVenues />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
      <Footer />
    </AuthProvider>
  )
}

export default App

import React, { useState, useEffect } from "react"
import Styles from "../styles/General.module.css"
import ButtonStyle from "../styles/Button.module.css"

function SearchBar({ venues, onSearch }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [lookAheadResults, setLookAheadResults] = useState([])
  const [showLookAhead, setShowLookAhead] = useState(true)

  const cities = Array.from(
    new Set(
      venues.map((venue) => venue.location?.city).filter((city) => !!city)
    )
  )

  useEffect(() => {
    if (searchQuery.trim() !== "" && showLookAhead) {
      const query = searchQuery.toLowerCase()
      const filtered = venues.filter((venue) => {
        const name = venue.name?.toLowerCase() || ""
        const description = venue.description?.toLowerCase() || ""
        const city = venue.location?.city?.toLowerCase() || ""
        const country = venue.location?.country?.toLowerCase() || ""
        const matchesQuery =
          name.includes(query) ||
          description.includes(query) ||
          city.includes(query) ||
          country.includes(query)

        return selectedCity
          ? city === selectedCity.toLowerCase() && matchesQuery
          : matchesQuery
      })
      setLookAheadResults(filtered)
    } else {
      setLookAheadResults([])
    }
  }, [searchQuery, venues, selectedCity, showLookAhead])

  const handleSearch = () => {
    const query = searchQuery.toLowerCase()
    const results = venues.filter((venue) => {
      const name = venue.name?.toLowerCase() || ""
      const description = venue.description?.toLowerCase() || ""
      const city = venue.location?.city?.toLowerCase() || ""
      const country = venue.location?.country?.toLowerCase() || ""
      const matchesQuery =
        name.includes(query) ||
        description.includes(query) ||
        city.includes(query) ||
        country.includes(query)

      return selectedCity
        ? city === selectedCity.toLowerCase() && matchesQuery
        : matchesQuery
    })

    onSearch(results)
  }

  return (
    <div className={Styles.searchContainer}>
      <div className={Styles.selectWrapper}>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className={Styles.dropdown}
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        placeholder="Search for venue"
        autoComplete="off"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          setShowLookAhead(true)
        }}
        className={Styles.searchbar}
      />
      <button onClick={handleSearch} className={ButtonStyle.searchVenue}>
        Search
      </button>
      {lookAheadResults.length > 0 && showLookAhead && (
        <ul className={Styles.result}>
          {lookAheadResults.map((item) => (
            <li
              key={item.id}
              className={Styles.resultItem}
              onClick={() => {
                setSearchQuery(item.name)
                setShowLookAhead(false)
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar

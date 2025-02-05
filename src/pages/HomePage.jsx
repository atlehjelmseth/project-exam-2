import React, { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import Styles from "../styles/General.module.css"
import Cards from "../styles/Cards.module.css"
import ButtonStyles from "../styles/Button.module.css"
import SearchBar from "../components/SearchBar"
import { VENUE_API } from "../common/constants"

const url = `${VENUE_API}?sort=created&sortOrder=desc`

function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [venues, setVenues] = useState([])
  const [visibleVenues, setVisibleVenues] = useState([])
  const [page, setPage] = useState(1)
  const [activeSearch, setActiveSearch] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  const observer = useRef(null)

  useEffect(() => {
    async function getData() {
      try {
        setError(false)
        setLoading(true)
        const response = await fetch(url)
        const json = await response.json()
        setVenues(json.data)
        setVisibleVenues(json.data.slice(0, 6))
        setLoading(false)
      } catch (error) {
        setLoading(false)
        setError(true)
      }
    }
    getData()
  }, [])

  useEffect(() => {
    if (!venues.length || activeSearch) return

    const handleObserver = (entries) => {
      const target = entries[0]
      if (target.isIntersecting) {
        setPage((prevPage) => prevPage + 1)
      }
    }

    observer.current = new IntersectionObserver(handleObserver, {
      threshold: 1.0,
    })
    const observerTarget = document.querySelector("#scroll-trigger")
    if (observerTarget) {
      observer.current.observe(observerTarget)
    }
    return () => {
      if (observer.current) observer.current.disconnect()
    }
  }, [venues, activeSearch])

  useEffect(() => {
    if (!activeSearch) {
      setVisibleVenues(venues.slice(0, page * 6))
    }
  }, [page, venues, activeSearch])

  const handleSearchResults = (results) => {
    setActiveSearch(true)
    setSearchResults(results)
  }

  if (loading) {
    return <div className={Styles.loading}>Loading...</div>
  }
  if (error) {
    return <div className={Styles.error}>Error loading data</div>
  }

  const venuesToDisplay = activeSearch ? searchResults : visibleVenues

  return (
    <div>
      <SearchBar venues={venues} onSearch={handleSearchResults} />
      <div className={Styles.frontPage}></div>
      <div className={Styles.mainContainer}>
        {venuesToDisplay.length > 0 ? (
          venuesToDisplay.map((venue) => (
            <div key={venue.id} className={Cards.card}>
              <div>
                <h2>{venue.name}</h2>
                {venue.media && venue.media.length > 0 ? (
                  <img
                    src={venue.media[0].url}
                    alt={venue.media[0].alt || venue.name}
                  />
                ) : (
                  <p>No image available</p>
                )}
              </div>
              <div>
                <p className={Cards.description}>{venue.description}</p>
                <Link to={`/venue/${venue.id}`}>
                  <button className={ButtonStyles.primaryButton}>
                    More info
                  </button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>

      {!activeSearch && (
        <div
          id="scroll-trigger"
          style={{ height: "20px", marginBottom: "50px" }}
        ></div>
      )}
    </div>
  )
}

export default Home

import React from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import CalendarStyles from "../styles/Calendar.module.css"

function CalendarComp({ bookedDates, dates, setDates }) {
  const today = new Date()
  const todayNoTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  const handleDateChange = (selectedDate) => {
    const isIndividuallyBooked = bookedDates.some(
      (bookedDate) => bookedDate.toDateString() === selectedDate.toDateString()
    )

    if (isIndividuallyBooked) {
      alert("This date is already booked. Please choose another.")
      setDates({ checkIn: null, checkOut: null })
      return
    }
    if (
      dates.checkIn &&
      dates.checkIn.toDateString() === selectedDate.toDateString()
    ) {
      setDates({ checkIn: null, checkOut: null })
      return
    } else if (
      dates.checkOut &&
      dates.checkOut.toDateString() === selectedDate.toDateString()
    ) {
      setDates({ ...dates, checkOut: null })
      return
    } else if (!dates.checkIn || (dates.checkIn && dates.checkOut)) {
      setDates({ checkIn: selectedDate, checkOut: null })
      return
    } else if (
      dates.checkIn &&
      !dates.checkOut &&
      selectedDate > dates.checkIn
    ) {
      let current = new Date(dates.checkIn)
      let overlapFound = false

      while (current <= selectedDate) {
        if (
          bookedDates.some(
            (bookedDate) => bookedDate.toDateString() === current.toDateString()
          )
        ) {
          overlapFound = true
          break
        }
        current.setDate(current.getDate() + 1)
      }

      if (overlapFound) {
        alert("We cant book this due to dates in the middle has been booked.")
        setDates({ checkIn: null, checkOut: null })
        return
      } else {
        setDates((prev) => ({ ...prev, checkOut: selectedDate }))
      }
    }
  }

  return (
    <div className="calendar_container">
      <h2>Select Booking Dates</h2>
      <Calendar
        onClickDay={handleDateChange}
        minDate={new Date()}
        tileClassName={({ date }) => {
          const isPast = date < todayNoTime
          if (isPast) {
            return CalendarStyles.pastDate
          }
          const isBooked = bookedDates.some(
            (bookedDate) => bookedDate.toDateString() === date.toDateString()
          )
          if (isBooked) {
            return CalendarStyles.bookedDate
          }
          if (dates.checkIn && dates.checkOut) {
            if (date > dates.checkIn && date < dates.checkOut) {
              return CalendarStyles.inRange
            }
          }
          if (
            dates.checkIn &&
            date.toDateString() === dates.checkIn.toDateString()
          ) {
            return CalendarStyles.selectedCheckIn
          }
          if (
            dates.checkOut &&
            date.toDateString() === dates.checkOut.toDateString()
          ) {
            return CalendarStyles.selectedCheckOut
          }
          return ""
        }}
        className={CalendarStyles.reactCalendar}
      />
    </div>
  )
}

export default CalendarComp

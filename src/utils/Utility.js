export class Utility {
  static yearElapse(dateString) {
    if (dateString == null) return null
    let day = +dateString.substring(0, 2)
    let month = dateString.substring(2, 5)
    let year = +("20" + dateString.substring(5, 7))
    let monNumber = "JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC".indexOf(month) / 3
    let date1 = new Date(year, monNumber, day).getTime()
    let date2 = new Date().getTime()
    const diffTime = Math.abs(date2 - date1)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffYear = diffDays / 365

    return diffYear
  }

  static timeFromString(dateString) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24 * 365
    let day = +dateString.substring(0, 2)
    let month = dateString.substring(2, 5)
    let year = +("20" + dateString.substring(5, 7))
    let monNumber = "JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC".indexOf(month) / 3
    let date1 = new Date(year, monNumber, day).getTime()

    return date1
  }

  static objectsEqual = (o1, o2) => {
    if (o1.length != o2.length) {
      return false
    }

    let isEqual = true
    for (let i = 0; i < o1.length; i++) {
      let a1 = o1[i]
      let a2 = o2[i]

      Object.keys(a1).every(p => {
        isEqual = a1[p] == a2[p]
        return isEqual
      })
    }

    return isEqual
  }
  //created the function from 08AUG24 to Thu Aug 08 2024 00:00:00 GMT+0530 (India Standard Time)
  static parseCustomDate(input) {
    if (input === undefined) return null
    // Month mapping
    const monthMap = {
      JAN: 0,
      FEB: 1,
      MAR: 2,
      APR: 3,
      MAY: 4,
      JUN: 5,
      JUL: 6,
      AUG: 7,
      SEP: 8,
      OCT: 9,
      NOV: 10,
      DEC: 11
    }

    // Regex to match day, month, year from input (18JUL24)
    const match = input.match(/^(\d{2})([A-Z]{3})(\d{2})$/)
    if (!match) {
      console.error("Invalid date format")
      return null
    }

    const day = parseInt(match[1], 10)
    const month = monthMap[match[2]]
    const year = 2000 + parseInt(match[3], 10) // Assuming 20th century for '24'

    // Create Date object
    const date = new Date(year, month, day)

    // Validate the Date object
    if (isNaN(date.getTime())) {
      console.error("Invalid date")
      return null
    }

    return date
  }
  //created the function from 08AUG24 to 1723055400000
  static parseFormattedCustomDate(input) {
    let cusstomParsedDate = Utility.parseCustomDate(input)
    const year = cusstomParsedDate.getFullYear()
    const month = (cusstomParsedDate.getMonth() + 1).toString().padStart(2, "0")
    const day = cusstomParsedDate
      .getDate()
      .toString()
      .padStart(2, "0")
    const formattedDate = `${year}-${month}-${day} 00:00:00`

    let parsedDate = Date.parse(formattedDate)

    return parsedDate
  }

  static formatNumber = num => {
    const crore = 10000000
    const lakh = 100000
    const thousand = 1000

    if (num <= -crore) {
      return (num / crore).toFixed(2) + "Cr"
    } else if (num <= -lakh) {
      return (num / lakh).toFixed(2) + "L"
    } else if (num <= -thousand) {
      return (num / thousand).toFixed(2) + "K"
    } else if (num >= crore) {
      return (num / crore).toFixed(2) + "Cr"
    } else if (num >= lakh) {
      return (num / lakh).toFixed(2) + "L"
    } else if (num >= thousand) {
      return (num / thousand).toFixed(2) + "K"
    } else {
      return num.toString()
    }
  }

  static getCellColor = value => {
    return value >= 0 ? "#008000" : "red"
  }

  static customSort = (data, order) => {
    console.log(data)
    return data.sort((a, b) => {
      const result = a.Delta - b.Delta // Adjust the field as necessary
      return order === 1 ? result : -result
    })
  }
  static formatDate = date => {
    date = new Date(date.getTime() + 1000)
    const day = ("0" + date.getDate()).slice(-2)
    const month = ("0" + (date.getMonth() + 1)).slice(-2)
    const year = date.getFullYear()
    const hours = ("0" + date.getHours()).slice(-2)
    const minutes = ("0" + date.getMinutes()).slice(-2)

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ]
    const monthName = monthNames[date.getMonth()]

    return `${day}-${monthName}-${year} ${hours}:${minutes}`
  }

  static expiredLegListStatus = data => {
    let currentDate = new Date() // Get the current date
    currentDate.setHours(0, 0, 0, 0)
    let expiryDate = new Date(
      `${data.Expiry.slice(0, 2)} ${data.Expiry.slice(
        2,
        5
      )} ${data.Expiry.slice(5, 9)}`
    )
    expiryDate.setHours(0, 0, 0, 0)

    if (currentDate > expiryDate) {
      return true
    }
    return false
  }
}

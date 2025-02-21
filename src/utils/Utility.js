export class Utility { 
  static formatTimestamp(ltt) {
    var timestamp = parseInt(ltt); 
    var date = new Date(timestamp);

    var year = date.getFullYear();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var month = months[date.getMonth()];
    var day = ('0' + date.getDate()).slice(-2);
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var seconds = ('0' + date.getSeconds()).slice(-2);

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }

  static parseCustomDate(input) {
    if (!input) return null;
    const monthMap = { 'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5, 'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11 };
    const match = input.match(/^(\d{2})([A-Z]{3})(\d{2})$/);
    if (!match) return null;
    const day = parseInt(match[1], 10);
    const month = monthMap[match[2]];
    const year = 2000 + parseInt(match[3], 10);
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }

  static parseFormattedCustomDate(input) {
    // console.log('input:', input);
    let customParsedDate = Utility.parseCustomDate(input);  // Use "Utility." instead of "this."
    if (!customParsedDate) return null;
    let formattedDate = `${customParsedDate.getFullYear()}-${(customParsedDate.getMonth() + 1).toString().padStart(2, '0')}-${customParsedDate.getDate().toString().padStart(2, '0')} 00:00:00`;
    return Date.parse(formattedDate);
  }
}

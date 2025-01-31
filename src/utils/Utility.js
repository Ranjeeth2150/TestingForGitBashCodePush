export class Utility {
  formatTimestamp(ltt) {
    var timestamp = parseInt(ltt); 
    var date = new Date(timestamp);

    var year = date.getFullYear();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var month = months[date.getMonth()]; // Get month abbreviation
    var day = ('0' + date.getDate()).slice(-2); // Ensure two-digit day
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var seconds = ('0' + date.getSeconds()).slice(-2);

    var formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
  }
}

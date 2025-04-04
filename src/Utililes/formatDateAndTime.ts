export class FormatDateAndTime {
  static getCurrentTimestamp = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  static formatDate = (date:Date) => {
    
    const now = new Date(date);
   
    const year = now.getFullYear();
    // const month = now.toLocaleString("en-US",{month:"long"});
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
  

    return `${year}-${month}-${day}`;
  };

  static formatDate2 = (date:Date) => {
    
    const now = new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC", // You can change this
    });
    return now;
  };





}


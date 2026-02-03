function formatUnbanDate(UnbanDate: any): string | Date {
  // If the UnbanDate is in a duration format (e.g., "5D", "12H"), convert it to an ISO date
  // Otherwise if its an actual ISO date, return that
  if (typeof UnbanDate === "string" && /^[0-9]+[DHMYS]$/.test(UnbanDate)) {
    const durationRegex = /(\d+)([DHMYS])/;
    const match = UnbanDate.toString().toUpperCase().match(durationRegex);
    if (!match) return "";

    const value = parseInt(match[1]);
    const unit = match[2];

    const now = new Date();
    let unbanDate = new Date(now);

    switch (unit) {
      case "D":
        unbanDate.setDate(now.getDate() + value);
        break;
      case "H":
        unbanDate.setHours(now.getHours() + value);
        break;
      case "M":
        unbanDate.setMinutes(now.getMinutes() + value);
        break;
      case "S":
        unbanDate.setSeconds(now.getSeconds() + value);
        break;
      case "Y":
        unbanDate.setFullYear(now.getFullYear() + value);
        break;
    }

    return unbanDate.toISOString();
  }
  if (!UnbanDate) return "";
  const date = new Date(UnbanDate);
  return date.toISOString();
}

module.exports = { formatUnbanDate };

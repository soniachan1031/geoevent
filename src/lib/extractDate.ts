

/**
 * Extracts the date in YYYY-MM-DD format from an ISO 8601 date string.
 *
 * @param {string} [dateString] - The ISO 8601 date string to extract the date from.
 * @returns {string} The extracted date in YYYY-MM-DD format, or an empty string if the input is undefined or null.
 */
const extractDate = (dateString?: string) => {
  if (!dateString) return "";
  return dateString.split("T")[0]; // Extracts YYYY-MM-DD without timezone shift
};

export default extractDate;
/**
 * Utility functions for date formatting
 * Standard format: dd/mm/yyyy for dates, dd/mm/yyyy HH:mm for datetime
 */

/**
 * Format date string to dd/mm/yyyy
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string in dd/mm/yyyy format
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return 'N/A';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'N/A';
  }
};

/**
 * Format datetime string to dd/mm/yyyy HH:mm
 * @param {string|Date} dateTimeString - DateTime string or Date object
 * @returns {string} Formatted datetime string in dd/mm/yyyy HH:mm format
 */
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  
  try {
    const date = dateTimeString instanceof Date ? dateTimeString : new Date(dateTimeString);
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateTimeString);
      return 'N/A';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting datetime:', error, dateTimeString);
    return 'N/A';
  }
};

/**
 * Format datetime string to dd/mm/yyyy HH:mm:ss
 * @param {string|Date} dateTimeString - DateTime string or Date object
 * @returns {string} Formatted datetime string in dd/mm/yyyy HH:mm:ss format
 */
export const formatDateTimeWithSeconds = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  
  try {
    const date = dateTimeString instanceof Date ? dateTimeString : new Date(dateTimeString);
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateTimeString);
      return 'N/A';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting datetime with seconds:', error, dateTimeString);
    return 'N/A';
  }
};

/**
 * Validate date string format (dd/mm/yyyy)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDateFormat = (dateString) => {
  if (!dateString) return false;
  
  // Check format dd/mm/yyyy
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(dateRegex);
  
  if (!match) return false;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  // Validate month
  if (month < 1 || month > 12) return false;
  
  // Validate day
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;
  
  return true;
};

/**
 * Validate datetime string format (dd/mm/yyyy HH:mm)
 * @param {string} dateTimeString - DateTime string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDateTimeFormat = (dateTimeString) => {
  if (!dateTimeString) return false;
  
  // Check format dd/mm/yyyy HH:mm
  const dateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
  const match = dateTimeString.match(dateTimeRegex);
  
  if (!match) return false;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  const hours = parseInt(match[4], 10);
  const minutes = parseInt(match[5], 10);
  
  // Validate month
  if (month < 1 || month > 12) return false;
  
  // Validate day
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;
  
  // Validate hours
  if (hours < 0 || hours > 23) return false;
  
  // Validate minutes
  if (minutes < 0 || minutes > 59) return false;
  
  return true;
};

/**
 * Parse date string from dd/mm/yyyy format to Date object
 * @param {string} dateString - Date string in dd/mm/yyyy format
 * @returns {Date|null} Date object or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString || !isValidDateFormat(dateString)) return null;
  
  try {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error('Error parsing date:', error, dateString);
    return null;
  }
};

/**
 * Format date for datetime-local input (yyyy-MM-ddTHH:mm)
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted string for datetime-local input
 */
export const formatDateTimeLocal = (date) => {
  if (!date) return '';
  
  try {
    const d = date instanceof Date ? date : new Date(date);
    
    if (isNaN(d.getTime())) {
      console.warn('Invalid date for datetime-local:', date);
      return '';
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting datetime-local:', error, date);
    return '';
  }
};


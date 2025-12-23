// Email validation
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// IPv4 validation
export function isValidIPv4(ip) {
  if (!ip || typeof ip !== 'string') return false;
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

// IPv6 validation
export function isValidIPv6(ip) {
  if (!ip || typeof ip !== 'string') return false;
  const ipv6Regex = /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i;
  return ipv6Regex.test(ip);
}

// IP address validation (IPv4 or IPv6)
export function isValidIP(ip) {
  return isValidIPv4(ip) || isValidIPv6(ip);
}

// Time validation (HH:MM:SS format)
export function isValidTime(time) {
  if (!time || typeof time !== 'string') return false;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return timeRegex.test(time);
}

// Date validation (not in future)
export function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
}

// Positive integer validation
export function isPositiveInteger(value) {
  const num = parseInt(value, 10);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

// Non-empty string validation
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Password strength validation
export function isStrongPassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 8;
}

// Role validation
export function isValidRole(role) {
  const validRoles = ['admin', 'manager', 'analyst', 'viewer'];
  return validRoles.includes(role);
}

// Website visit validation
export function validateWebsiteVisit(data) {
  const errors = [];
  
  if (!isValidIP(data.ip)) {
    errors.push('Invalid IP address format');
  }
  
  if (!isNonEmptyString(data.owner_contact)) {
    errors.push('Owner contact is required');
  }
  
  if (!isPositiveInteger(data.number_of_visits)) {
    errors.push('Number of visits must be a positive integer');
  }
  
  if (!isPositiveInteger(data.website_duration)) {
    errors.push('Website duration must be a positive integer');
  }
  
  if (!isNonEmptyString(data.location)) {
    errors.push('Location is required');
  }
  
  if (!isValidTime(data.time)) {
    errors.push('Invalid time format (use HH:MM:SS)');
  }
  
  if (!isValidDate(data.date)) {
    errors.push('Invalid date or future date not allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Store visit validation
export function validateStoreVisit(data) {
  const errors = [];
  
  if (!isNonEmptyString(data.owner_contact)) {
    errors.push('Owner contact is required');
  }
  
  if (!isPositiveInteger(data.number_of_visits)) {
    errors.push('Number of visits must be a positive integer');
  }
  
  if (!isNonEmptyString(data.location)) {
    errors.push('Location is required');
  }
  
  if (!isValidTime(data.time)) {
    errors.push('Invalid time format (use HH:MM:SS)');
  }
  
  if (!isValidDate(data.date)) {
    errors.push('Invalid date or future date not allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Login/Signup validation
export function validateLoginSignup(data) {
  const errors = [];
  
  if (!isNonEmptyString(data.username)) {
    errors.push('Username is required');
  }
  
  if (!isValidEmail(data.email)) {
    errors.push('Invalid email address');
  }
  
  if (!isNonEmptyString(data.location)) {
    errors.push('Location is required');
  }
  
  if (!isValidTime(data.time)) {
    errors.push('Invalid time format (use HH:MM:SS)');
  }
  
  if (!isValidDate(data.date)) {
    errors.push('Invalid date or future date not allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// User registration validation
export function validateUserRegistration(data) {
  const errors = [];
  
  if (!isNonEmptyString(data.name)) {
    errors.push('Name is required');
  }
  
  if (!isValidEmail(data.email)) {
    errors.push('Invalid email address');
  }
  
  if (!isStrongPassword(data.password)) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  if (!isValidRole(data.role)) {
    errors.push('Invalid role selected');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
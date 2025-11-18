export const validateCustomerRegistration = (data) => {

  const newErrors = {};
  // Phone
  if (!/^(0\d{9})$/.test(data.phone)) {
    newErrors.phone = "Phone number must start with 0 and contain exactly 10 digits.";
  }

  // Citizen ID
  if (!/^\d{12}$/.test(data.citizenId)) {
    newErrors.citizenId = "Citizen ID must contain exactly 12 digits.";
  }

  // Password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
  if (!passwordRegex.test(data.password)) {
    newErrors.password =
      "Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  // Email
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    newErrors.email = "Invalid email format.";
  }

  return newErrors;
};


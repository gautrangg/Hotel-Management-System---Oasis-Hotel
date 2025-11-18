export const validateCustomerUpdate = (data) => {
  const newErrors = {};

  // Name
  const name = data.name || data.fullName;
  if (!name || name.trim() === "") {
    newErrors.name = "Name cannot null";
  }

  // Phone
  if (!/^(0\d{9})$/.test(data.phone)) {
    newErrors.phone = "Phone number must start with 0 and contain exactly 10 digits.";
  }

  //Citizen ID
  if (!/^\d{12}$/.test(data.citizenId)) {
    newErrors.citizenId = "Citizen ID must contain exactly 12 digits.";
  }

  //Email
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    newErrors.email = "Invalid email format.";
  }

  // Address
  if (!data.address || data.address.trim() === "") {
    newErrors.address = "Address cannot null";
  }

  return newErrors;
};

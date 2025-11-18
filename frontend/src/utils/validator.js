import { checkExist } from "@hooks/useStaff.js";



export const validateStaffForm = async (data, mode, staffs = [], currentId = null) => {

  let newErrors = {};

  if (!/^[\p{L}\s]+$/u.test(data.fullName.trim())) {
    newErrors.fullName = "Full name must only contain letters and spaces.";
  }

  if (!data.password) {
    newErrors.password = "Password is required.";
  } else if (data.password) {
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(data.password)) {
      newErrors.password = "Password must be at least 8 characters, include letters, numbers, and one special character.";
    }
  }

  if (!/^\d{10}$/.test(data.phone.trim())) {
    newErrors.phone = "Phone number must be exactly 10 digits.";
  } else if (mode === "add" || (currentId && data.phone !== staffs.find(s => s.staffId === currentId)?.phone)) {
    if (await checkExist("phone", data.phone)) {
      newErrors.phone = "Phone is already used.";
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    newErrors.email = "Invalid email format.";
  } else if (mode === "add" || (currentId && data.email !== staffs.find(s => s.staffId === currentId)?.email)) {
    if (await checkExist("email", data.email)) {
      newErrors.email = "Email is already used.";
    }
  }

  if (!data.birthDate) {
    newErrors.birthDate = "Please select birth date.";
  } else {
    const today = new Date();
    const birthDate = new Date(data.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18 || age > 65) newErrors.birthDate = "Staff must be at least 18 and at most 65 years old.";
  }

  if (!data.roleId) {
    newErrors.roles = "Please select a role.";
  }

  if (!data.gender) {
    newErrors.gender = "Please select gender.";
  }

  if (data.citizenId && !/^\d{9,12}$/.test(data.citizenId.trim())) {
    newErrors.citizenId = "Citizen ID must be 9–12 digits.";
  } else if (data.citizenId) {
    if (mode === "add" || (currentId && data.citizenId !== staffs.find(s => s.staffId === currentId)?.citizenId)) {
      if (await checkExist("citizen-id", data.citizenId)) {
        newErrors.citizenId = "Citizen ID is already used.";
      }
    }
  }


  if (!data.address) {
    newErrors.address = "Please enter an address.";
  }

  return newErrors;
};
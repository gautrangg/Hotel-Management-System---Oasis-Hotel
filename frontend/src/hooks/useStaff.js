import { useState, useEffect } from "react";
import { validateStaffForm } from "@utils/validator";
import { toast } from "react-hot-toast";
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/";

export default function useStaff() {
  const [staffs, setStaffs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [shiftTypes, setShiftTypes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [editRoleId, setEditRoleId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [addForm, setAddForm] = useState({
    fullName: "",
    password: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "Male",
    citizenId: "",
    address: "",
    roleId: "",
    shiftTypeId: 1,
    dayOff: 7,
  });
  const [addFile, setAddFile] = useState(null);
  const [addPreview, setAddPreview] = useState(null);
  const [addErrors, setAddErrors] = useState({});

  const [staffRolesMap, setStaffRolesMap] = useState({});

  // --- Auth headers ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // --- Fetch data ---
  useEffect(() => {
    fetchStaff();
    fetchRoles();
    fetchShiftTypes();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL + "staffs", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch staffs");
      const data = await res.json();
      setStaffs(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch staffs");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL + "roles", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch roles");
      setRoles(await res.json());
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchShiftTypes = async () => {
    try {
      const res = await fetch(API_URL + "shift-types", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch shift types");
      setShiftTypes(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // --- Map staffId -> roleName ---
  useEffect(() => {
    if (staffs.length && roles.length) {
      const map = {};
      staffs.forEach((s) => {
        const role = roles.find((r) => r.roleId === s.roleId);
        map[s.staffId] = role?.roleName || "";
      });
      setStaffRolesMap(map);
    }
  }, [staffs, roles]);

  // --- Select / Edit staff ---
  const handleSelect = (staff) => {
    setSelectedStaff({
      ...staff,
      shiftTypeId: staff.shiftTypeId ? parseInt(staff.shiftTypeId) : 1,
      dayOff: staff.dayOff ? parseInt(staff.dayOff) : 7,
    });
    setEditRoleId(staff.roleId ? Number(staff.roleId) : null);
    setEditFile(null);
    setEditPreview(null);
    setShowModal(true);
    setErrors({});
  };


  const handleChangeSelectedStaff = (e) => {
    const { name, value } = e.target;
    setSelectedStaff((prev) => ({
      ...prev,
      [name]: (name === 'shiftTypeId' || name === 'dayOff')
        ? parseInt(value, 10)
        : value
    }));
  };


  const handleEditRoleChange = (e) => {
    setEditRoleId(Number(e.target.value));
  };


  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFile(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStaff(null);
    setEditFile(null);
    setEditPreview(null);
    setEditRoleId(null);
  };

  // --- Add staff ---
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm({
      ...addForm,
      [name]:
        name === "roleId" || name === "shiftTypeId" || name === "dayOff"
          ? parseInt(value)
          : value,
    });
  };

  const handleAddImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAddFile(file);
      setAddPreview(URL.createObjectURL(file));
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    const newErrors = await validateStaffForm({ ...addForm, file: addFile }, "add", null, staffs);
    setAddErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const data = new FormData();
    if (addFile) data.append("file", addFile);
    Object.keys(addForm).forEach((key) => data.append(key, addForm[key]));

    try {
      const res = await fetch(API_URL + "staffs", {
        method: "POST",
        headers: getAuthHeaders(),
        body: data,
      });
      if (res.ok) {
        toast.success("Staff added!");
        setAddForm({
          fullName: "",
          password: "",
          email: "",
          phone: "",
          birthDate: "",
          gender: "Male",
          citizenId: "",
          address: "",
          roleId: "",
          shiftTypeId: 1,
          dayOff: 7,
        });
        setAddFile(null);
        setAddPreview(null);
        await fetchStaff();
      } else {
        toast.error("Error adding staff");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding staff");
    }
  };

  // --- Update staff ---
  const handleUpdateStaff = async () => {
    if (!selectedStaff) return;

    const newErrors = await validateStaffForm(
      {
        file: editFile,
        fullName: selectedStaff.fullName,
        password: selectedStaff.password,
        email: selectedStaff.email,
        phone: selectedStaff.phone,
        birthDate: selectedStaff.birthDate,
        gender: selectedStaff.gender,
        citizenId: selectedStaff.citizenId,
        address: selectedStaff.address,
        roleId: editRoleId,
      },
      "update",
      staffs,
      selectedStaff.staffId
    );
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const data = new FormData();
    if (editFile) data.append("file", editFile);
    Object.keys(selectedStaff).forEach((key) => {
      if (key !== "staffId" && key !== "roleId") data.append(key, selectedStaff[key]);
    });
    data.append("roleId", editRoleId);

    try {
      const res = await fetch(`${API_URL}staffs/${selectedStaff.staffId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: data,
      });
      if (res.ok) {
        await fetchStaff();
        await fetchRoles();
        setEditFile(null);
        setEditPreview(null);
        toast.success("Staff updated successfully!");
      } else {
        setError("Failed to update staff!");
      }
    } catch (err) {
      console.error(err);
      setError("Error updating staff!");
    }
  };

  // --- Delete staff ---
  const handleDelete = async (staffId) => {

    const confirm = await Swal.fire({
      text: "Are you sure you want to delete this staff?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: "#e63946",
      confirmButtonText: 'Yes, delete it!',
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}staffs/${staffId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await fetchStaff();
        handleCloseModal();
        toast.success("Staff deleted successfully!");
      } else {
        toast.error("Failed to delete staff!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting staff!");
    }
  };

  // --- Filter & pagination ---
  const filteredStaffs = staffs.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (s.fullName ?? "").toLowerCase().includes(term) ||
      (s.phone ?? "").toLowerCase().includes(term) ||
      (s.email ?? "").toLowerCase().includes(term);
    const matchesRole = !selectedRole || staffRolesMap[s.staffId] === selectedRole;
    return matchesSearch && matchesRole;
  });


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentStaffs = filteredStaffs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStaffs.length / recordsPerPage);

  // --- Utility ---
  const checkExist = async (type, value) => {
    try {
      const res = await fetch(`${API_URL}staffs/check-${type}?value=${encodeURIComponent(value)}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      return data.exists;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logoutStaff = () => {
    localStorage.removeItem("token");
    setError(null);
  };

  return {
    staffs,
    roles,
    staffRolesMap,
    shiftTypes,
    currentPage,
    setCurrentPage,
    recordsPerPage,
    setRecordsPerPage,
    searchTerm,
    setSearchTerm,
    selectedRole,
    setSelectedRole,
    errors,
    error,
    loading,
    addForm,
    setAddForm,
    addFile,
    addPreview,
    addErrors,
    handleAddFormChange,
    handleAddImageChange,
    handleAddStaff,
    selectedStaff,
    showModal,
    editPreview,
    showPassword,
    setShowPassword,
    editRoleId,
    handleSelect,
    handleChangeSelectedStaff,
    handleEditRoleChange,
    handleEditImageChange,
    handleUpdateStaff,
    handleCloseModal,
    handleDelete,
    checkExist,
    logoutStaff,
    currentStaffs,
    totalPages,
  };
}


export const checkExist = async (type, value) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/";
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const res = await fetch(
      `${API_URL}staffs/check-${type}?value=${encodeURIComponent(value)}`,
      { headers }
    );
    const data = await res.json();
    return data.exists;
  } catch (err) {
    console.log(err);
    return false;
  }
};


import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import "@assets/price/PriceAdjustment.css";
import Pagination from "@components/base/ui/Pagination";

function PriceAdjustment() {
    const [adjustments, setAdjustments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: 'startDate',
        direction: 'desc'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);

    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        adjustmentType: 'FIXED_AMOUNT',
        adjustmentValue: ''
    });

    const API_URL = 'http://localhost:8080/api/price-adjustments';

    useEffect(() => {
        fetchAdjustments();
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({
            name: '',
            startDate: '',
            endDate: '',
            adjustmentType: 'FIXED_AMOUNT',
            adjustmentValue: ''
        });
        setIsModalOpen(true);
    };

    const fetchAdjustments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                API_URL,
                token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
            );
            setAdjustments(response.data);
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleMenuToggle = (adjustmentId) => {
        setOpenMenuId(openMenuId === adjustmentId ? null : adjustmentId);
    };

    const handleEdit = (adj) => {
        setEditingId(adj.adjustmentId);
        setFormData({
            name: adj.name,
            startDate: adj.startDate,
            endDate: adj.endDate,
            adjustmentType: adj.adjustmentType,
            adjustmentValue: adj.adjustmentValue
        });
        setIsModalOpen(true);
        setOpenMenuId(null);
    };

    const handleDelete = async (id) => {
        setOpenMenuId(null);
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('token');
                    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
                    await axios.delete(`${API_URL}/action/${id}`, config);
                    setAdjustments(adjustments.filter(adj => adj.adjustmentId !== id));
                    Swal.fire(
                        'Deleted!',
                        'The adjustment has been deleted.',
                        'success'
                    );
                } catch (err) {
                    console.error(err);
                    Swal.fire('Error!', 'Failed to delete the adjustment.', 'error');
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEditing = !!editingId;

        Swal.fire({
            title: isEditing ? 'Save Changes?' : 'Add New Adjustment?',
            text: isEditing ? 'The details will be updated.' : 'This will be added to the list.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: isEditing ? 'Save' : 'Add',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const url = isEditing ? `${API_URL}/action/${editingId}` : `${API_URL}/action`;
                const method = isEditing ? 'put' : 'post';

                try {
                    const token = localStorage.getItem('token');
                    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
                    const response = await axios[method](url, formData, config);
                    if (isEditing) {
                        setAdjustments(adjustments.map(adj => adj.adjustmentId === editingId ? response.data : adj));
                    } else {
                        setAdjustments([...adjustments, response.data]);
                    }
                    fetchAdjustments();

                    setIsModalOpen(false);
                    setEditingId(null);

                    await Swal.fire({
                        icon: 'success',
                        title: isEditing ? 'Updated!' : 'Added!',
                        text: `The adjustment has been successfully ${isEditing ? 'updated' : 'added'}.`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                } catch (err) {
                    const errorMessage = err.response && err.response.data ? err.response.data : 'An unknown error occurred.';
                    Swal.fire('Oops...', errorMessage, 'error');
                }
            }
        });
    };

    const handleSortDirectionToggle = () => {
        setSortConfig(prevConfig => ({
            ...prevConfig,
            direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSortKeyChange = (e) => {
        const newKey = e.target.value;
        setSortConfig({
            key: newKey,
            direction: newKey === 'name' ? 'asc' : 'desc'
        });
    };

    const processedAdjustments = useMemo(() => {
        let filtered = [...adjustments];

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(adj =>
                adj.name.toLowerCase().includes(lowerSearchTerm) ||
                adj.adjustmentType.toLowerCase().includes(lowerSearchTerm)
            );
        }

        const { key, direction } = sortConfig;

        filtered.sort((a, b) => {
            const valA = a[key];
            const valB = b[key];

            let comparison = 0;

            if (key === 'name') {
                comparison = valA.localeCompare(valB);
            } else if (key === 'startDate' || key === 'endDate') {
                comparison = new Date(valA) - new Date(valB);
            } else {
                comparison = (valA || 0) - (valB || 0);
            }

            return direction === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [adjustments, searchTerm, sortConfig]);

    const totalRecords = processedAdjustments.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

    const currentAdjustments = processedAdjustments.slice(indexOfFirstRecord, indexOfLastRecord);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortConfig]);

    return (
        <>
            <div className="pa-container">
                <div className="pa-header">
                    <h2 className="pa-title">Price Adjustment Management</h2>
                    <button onClick={openCreateModal} className="pa-add-button">
                        + Add New Adjustment
                    </button>
                </div>

                {isModalOpen && (
                    <div className="pa-modal-backdrop">
                        <div className="pa-modal-content">
                            <div className="pa-modal-header">
                                <h3 className="pa-modal-title">{editingId ? 'Edit' : 'Add New'} Price Adjustment</h3>
                                <button onClick={() => setIsModalOpen(false)} className="pa-modal-close">&times;</button>
                            </div>

                            <form onSubmit={handleSubmit} className="pa-form">
                                <input type="text" name="name" className="pa-form-input" value={formData.name} onChange={handleInputChange} placeholder="Name (e.g., Christmas Surcharge)" required />
                                <input type="date" name="startDate" className="pa-form-input" value={formData.startDate} onChange={handleInputChange} required />
                                <input type="date" name="endDate" className="pa-form-input" value={formData.endDate} onChange={handleInputChange} required />
                                <select name="adjustmentType" className="pa-form-select" value={formData.adjustmentType} onChange={handleInputChange}>
                                    <option value="FIXED_AMOUNT">Fixed Amount (VND)</option>
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                </select>
                                <input type="number" name="adjustmentValue" className="pa-form-input" value={formData.adjustmentValue} onChange={handleInputChange} placeholder="Value (e.g., 200000 or 20)" required />
                                <div className="pa-form-actions">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="pa-form-button pa-button-secondary">Cancel</button>
                                    <button type="submit" className="pa-form-button pa-add-button">{editingId ? 'Save Changes' : 'Add New'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <h3>List of Adjustments</h3>
                <div className="pa-controls">
                    <input 
                        type="text"
                        placeholder="Search by name or type..."
                        className="pa-search-input" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    <div className="pa-sort-controls">
                        <select 
                            className="pa-form-select" 
                            value={sortConfig.key} 
                            onChange={handleSortKeyChange}
                        >
                            <option value="startDate">Sort by Start Date</option>
                            <option value="endDate">Sort by End Date</option>
                            <option value="name">Sort by Name</option>
                            <option value="adjustmentId">Sort by ID</option> 
                        </select>
                        
                        <button onClick={handleSortDirectionToggle} className="pa-sort-button">
                            {sortConfig.direction === 'desc' ? '↓' : '↑'}
                        </button>
                    </div>
                </div>
                <table className="pa-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAdjustments.map((adj) => (
                            <tr key={adj.adjustmentId}>
                                <td>{adj.adjustmentId}</td>
                                <td>{adj.name}</td>
                                <td>{adj.startDate}</td>
                                <td>{adj.endDate}</td>
                                <td>{adj.adjustmentType}</td>
                                <td>{adj.adjustmentType === 'PERCENTAGE' ? `${adj.adjustmentValue}%` : `${Number(adj.adjustmentValue).toLocaleString()} VND`}</td>
                                <td className="pa-actions-cell">
                                    <button onClick={() => handleMenuToggle(adj.adjustmentId)} className="pa-actions-button">
                                        <i className='bx bx-dots-vertical-rounded' />
                                    </button>
                                    {openMenuId === adj.adjustmentId && (
                                        <div className="pa-actions-menu">
                                            <button onClick={() => handleEdit(adj)}>Edit</button>
                                            <button onClick={() => handleDelete(adj.adjustmentId)} className="pa-delete-action">Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalRecords > 0 && (
                    <div className="table-footer">
                        <div className="records-per-page">
                            <span>Show:</span>
                            <select value={recordsPerPage} onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>entries</span>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </>
    );
}

export default PriceAdjustment;
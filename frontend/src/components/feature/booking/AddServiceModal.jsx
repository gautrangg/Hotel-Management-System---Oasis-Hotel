import React, { useState } from 'react';

export default function AddServiceModal({ isOpen, onClose, services, onAdd }) {
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [quantity, setQuantity] = useState(1);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedServiceId || quantity < 1) {
            alert("Please select a service and enter a valid quantity.");
            return;
        }
        const selectedService = services.find(s => s.serviceId.toString() === selectedServiceId);
        onAdd(selectedService, quantity);
        // Reset state for next time
        setSelectedServiceId('');
        setQuantity(1);
    };

    return (
        <div className="panel-overlay show" onClick={onClose}>
            <div className="add-service-modal" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h3>Add Service to Booking</h3>
                    <div className="form-group">
                        <label htmlFor="service">Service</label>
                        <select
                            id="service"
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(e.target.value)}
                            required
                        >
                            <option value="" disabled>-- Select a service --</option>
                            {services.map(service => (
                                <option key={service.serviceId} value={service.serviceId}>
                                    {service.serviceName} ({new Intl.NumberFormat('vi-VN').format(service.pricePerUnit)} ₫)
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="quantity">Quantity</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                            min="1"
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Service</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

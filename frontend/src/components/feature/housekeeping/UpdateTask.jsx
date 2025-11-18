import React, { useState, useEffect } from 'react';
import '@assets/housekeeping/UpdateTask.css';

export default function UpdateTask({ task, onClose, onSave, formatDateTime }) {
    const [currentNote, setCurrentNote] = useState('');
    const [currentStatus, setCurrentStatus] = useState('');

    useEffect(() => {
        if (task) {
            setCurrentNote(task.note || '');
            setCurrentStatus(task.status || 'Assigned');
        }
    }, [task]);

    if (!task) {
        return null;
    }

    const handleStatusClick = () => {
        const newStatus = currentStatus === 'Completed' ? 'In Progress' : 'Completed';
        setCurrentStatus(newStatus);
    };

    const handleSaveClick = () => {
        const updatedTask = {
            ...task,
            note: currentNote,
            status: currentStatus,
        };
        onSave(updatedTask);
    }

    return (
        <div className="t-hk-task-popup-overlay" onClick={onClose}>
            <div className="t-hk-task-popup-container" onClick={(e) => e.stopPropagation()}>
                <header className="t-hk-task-popup-header">
                    <h2>Update Task</h2>
                    <button className="t-hk-task-popup-close-btn" onClick={onClose}>&times;</button>
                </header>

                <main className="t-hk-task-popup-body">
                    <div className="t-hk-task-popup-row">
                        <div className="t-hk-task-popup-field">
                            <label>Room</label>
                            <input type="text" value={task.roomNumber} readOnly />
                        </div>
                        <div className="t-hk-task-popup-field">
                            <label>Booking</label>
                            <input type="text" value={task.bookingId} readOnly />
                        </div>
                    </div>
                    <div className="t-hk-task-popup-field">
                        <label>Assigned time</label>
                        <input type="text" value={formatDateTime(task.assignTime)} readOnly />
                    </div>
                    <div className="t-hk-task-popup-field">
                        <label>Note</label>
                        <textarea
                            rows="5"
                            placeholder="Enter your note..."
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                        />
                    </div>
                </main>

                <footer className="t-hk-task-popup-footer">
                    <button
                        className={`t-hk-task-popup-status-btn ${currentStatus === 'Completed' ? 'completed' : ''}`}
                        onClick={handleStatusClick}
                    >
                        Completed
                    </button>
                    <button className="t-hk-task-popup-save-btn" onClick={handleSaveClick}>Save</button>
                </footer>
            </div>
        </div>
    );
}
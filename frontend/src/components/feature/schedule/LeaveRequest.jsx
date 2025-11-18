import React from 'react';

const getStatusColor = (status) => {
    if (status === "Pending") return "orange";
    if (status === "Approved") return "green";
    if (status === "Rejected") return "red";
    return "black";
};

export default function LeaveRequest({
    data,
    isHistory,
    currentPage,
    itemsPerPage,
    onProcessRequest,
    onDeleteHistory
}) {

    if (!data || data.length === 0) {
        const message = isHistory ? "No history of leave requests found." : "No pending leave requests.";
        return <p>{message}</p>;
    }

    return (
        <table className="quynh-custom-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Person Request</th>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Option</th>
                </tr>
            </thead>
            <tbody>
                {data.map((req, index) => (
                    <tr key={req.requestId}>
                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                        <td>{req.requesterName}</td>
                        <td>{req.date}</td>
                        <td>{req.shift}</td>
                        <td>{req.reason}</td>
                        <td style={{ color: getStatusColor(req.status), fontWeight: "bold" }}>
                            {req.status}
                        </td>
                        <td>
                            {!isHistory ? (
                                <>
                                    <button
                                        className="quynh-approve-btn"
                                        onClick={() => onProcessRequest(req.requestId, 'Approved')}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="quynh-reject-btn"
                                        onClick={() => onProcessRequest(req.requestId, 'Rejected')}
                                    >
                                        Reject
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="quynh-delete-btn"
                                    onClick={() => onDeleteHistory(req.requestId)}
                                >
                                    Delete
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

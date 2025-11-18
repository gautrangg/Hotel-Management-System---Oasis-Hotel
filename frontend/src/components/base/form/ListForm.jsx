import React, { useState, useMemo } from "react";
import "./ListForm.css";

// memoized row
const TableRow = React.memo(({ item, columns, onSelect }) => (
  <tr>
    {columns.map(col => (
      <td key={col.key}>{col.render ? col.render(item) : item[col.key]}</td>
    ))}
    {!columns.some(c => c.key === "action") && (
      <td>
        <button className="orange-btn" onClick={() => onSelect(item)}>
          Select
        </button>
      </td>
    )}
  </tr>
));

export default function ListForm({
  title,
  data,
  columns,
  searchKeys = [],
  modalForm,
  recordsPerPageOptions = [10, 20, 50],
  sortComponent
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(recordsPerPageOptions[0]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = () => {
    setFilterTerm(searchTerm);
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    if (!filterTerm) return data;
    return data.filter(item =>
      searchKeys.some(key =>
        String(item[key]).toLowerCase().includes(filterTerm.toLowerCase())
      )
    );
  }, [data, filterTerm, searchKeys]);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return filteredData.slice(start, start + recordsPerPage);
  }, [filteredData, currentPage, recordsPerPage]);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const handleSelect = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setShowModal(false);
  };

  const renderPagination = () =>
    Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i + 1}
        onClick={() => setCurrentPage(i + 1)}
        className={currentPage === i + 1 ? "active re-orange-btn" : "re-orange-btn"}
      >
        {i + 1}
      </button>
    ));

  return (
    <div className="list-form-container">
      <h1>{title}</h1>

      <div className="list-form-controls" style={{ display: "flex", gap: "8px", marginBottom: 16 }}>
        <select
          value={recordsPerPage}
          onChange={(e) => {
            setRecordsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {recordsPerPageOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
        />
        <button className="orange-btn" onClick={handleSearch}>Search</button>

        {sortComponent && sortComponent}
      </div>

      <div className="table-container">
        <table className="list-form-table">
          <thead>
            <tr>
              {columns.map(col => <th key={col.key}>{col.header}</th>)}
              {!columns.some(c => c.key === "action") && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {currentData.map(item => (
              <TableRow key={item.serviceId} item={item} columns={columns} onSelect={handleSelect} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="list-form-pagination">{renderPagination()}</div>

      {showModal && selectedItem && modalForm?.({ item: selectedItem, onClose: handleCloseModal })}
    </div>
  );
}

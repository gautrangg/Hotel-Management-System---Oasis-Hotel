import React from "react";

export default function SortForm({ options, sortConfig, onChange }) {
  const handleChange = (e) => {
    const [key, direction] = e.target.value.split("-");
    onChange(key, direction);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor="sortSelect" style={{ marginRight: 8 }}>Sort by:</label>
      <select id="sortSelect" onChange={handleChange} value={`${sortConfig.key}-${sortConfig.direction}`}>
        {options.map(opt => (
          <React.Fragment key={opt.key}>
            <option value={`${opt.key}-asc`}>{opt.label} ↑</option>
            <option value={`${opt.key}-desc`}>{opt.label} ↓</option>
          </React.Fragment>
        ))}
      </select>
    </div>
  );
}
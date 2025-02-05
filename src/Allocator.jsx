import React, { useState, useEffect } from "react";
import "./Allocator.css";

function Allocator() {
  const [budget, setBudget] = useState(100000); // Default budget
  const [data, setData] = useState([
    { id: 1, name: "Project A", amount: 20000, category: "Infrastructure", department: "Finance", status: "Ongoing" },
    { id: 2, name: "Project B", amount: 15000, category: "Tech", department: "IT", status: "Completed" },
    { id: 3, name: "Project C", amount: 30000, category: "Healthcare", department: "Medical", status: "Pending" },
    { id: 4, name: "Project D", amount: 25000, category: "Education", department: "Academics", status: "Ongoing" },
  ]);

  const [selectedRows, setSelectedRows] = useState([]);

  // Select all rows by default
  useEffect(() => {
    setSelectedRows(data.map(row => row.id));
  }, [data]);

  const handleCheckboxChange = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  // Function to export selected data to CSV
  const exportToCSV = () => {
    const selectedData = data.filter(row => selectedRows.includes(row.id));
    const csvContent = [
      ["Project Name", "Allocated Amount", "Category", "Department", "Status"],
      ...selectedData.map(row => [row.name, `$${row.amount}`, row.category, row.department, row.status])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "allocated_budget.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="allocator-container">
      <h1>Allocator</h1>
      
      {/* Total Budget Allocation Input */}
      <div className="budget-input">
        <label htmlFor="budget">Total Budget Allocation:</label>
        <input
          type="number"
          id="budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Enter budget"
        />
      </div>

      {/* Table Section */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Project Name</th>
              <th>Allocated Amount</th>
              <th>Category</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className={selectedRows.includes(row.id) ? "selected-row" : ""}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleCheckboxChange(row.id)}
                  />
                </td>
                <td>{row.name}</td>
                <td>${row.amount.toLocaleString()}</td>
                <td>{row.category}</td>
                <td>{row.department}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="allocate-button" onClick={exportToCSV}>
        Export to CSV
      </button>
    </div>
  );
}

export default Allocator;

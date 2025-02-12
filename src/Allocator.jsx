import React, { useState, useEffect } from "react";
import "./Allocator.css";

function Allocator() {
  const [budget, setBudget] = useState(100000); // Default budget
  const [prePostWright, setPrePostWright] = useState("Pre-Wright"); // Global toggle state
  const [data, setData] = useState([
    {
      id: 1,
      electoralDistrict: "Banff--Airdrie",
      leadSharePercentage: 56.7,
      electedParty: "Conservative",
      population: 150000,
      province: "Alberta",
      adjust: 0,
      budgetAllocation: 20000,
    },
    {
      id: 2,
      electoralDistrict: "Calgary Skyview",
      leadSharePercentage: 42.3,
      electedParty: "Liberal",
      population: 200000,
      province: "Alberta",
      adjust: 0,
      budgetAllocation: 15000,
    },
    {
      id: 3,
      electoralDistrict: "Vancouver East",
      leadSharePercentage: 48.5,
      electedParty: "NDP",
      population: 180000,
      province: "British Columbia",
      adjust: 0,
      budgetAllocation: 30000,
    },
    {
      id: 4,
      electoralDistrict: "Toronto Centre",
      leadSharePercentage: 52.1,
      electedParty: "Liberal",
      population: 250000,
      province: "Ontario",
      adjust: 0,
      budgetAllocation: 25000,
    },
  ]);

  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    setSelectedRows(data.map((row) => row.id));
  }, [data]);

  const togglePrePostWright = () => {
    setPrePostWright(prePostWright === "Pre-Wright" ? "Post-Wright" : "Pre-Wright");
  };

  const exportToCSV = () => {
    const selectedData = data.filter((row) => selectedRows.includes(row.id));
    const csvContent = [
      ["Electoral District", "Lead Share %", "Elected Party", "Population", "Province", "Adjust", "Budget Allocation", "Pre/Post-Wright"],
      ...selectedData.map((row) => [
        row.electoralDistrict,
        row.leadSharePercentage + "%",
        row.electedParty,
        row.population.toLocaleString(),
        row.province,
        row.adjust,
        `$${row.budgetAllocation.toLocaleString()}`,
        prePostWright,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

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
      <h1 className="title">Budget Allocator</h1>

      {/* Budget & Toggle Section */}
      <div className="budget-toggle-container">
        <div className="budget-input">
          <label htmlFor="budget" className="budget-label">Total Budget Allocation:</label>
          <input
            type="number"
            id="budget"
            className="budget-field"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            placeholder="Enter budget"
          />
        </div>

        {/* Global Toggle for Pre-Wright / Post-Wright */}
        <div className="toggle-container">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={prePostWright === "Post-Wright"}
              onChange={togglePrePostWright}
            />
            <span className="slider round"></span>
          </label>
          <span className="toggle-text">{prePostWright}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container">
        <table className="budget-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Electoral District</th>
              <th>Lead Share %</th>
              <th>Elected Party</th>
              <th>Population</th>
              <th>Province</th>
              <th>Adjust</th>
              <th>Budget Allocation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className={selectedRows.includes(row.id) ? "selected-row" : ""}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => setSelectedRows((prev) =>
                      prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
                    )}
                  />
                </td>
                <td>{row.electoralDistrict}</td>
                <td>{row.leadSharePercentage}%</td>
                <td>{row.electedParty}</td>
                <td>{row.population.toLocaleString()}</td>
                <td>{row.province}</td>
                <td>
                  <input type="number" className="adjust-input" value={row.adjust} />
                </td>
                <td>
                  <input type="number" className="budget-allocation" value={row.budgetAllocation} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="export-button" onClick={exportToCSV}>
        Export to CSV
      </button>
    </div>
  );
}

export default Allocator;

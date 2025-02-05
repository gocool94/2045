import React, { useState } from "react";
import "./AdminPanel.css";

function AdminPanel() {
  const [link, setLink] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);

  // Function to connect to Snowflake and fetch tables
  const handleConnect = async () => {
    setMessage("");
    setError("");
    setTables([]);
    setTableData([]);

    try {
      const response = await fetch("http://localhost:8000/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link: link,
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.tables) {
        setTables(data.tables);
        setMessage(`Connected! Retrieved ${data.tables.length} tables.`);
        setIsAuthenticated(true); // Hide authentication section
      } else {
        setMessage("Connected successfully!");
      }
    } catch (err) {
      setError("Failed to connect to FastAPI: " + err.message);
    }
  };

  // Function to fetch data from selected table
  const handleGetTableData = async () => {
    if (!selectedTable) {
      setError("Please select a table.");
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(`http://localhost:8000/get_table_data?table=${selectedTable}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.table_data) {
        setTableData(data.table_data);
        setMessage(`Data retrieved for table: ${selectedTable}`);
      } else {
        setTableData([]);
        setMessage("No data available for this table.");
      }
    } catch (err) {
      setError("Failed to retrieve table data: " + err.message);
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>

      {!isAuthenticated ? (
        <div className="auth-section">
          <p>Enter Snowflake credentials to connect.</p>

          <div className="input-group">
            <label>Link:</label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Enter Snowflake link"
              required
            />
          </div>

          <div className="input-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="input-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button className="admin-button" onClick={handleConnect}>
            Connect to Snowflake
          </button>
        </div>
      ) : (
        <div className="tables-section">
          <p>{message}</p>

          {/* Table List */}
          {tables.length > 0 && (
            <div className="tables-grid">
              <h2>Select a Table:</h2>
              <div className="table-list">
                {tables.map((table, index) => (
                  <div
                    key={index}
                    className={`table-item ${selectedTable === table ? "selected" : ""}`}
                    onClick={() => setSelectedTable(table)}
                  >
                    {table}
                  </div>
                ))}
              </div>
              <button className="admin-button get-data" onClick={handleGetTableData}>
                Get Data
              </button>
            </div>
          )}

          {/* Table Data */}
          {tableData.length > 0 && (
            <div className="table-data">
              <h2>Data for: {selectedTable}</h2>
              <table>
                <thead>
                  <tr>
                    {Object.keys(tableData[0]).map((column, index) => (
                      <th key={index}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default AdminPanel;

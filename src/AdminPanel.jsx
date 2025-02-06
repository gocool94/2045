import React, { useState } from "react";
import "./AdminPanel.css";

function AdminPanel() {
  const [link, setLink] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [electoralData, setElectoralData] = useState([]);
  const [isFetchingElectoral, setIsFetchingElectoral] = useState(false);

  // Function to connect to Snowflake
  const handleConnect = async () => {
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link: link,
          username: username,
          password: password,
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      setMessage("Connection Complete");
      setIsAuthenticated(true);
    } catch (err) {
      setError("Failed to connect to FastAPI: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch electoral data
  const handleGetElectoralData = async () => {
    setMessage("");
    setError("");
    setIsFetchingElectoral(true);

    try {
      const response = await fetch("http://localhost:8000/get_electoral_data", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      if (data.electoral_data) {
        setElectoralData(data.electoral_data);
        setMessage("Electoral data retrieved successfully.");
      } else {
        setElectoralData([]);
        setMessage("No electoral data available.");
      }
    } catch (err) {
      setError("Failed to retrieve electoral data: " + err.message);
    } finally {
      setIsFetchingElectoral(false);
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

          <button className="admin-button" onClick={handleConnect} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Connect to Snowflake"}
          </button>

          {isLoading && <div className="loading-spinner"></div>}
        </div>
      ) : (
        <div className="tables-section">
          <p>{message}</p>

          {/* Electoral Data Button */}
          <button className="admin-button get-data" onClick={handleGetElectoralData} disabled={isFetchingElectoral}>
            {isFetchingElectoral ? "Fetching Data..." : "Get Electoral Data"}
          </button>

          {/* Electoral Data */}
          {electoralData.length > 0 && (
            <div className="table-data">
              <h2>Electoral Data</h2>
              <table>
                <thead>
                  <tr>
                    {Object.keys(electoralData[0]).map((column, index) => (
                      <th key={index}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {electoralData.map((row, rowIndex) => (
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

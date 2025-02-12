import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from "react-router-dom";
import GeoBrowser from "./GeoBrowser";
import Allocator from "./Allocator";
import AdminPanel from "./AdminPanel";
import { Globe, Store, Users, Map, Database, CheckCircle } from "lucide-react"; // Icons
import "./App.css"; // Import global styles

function Home() {
  const navigate = useNavigate();

  const apps = [
    { name: "Electoral App", icon: <Globe />, path: "electoral-app" },
    { name: "Dynamic Retail Allocation", icon: <Store />, path: "dynamic-retail-allocation" },
    { name: "Dynamic Flu Allocation", icon: <CheckCircle />, path: "dynamic-flu-allocation" },
    { name: "Census Allocator (Canada)", icon: <Map />, path: "census-allocator-canada" },
    { name: "Census Allocator (USA)", icon: <Map />, path: "census-allocator-usa", country: "USA" },
    { name: "Dynamic Flu Allocation (USA)", icon: <CheckCircle />, path: "dynamic-flu-allocation-usa", country: "USA" },
    { name: "Dynamic Retail Allocation (USA)", icon: <Store />, path: "dynamic-retail-allocation-usa", country: "USA" }
  ];

  return (
    <div className="container">
      <h1>Select an Application</h1>
      <div className="grid-container">
        {apps.map((app, index) => (
          <div
            key={index}
            className="grid-item"
            onClick={() => navigate(`/app/${app.path}`)}
          >
            <div className="icon">{app.icon}</div>
            <p>{app.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppLayout() {
  const { appName } = useParams();
  const [activeTab, setActiveTab] = useState("geo");

  return (
    <div className="container">
      <h1>{appName.replace(/-/g, " ").toUpperCase()}</h1>
      <div className="tabs">
        <button
          className={activeTab === "geo" ? "active" : ""}
          onClick={() => setActiveTab("geo")}
        >
          Geo Browser
        </button>
        <button
          className={activeTab === "allocator" ? "active" : ""}
          onClick={() => setActiveTab("allocator")}
        >
          Allocator
        </button>
      </div>
      <div className="content">
        {activeTab === "geo" ? <GeoBrowser /> : <Allocator />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div>
        <nav>
          <Link to="/" className="nav-button">Home</Link>
          <Link to="/admin" className="nav-button">Admin Panel</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app/:appName" element={<AppLayout />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

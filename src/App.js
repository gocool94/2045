import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from "react-router-dom";
import GeoBrowser from "./GeoBrowser";
import Allocator from "./Allocator";
import AdminPanel from "./AdminPanel";
import "./App.css"; // Import global styles

function Home() {
  const navigate = useNavigate();
  const apps = ["App1", "App2", "App3", "App4"];

  return (
    <div className="home-container">
      <div className="grid-container">
        {apps.map((app, index) => (
          <div key={index} className="grid-item" onClick={() => navigate(`/app/${app.toLowerCase()}`)}>
            {app}
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
    <div className="app-container">
      <h1>{appName.toUpperCase()}</h1>
      <div className="tabs">
        <button className={activeTab === "geo" ? "active" : ""} onClick={() => setActiveTab("geo")}>
          Geo Browser
        </button>
        <button className={activeTab === "allocator" ? "active" : ""} onClick={() => setActiveTab("allocator")}>
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
      <div className="container">
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

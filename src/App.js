import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import GeoBrowser from "./GeoBrowser";
import Allocator from "./Allocator";
import AdminPanel from "./AdminPanel";
import "./App.css"; // Import global styles

function App() {
  return (
    <Router>
      <div className="container">
        <nav>
          <Link to="/" className="bg-blue-500 text-white px-4 py-2 rounded">Geo Browser</Link>
          <Link to="/allocator" className="bg-green-500 text-white px-4 py-2 rounded">Allocator</Link>
          <Link to="/admin" className="bg-gray-500 text-white px-4 py-2 rounded">Admin Panel</Link>
        </nav>

        <Routes>
          <Route path="/" element={<GeoBrowser />} />
          <Route path="/allocator" element={<Allocator />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

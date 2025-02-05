import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./GeoBrowser.css";

function GeoBrowser() {
  const [filters, setFilters] = useState({
    label1: "",
    label2: "",
    label3: "",
    label4: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Filters submitted:", filters);
    alert("Filters applied: " + JSON.stringify(filters));
  };

  return (
    <div className="geo-browser-container">

      {/* Filters Section (Row Layout) */}
      <form className="filters-form" onSubmit={handleSubmit}>
        <div className="filter-group">
          <label htmlFor="label1">Province</label>
          <select name="label1" id="label1" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Option 1">Option 1</option>
            <option value="Option 2">Option 2</option>
            <option value="Option 3">Option 3</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="label2">Electoral District name</label>
          <select name="label2" id="label2" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Option A">Option A</option>
            <option value="Option B">Option B</option>
            <option value="Option C">Option C</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="label3">Urban/SemiRural/Rural</label>
          <select name="label3" id="label3" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Data X">Data X</option>
            <option value="Data Y">Data Y</option>
            <option value="Data Z">Data Z</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="label4">Elected candidate party</label>
          <select name="label4" id="label4" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Type 1">Type 1</option>
            <option value="Type 2">Type 2</option>
            <option value="Type 3">Type 3</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="label4">Elected lliberal</label>
          <select name="label4" id="label4" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Type 1">Type 1</option>
            <option value="Type 2">Type 2</option>
            <option value="Type 3">Type 3</option>
          </select>
        </div>

        <button type="submit" className="geo-button">Submit</button>
      </form>

      {/* Map Section Below Filters */}
      <div className="map-container">
        <h2>Map View</h2>
        <MapContainer center={[45.4215, -75.6972]} zoom={5} scrollWheelZoom={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[45.4215, -75.6972]}>
            <Popup>
              Default Location: Ottawa, Canada
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default GeoBrowser;

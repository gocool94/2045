import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./GeoBrowser.css";

function GeoBrowser() {
  const [filters, setFilters] = useState({
    province: "",
    electoralDistrict: "",
    urbanRural: "",
    electedParty: "",
    electedCandidate: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    provinces: [],
    districts: [],
    urbanTypes: [],
    parties: [],
    candidates: [],
  });

  const [mapData, setMapData] = useState([]); // Store electoral district data with coordinates

  // Fetch JSON data on component mount
  useEffect(() => {
    fetch("/formatted_electoral_data.json") // Ensure the JSON file is in `public/`
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched JSON Data:", data); // Debugging Log

        // Extract unique values for dropdowns
        const provinces = [...new Set(data.map((item) => item.PROVINCE))];
        const districts = [...new Set(data.map((item) => item.ELECTORAL_DISTRICT_NAME))];
        const urbanTypes = [...new Set(data.map((item) => item.URBAN_SEMIURBAN_RURAL))];
        const parties = [...new Set(data.flatMap((item) =>
          item.candidates.map((candidate) => candidate.ELECTED_CANDIDATE_PARTY).filter(Boolean)))];
        const candidates = [...new Set(data.flatMap((item) =>
          item.candidates.map((candidate) => candidate.ELECTED_CANDIDATE).filter(Boolean)))];

        // Add coordinates for mapping (you need a dataset for real locations)
        const mappedData = data.map((item, index) => ({
          id: index,
          districtName: item.ELECTORAL_DISTRICT_NAME,
          province: item.PROVINCE,
          coordinates: getCoordinates(item.ELECTORAL_DISTRICT_NAME), // Fetch coordinates dynamically
        }));

        setFilterOptions({ provinces, districts, urbanTypes, parties, candidates });
        setMapData(mappedData);
      })
      .catch((error) => console.error("Error loading JSON data:", error));
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Filters submitted:", filters);
    alert("Filters applied: " + JSON.stringify(filters));
  };

  // Function to get coordinates based on electoral district name
  const getCoordinates = (districtName) => {
    const districtCoordinates = {
      "Avalon": [47.516, -52.781], // Example: Coordinates for Avalon district
      "Bonavista--Burin--Trinity": [48.650, -53.000],
      "Coast of Bays--Central--Notre Dame": [49.500, -54.000],
      "Labrador": [53.000, -60.000],
      "Long Range Mountains": [49.000, -57.000],
    };
    return districtCoordinates[districtName] || [45.4215, -75.6972]; // Default: Ottawa
  };

  return (
    <div className="geo-browser-container">
      {/* Filters Section */}
      <form className="filters-form" onSubmit={handleSubmit}>
        <div className="filter-group">
          <label htmlFor="province">Province</label>
          <select name="province" id="province" onChange={handleChange} required>
            <option value="">Select</option>
            {filterOptions.provinces.map((province, index) => (
              <option key={index} value={province}>{province}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="electoralDistrict">Electoral District Name</label>
          <select name="electoralDistrict" id="electoralDistrict" onChange={handleChange} required>
            <option value="">Select</option>
            {filterOptions.districts.map((district, index) => (
              <option key={index} value={district}>{district}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="urbanRural">Urban/Semi-Urban/Rural</label>
          <select name="urbanRural" id="urbanRural" onChange={handleChange} required>
            <option value="">Select</option>
            {filterOptions.urbanTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="electedParty">Elected Candidate Party</label>
          <select name="electedParty" id="electedParty" onChange={handleChange} required>
            <option value="">Select</option>
            {filterOptions.parties.map((party, index) => (
              <option key={index} value={party}>{party}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="electedCandidate">Elected Candidate</label>
          <select name="electedCandidate" id="electedCandidate" onChange={handleChange} required>
            <option value="">Select</option>
            {filterOptions.candidates.map((candidate, index) => (
              <option key={index} value={candidate}>{candidate}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="geo-button">Submit</button>
      </form>

      {/* Map Section */}
      <div className="map-container">
        <h2>Map View</h2>
        <MapContainer center={[45.4215, -75.6972]} zoom={5} scrollWheelZoom={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Add Markers for Electoral Districts */}
          {mapData.map((district) => (
            <Marker key={district.id} position={district.coordinates}>
              <Popup>
                <strong>{district.districtName}</strong> <br />
                Province: {district.province}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default GeoBrowser;

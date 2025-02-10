import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./GeoBrowser.css";

function GeoBrowser() {
  const [filters, setFilters] = useState({
    province: "",
    electoralDistrict: "",
    urbanRural: "",
    candidateName: "",
    candidateParty: "",
  });

  const [electoralData, setElectoralData] = useState({});
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [filteredGeoJson, setFilteredGeoJson] = useState(null);
  const [mapCenter, setMapCenter] = useState([56, -106]);
  const [mapKey, setMapKey] = useState(Date.now());
  const [bbox, setBbox] = useState(null);

  useEffect(() => {
    fetch("/formatted_electoral_data.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Electoral Data:", data);
        setElectoralData(data);
      })
      .catch((error) => console.error("❌ Error loading electoral data:", error));

    fetch("/georef-canada-province.geojson")
      .then((response) => response.json())
      .then((geoData) => {
        console.log("Fetched GeoJSON:", geoData);
        setGeoJsonData(geoData);
      })
      .catch((error) => console.error("❌ Error loading GeoJSON data:", error));
  }, []);

  const handleProvinceChange = (e) => {
    const selectedProvince = e.target.value;
    setFilters({
      province: selectedProvince,
      electoralDistrict: "",
      urbanRural: "",
      candidateName: "",
      candidateParty: "",
    });

    if (electoralData[selectedProvince]) {
      setFilteredDistricts(electoralData[selectedProvince]);
    } else {
      setFilteredDistricts([]);
    }
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      electoralDistrict: selectedDistrict,
      candidateName: "",
      candidateParty: "",
    }));

    if (filteredDistricts.length > 0) {
      const selectedData = filteredDistricts.find(
        (d) => d.ELECTORAL_DISTRICT_NAME === selectedDistrict
      );

      if (selectedData) {
        // 🔥 Auto-update Urban/Semi-Urban/Rural field from JSON
        setFilters((prevFilters) => ({
          ...prevFilters,
          urbanRural: selectedData.URBAN_SEMIURBAN_RURAL,
        }));

        setFilteredCandidates([...new Set(selectedData.candidates.map((c) => c.CANDIDATE_NAME))]);
        setFilteredParties([...new Set(selectedData.candidates.map((c) => c.CANDIDATE_PARTY))]);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (geoJsonData) {
      const selectedFeature = geoJsonData.features.find(
        (feature) => feature.properties.prov_name_en === filters.province
      );

      if (selectedFeature) {
        setFilteredGeoJson({ type: "FeatureCollection", features: [selectedFeature] });

        if (selectedFeature.bbox) {
          const [minLng, minLat, maxLng, maxLat] = selectedFeature.bbox;
          const centerLat = (minLat + maxLat) / 2;
          const centerLng = (minLng + maxLng) / 2;
          setMapCenter([centerLat, centerLng]);
          setBbox(selectedFeature.bbox);
        }

        setMapKey(Date.now()); // 🔥 Force map reload
      }
    }
  };

  return (
    <div className="geo-browser-container">
      <form className="filters-form" onSubmit={handleSubmit}>
        <div className="filter-row">
          <label htmlFor="province" className="filter-label">Province</label>
          <select name="province" id="province" onChange={handleProvinceChange} required className="filter-input">
            <option value="">Select Province</option>
            {Object.keys(electoralData).map((province, index) => (
              <option key={index} value={province}>{province}</option>
            ))}
          </select>
        </div>

        <div className="filter-row">
          <label htmlFor="electoralDistrict" className="filter-label">Electoral District</label>
          <select name="electoralDistrict" id="electoralDistrict" onChange={handleDistrictChange} required className="filter-input">
            <option value="">Select District</option>
            {filteredDistricts.map((district, index) => (
              <option key={index} value={district.ELECTORAL_DISTRICT_NAME}>
                {district.ELECTORAL_DISTRICT_NAME}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-row">
          <label htmlFor="urbanRural" className="filter-label">Urban/Semi-Urban/Rural</label>
          <input type="text" id="urbanRural" value={filters.urbanRural} readOnly className="filter-input" />
        </div>

        <div className="filter-row">
          <label htmlFor="candidateName" className="filter-label">Candidate Name</label>
          <select name="candidateName" id="candidateName" onChange={(e) => setFilters({ ...filters, candidateName: e.target.value })} className="filter-input">
            <option value="">Select</option>
            {filteredCandidates.map((candidate, index) => (
              <option key={index} value={candidate}>{candidate}</option>
            ))}
          </select>
        </div>

        <div className="filter-row">
          <label htmlFor="candidateParty" className="filter-label">Candidate Party</label>
          <select name="candidateParty" id="candidateParty" onChange={(e) => setFilters({ ...filters, candidateParty: e.target.value })} className="filter-input">
            <option value="">Select</option>
            {filteredParties.map((party, index) => (
              <option key={index} value={party}>{party}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="geo-button">Submit</button>
      </form>

      {bbox && (
        <div className="bbox-info">
          <h3>Bounding Box:</h3>
          <p>Min Longitude: {bbox[0]}</p>
          <p>Min Latitude: {bbox[1]}</p>
          <p>Max Longitude: {bbox[2]}</p>
          <p>Max Latitude: {bbox[3]}</p>
        </div>
      )}

      <div className="map-container">
        <h2>Map View</h2>
        <MapContainer key={mapKey} center={mapCenter} zoom={5} scrollWheelZoom={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredGeoJson && <GeoJSON data={filteredGeoJson} style={{ color: "blue", weight: 2, fillOpacity: 0.3 }} />}
        </MapContainer>
      </div>
    </div>
  );
}

export default GeoBrowser;

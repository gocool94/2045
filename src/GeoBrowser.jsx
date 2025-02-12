import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./GeoBrowser.css";

function GeoBrowser() {
  const [filters, setFilters] = useState({
    geo: "",
    electoralDistrict: "",
    urbanRural: "",
    electedParty: "",
    percentage: "",
  });

  const [electoralData, setElectoralData] = useState({});
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [allGeoJson, setAllGeoJson] = useState(null);
  const [uniqueParties, setUniqueParties] = useState([]);
  const [mapKey, setMapKey] = useState(Date.now());

  useEffect(() => {
    fetch("/formatted_electoral_data.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Fetched Electoral Data:", data);
        setElectoralData(data);

        // Extract unique elected parties dynamically
        const parties = new Set();
        Object.values(data).flat().forEach((district) => {
          district.candidates.forEach((candidate) => parties.add(candidate.CANDIDATE_PARTY));
        });
        setUniqueParties([...parties]);
      })
      .catch((error) => console.error("❌ Error loading electoral data:", error));
  }, []);

  const handleGeoChange = (e) => {
    const selectedGeo = e.target.value;
    console.log("🌎 Geo Selected:", selectedGeo);

    setFilters({
      geo: selectedGeo,
      electoralDistrict: "",
      urbanRural: "",
      electedParty: "",
      percentage: "",
    });

    if (selectedGeo === "Canada") {
      // Highlight all provinces in Canada
      const allFeatures = Object.values(electoralData)
        .flatMap((province) => province.map((district) => district.geojson))
        .filter((geojson) => geojson);

      setAllGeoJson({ type: "FeatureCollection", features: allFeatures });
      setFilteredDistricts([]);
      setMapKey(Date.now());
    } else if (electoralData[selectedGeo]) {
      // Highlight selected province
      const provinceFeatures = electoralData[selectedGeo].map((district) => district.geojson).filter(Boolean);

      setFilteredDistricts(electoralData[selectedGeo]);
      setAllGeoJson({ type: "FeatureCollection", features: provinceFeatures });
      setMapKey(Date.now());
    }
  };

  const handleSubmit = () => {
    console.log("🛠 Applying Filters:", filters);

    let selectedData = Object.values(electoralData)
      .flatMap((province) => province)
      .filter((district) => {
        let matches = true;

        // Filter by Province
        if (filters.geo !== "Canada" && filters.geo && district.PROVINCE !== filters.geo) {
          matches = false;
        }

        // Filter by Urban/Semi-Urban/Rural
        if (filters.urbanRural && district.URBAN_SEMIURBAN_RURAL !== filters.urbanRural) {
          matches = false;
        }

        // Filter by Elected Party (All candidates must belong to the selected party)
        if (filters.electedParty) {
          const allMatchParty = district.candidates.every(
            (candidate) => candidate.CANDIDATE_PARTY === filters.electedParty
          );
          if (!allMatchParty) matches = false;
        }

        // Filter by Percentage (All candidates must be above/below 15%)
        if (filters.percentage === "Above 15%") {
          const allAbove15 = district.candidates.every(
            (candidate) => candidate.PERCENTAGE_OF_VOTES_OBTAINED > 15
          );
          if (!allAbove15) matches = false;
        }

        if (filters.percentage === "Below 15%") {
          const allBelow15 = district.candidates.every(
            (candidate) => candidate.PERCENTAGE_OF_VOTES_OBTAINED < 15
          );
          if (!allBelow15) matches = false;
        }

        return matches;
      });

    const filteredGeoJson = {
      type: "FeatureCollection",
      features: selectedData.map((district) => district.geojson).filter(Boolean),
    };

    console.log("📍 Filtered JSON Data:", JSON.stringify(selectedData, null, 2));
    setAllGeoJson(filteredGeoJson);
    setMapKey(Date.now());
  };

  return (
    <div className="geo-browser-container">
      <form className="filters-form">
        {/* Geo Filter */}
        <div className="filter-row">
          <label className="filter-label">Geo</label>
          <select onChange={handleGeoChange} className="filter-input">
            <optgroup label="Nation">
              <option value="Canada">Canada</option>
            </optgroup>
            <optgroup label="Province">
              {Object.keys(electoralData).map((province, index) => (
                <option key={index} value={province}>{province}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Electoral District Filter */}
        <div className="filter-row">
          <label className="filter-label">Electoral District</label>
          <select className="filter-input" onChange={(e) => setFilters({ ...filters, electoralDistrict: e.target.value })}>
            <option value="">Select District</option>
            {filteredDistricts.map((district, index) => (
              <option key={index} value={district.ELECTORAL_DISTRICT_NAME}>
                {district.ELECTORAL_DISTRICT_NAME}
              </option>
            ))}
          </select>
        </div>

        {/* Urban/Semi-Urban/Rural Filter */}
        <div className="filter-row">
          <label className="filter-label">Urban/Semi-Urban/Rural</label>
          <select className="filter-input" onChange={(e) => setFilters({ ...filters, urbanRural: e.target.value })}>
            <option value="">Select Type</option>
            <option value="Urban">Urban</option>
            <option value="Semi-Urban">Semi-Urban</option>
            <option value="Rural">Rural</option>
          </select>
        </div>

        {/* Elected Party Filter (Dynamically Populated) */}
        <div className="filter-row">
          <label className="filter-label">Elected Party</label>
          <select className="filter-input" onChange={(e) => setFilters({ ...filters, electedParty: e.target.value })}>
            <option value="">Select Party</option>
            {uniqueParties.map((party, index) => (
              <option key={index} value={party}>{party}</option>
            ))}
          </select>
        </div>

        {/* Percentage Filter */}
        <div className="filter-row">
          <label className="filter-label">Percentage</label>
          <select className="filter-input" onChange={(e) => setFilters({ ...filters, percentage: e.target.value })}>
            <option value="">Select Percentage</option>
            <option value="Above 15%">Above 15%</option>
            <option value="Below 15%">Below 15%</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="button" className="submit-button" onClick={handleSubmit}>
          Apply Filters
        </button>
      </form>

      {/* Map Container */}
      <div className="map-container">
        <MapContainer key={mapKey} center={[56, -106]} zoom={5} scrollWheelZoom={true}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {allGeoJson && <GeoJSON data={allGeoJson} style={{ color: "blue", weight: 2, opacity: 0.8, fillOpacity: 0.4 }} />}
        </MapContainer>
      </div>
    </div>
  );
}

export default GeoBrowser;

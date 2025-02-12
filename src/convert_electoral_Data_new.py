import pandas as pd
import json
import os

def convert_csv_to_nested_json():
    # Define file paths
    csv_file_path = r"D:\Projects\React-Websites\2045\2045\src\electoral_data.csv"
    json_file_path = r"D:\Projects\React-Websites\2045\2045\src\formatted_electoral_data.json"
    geojson_folder = r"D:\Projects\React-Websites\2045\2045\src\canadian-electoral-districts\canadian-electoral-districts-master\districts\all"  # All GeoJSONs in one folder

    print(f"📂 Loading CSV from: {csv_file_path}")

    # Check if the CSV file exists
    if not os.path.exists(csv_file_path):
        print(f"🚨 Error: File '{csv_file_path}' not found!")
        return

    # Load the CSV file
    df = pd.read_csv(csv_file_path)
    print(f"✅ CSV file successfully loaded. Total rows: {len(df)}")

    # Replace NaN values with empty strings
    df = df.fillna("")

    # Group by Province, Electoral District Number, and District Name
    formatted_data = (
        df.groupby(["PROVINCE", "ELECTORAL_DISTRICT_NUMBER", "ELECTORAL_DISTRICT_NAME", "URBAN_SEMIURBAN_RURAL"])
        .apply(lambda x: x[[
            "CANDIDATE_NAME", "CANDIDATE_PARTY", "VOTES_OBTAINED", "PERCENTAGE_OF_VOTES_OBTAINED"
        ]].to_dict(orient="records"))
        .reset_index(name="candidates")
    )

    print(f"✅ Data grouped successfully. Total unique districts: {len(formatted_data)}")

    # Convert to JSON structure
    nested_json = {}

    for index, row in formatted_data.iterrows():
        province_name = row["PROVINCE"].strip()  # Full province name from CSV
        district_id = str(row["ELECTORAL_DISTRICT_NUMBER"])  # Use district ID for GeoJSON lookup
        district_name = row["ELECTORAL_DISTRICT_NAME"]
        urban_type = row["URBAN_SEMIURBAN_RURAL"]
        candidates = row["candidates"]

        print(f"\n🔎 DEBUG: Processing row {index+1}")
        print(f"   - Province: {province_name}")
        print(f"   - Electoral District ID: {district_id}")
        print(f"   - Electoral District Name: {district_name}")

        # Construct the path to the GeoJSON file
        geojson_path = os.path.join(geojson_folder, f"{district_id}.geojson")
        print(f"📂 Checking GeoJSON file at: {geojson_path}")

        # Load GeoJSON file if it exists
        geojson_data = None
        if os.path.exists(geojson_path):
            with open(geojson_path, "r", encoding="utf-8") as geojson_file:
                geojson_data = json.load(geojson_file)
            print(f"✅ GeoJSON loaded for District ID: {district_id}")
        else:
            print(f"⚠️ GeoJSON file missing for District ID: {district_id}")

        # Organize JSON structure (using full province name)
        if province_name not in nested_json:
            nested_json[province_name] = []

        nested_json[province_name].append({
            "ELECTORAL_DISTRICT_NUMBER": district_id,
            "ELECTORAL_DISTRICT_NAME": district_name,
            "URBAN_SEMIURBAN_RURAL": urban_type,
            "candidates": candidates,
            "geojson": geojson_data  # Add GeoJSON content (or null if missing)
        })

    # Save JSON file
    with open(json_file_path, "w", encoding="utf-8") as json_file:
        json.dump(nested_json, json_file, indent=4, ensure_ascii=False)

    print(f"✅ JSON file successfully saved as '{json_file_path}'")

if __name__ == "__main__":
    convert_csv_to_nested_json()

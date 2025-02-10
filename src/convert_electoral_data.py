import pandas as pd
import json
import os

def convert_csv_to_nested_json():
    # Define file paths
    csv_file_path = f"D:\\Projects\\React-Websites\\2045\\2045\\src\\electoral_data.csv"  # Ensure this file exists
    json_file_path = f"D:\\Projects\\React-Websites\\2045\\2045\\src\\formatted_electoral_data.json"

    print(csv_file_path)

    # Check if the CSV file exists
    if not os.path.exists(csv_file_path):
        print(f"🚨 Error: File '{csv_file_path}' not found!")
        return

    # Load the CSV file
    df = pd.read_csv(csv_file_path)

    # Replace NaN values with empty strings or 0
    df = df.fillna("")

    # Group by PROVINCE and ELECTORAL_DISTRICT_NAME, then aggregate candidates
    formatted_data = (
        df.groupby(["PROVINCE", "ELECTORAL_DISTRICT_NAME", "URBAN_SEMIURBAN_RURAL"])
        .apply(lambda x: x[["CANDIDATE_NAME", "CANDIDATE_PARTY"]].to_dict(orient="records"))
        .reset_index(name="candidates")
    )

    # Convert to JSON structure
    nested_json = {}

    for _, row in formatted_data.iterrows():
        province = row["PROVINCE"]
        district = row["ELECTORAL_DISTRICT_NAME"]
        urban_type = row["URBAN_SEMIURBAN_RURAL"]
        candidates = row["candidates"]

        if province not in nested_json:
            nested_json[province] = []

        nested_json[province].append({
            "ELECTORAL_DISTRICT_NAME": district,
            "URBAN_SEMIURBAN_RURAL": urban_type,
            "candidates": candidates
        })

    # Save JSON file
    with open(json_file_path, "w", encoding="utf-8") as json_file:
        json.dump(nested_json, json_file, indent=4, ensure_ascii=False)

    print(f"✅ JSON file successfully saved as '{json_file_path}'")

if __name__ == "__main__":
    convert_csv_to_nested_json()

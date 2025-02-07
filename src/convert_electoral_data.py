import pandas as pd
import json
import os

def convert_csv_to_json():
    # Define file paths
    csv_file_path = "D:\\Projects\\React-Websites\\2045\\2045\\src\\electoral_data.csv"  # Ensure this file exists
    json_file_path = "formatted_electoral_data.json"

    # Check if the CSV file exists
    if not os.path.exists(csv_file_path):
        print(f"🚨 Error: File '{csv_file_path}' not found!")
        return

    # Load the CSV file
    df = pd.read_csv(csv_file_path)

    # Replace NaN values with 0
    df = df.fillna(0)

    # Group by district details and aggregate candidate data into a list
    formatted_data = df.groupby(
        ["ELECTORAL_DISTRICT_NUMBER", "PROVINCE", "ELECTORAL_DISTRICT_NAME", "URBAN_SEMIURBAN_RURAL"]
    ).apply(lambda x: x[
        ["CANDIDATE_NAME", "CANDIDATE_PARTY", "VOTES_OBTAINED", "PERCENTAGE_OF_VOTES_OBTAINED",
         "MAJORITY", "MAJORITY_PERCENTAGE", "POPULATION", "ELECTORS", 
         "PERCENTAGE_OF_VOTER_TURNOUT", "ELECTED_CANDIDATE", "ELECTED_CANDIDATE_PARTY", "PROV_CODE"]
    ].to_dict(orient="records")).reset_index(name="candidates")

    # Convert the formatted data to JSON
    json_output = json.dumps(formatted_data.to_dict(orient="records"), indent=4)

    # Save JSON file
    with open(json_file_path, "w") as json_file:
        json_file.write(json_output)

    print(f"✅ JSON file successfully saved as '{json_file_path}'")

if __name__ == "__main__":
    convert_csv_to_json()

import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import snowflake.connector
import json
import pandas as pd
import os
# Configure logging to show logs in the console
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SnowflakeCredentials(BaseModel):
    link: str
    username: str
    password: str

# Store Snowflake connection details
session_data = {}

def extract_snowflake_account(url: str) -> str:
    """Extracts the Snowflake account identifier from a valid Snowflake URL."""
    try:
        if not url.startswith("https://"):
            raise ValueError("Invalid Snowflake URL format.")

        if not url.endswith(".snowflakecomputing.com"):
            raise ValueError("Invalid Snowflake account format.")

        account = url.replace("https://", "").split(".snowflakecomputing.com")[0]

        if not account or "." not in account:
            raise ValueError("Invalid Snowflake account format.")

        logging.info(f"Extracted Snowflake account: {account}")
        return account

    except Exception as e:
        logging.error(f"Error extracting Snowflake account: {e}")
        raise HTTPException(status_code=400, detail="Invalid Snowflake URL format.")

@app.post("/connect")
async def get_snowflake_tables(credentials: SnowflakeCredentials):
    """Connects to Snowflake and retrieves the list of tables."""
    try:
        logging.info(f"Received request to connect to Snowflake from user: {credentials.username}")

        account = extract_snowflake_account(credentials.link)

        conn = snowflake.connector.connect(
            user=credentials.username,
            password=credentials.password,
            account=account
        )
        logging.info("Successfully connected to Snowflake.")

        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables = [row[1] for row in cursor.fetchall()]
        logging.info(f"Retrieved {len(tables)} tables from Snowflake.")

        # Store connection details for future use
        session_data["account"] = account
        session_data["username"] = credentials.username
        session_data["password"] = credentials.password

        cursor.close()
        conn.close()
        logging.info("Snowflake connection closed.")

        return {"tables": tables}

    except Exception as e:
        logging.error(f"General API error: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to Snowflake.")


@app.get("/get_electoral_data")
async def get_electoral_data():
    """Fetches electoral data from Snowflake, saves it in the current directory, and returns JSON."""
    try:
        logging.info("🔹 Step 1: Checking session authentication")
        if "account" not in session_data:
            raise HTTPException(status_code=401, detail="No active Snowflake session. Please authenticate first.")

        logging.info("🔹 Step 2: Connecting to Snowflake")

        # Connect to Snowflake
        conn = snowflake.connector.connect(
            user=session_data["username"],
            password=session_data["password"],
            account=session_data["account"]
        )
        cursor = conn.cursor()

        logging.info("🔹 Step 3: Executing Snowflake Query")
        query = "SELECT * FROM DEV_DATA_ENRICHMENT.CANADA_ELECTORAL.ELECTORAL_DATA"
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()

        logging.info(f"🔹 Step 4: Fetched {len(rows)} rows from Snowflake")

        if not rows:
            logging.warning("⚠️ Warning: No electoral data found in Snowflake.")
            return {"electoral_data": [], "message": "No data available"}

        # Convert to DataFrame
        df = pd.DataFrame(rows, columns=columns)

        # Save directory: Current directory where script is running
        current_directory = os.getcwd()  # Get the current working directory
        csv_file_path = os.path.join(current_directory, "electoral_data.csv")
        json_file_path = os.path.join(current_directory, "electoral_data.json")

        # Save as CSV in the current directory
        df.to_csv(csv_file_path, index=False)
        logging.info(f"🔹 CSV saved at: {csv_file_path}")

        # Convert to JSON and save
        json_output = df.to_json(orient="records", indent=4)
        with open(json_file_path, "w") as json_file:
            json_file.write(json_output)

        logging.info(f"🔹 JSON saved at: {json_file_path}")

        cursor.close()
        conn.close()
        logging.info("🔹 Step 6: Connection Closed Successfully")

        return {"electoral_data": json.loads(json_output), "csv_file": csv_file_path, "json_file": json_file_path}

    except snowflake.connector.errors.ProgrammingError as pe:
        logging.error(f"🚨 Snowflake SQL Error: {pe}")
        raise HTTPException(status_code=400, detail="Invalid SQL query or table not found.")

    except Exception as e:
        logging.error(f"🚨 Unexpected error while fetching electoral data: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving electoral data: {str(e)}")


# Run FastAPI
if __name__ == "__main__":
    import uvicorn
    logging.info("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)

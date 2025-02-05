import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import snowflake.connector

# Configure logging
logging.basicConfig(
    filename="snowflake_api.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow React frontend
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

@app.get("/get_table_data")
async def get_table_data(table: str = Query(..., description="Table name to fetch data from")):
    """Fetches data from the selected table in Snowflake."""
    try:
        if "account" not in session_data:
            logging.error("No active Snowflake session. Please authenticate first.")
            raise HTTPException(status_code=401, detail="No active Snowflake session. Please authenticate first.")

        logging.info(f"Fetching data from table: {table}")

        # Reconnect to Snowflake
        conn = snowflake.connector.connect(
            user=session_data["username"],
            password=session_data["password"],
            account=session_data["account"]
        )
        cursor = conn.cursor()

        # Query table data (LIMIT to 10 rows for performance)
        cursor.execute(f"SELECT * FROM {table} LIMIT 10")
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()

        # Convert to JSON format
        table_data = [dict(zip(columns, row)) for row in rows]

        cursor.close()
        conn.close()
        logging.info(f"Retrieved {len(table_data)} rows from {table}.")

        return {"table_data": table_data}

    except snowflake.connector.errors.ProgrammingError as pe:
        logging.error(f"Snowflake SQL Error: {pe}")
        raise HTTPException(status_code=400, detail="Invalid SQL query or table not found.")
    
    except Exception as e:
        logging.error(f"Unexpected error while fetching table data: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving table data.")

# Run FastAPI
if __name__ == "__main__":
    import uvicorn
    logging.info("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)

import snowflake.connector

# Correct extracted account identifier
account = "fvb73919.us-east-1"
username = "gokul"
password = "Spinfocity@6amazon"

try:
    conn = snowflake.connector.connect(
        user=username,
        
        password=password,
        account=account
    )
    print("✅ Successfully connected to Snowflake!")
    
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    
    tables = [row[1] for row in cursor.fetchall()]
    print("Retrieved tables:", tables)

    cursor.close()
    conn.close()
except Exception as e:
    print("❌ Connection failed:", e)

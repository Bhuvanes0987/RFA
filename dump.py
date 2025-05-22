import os
import json
import psycopg2
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

# Connect to PostgreSQL
pg_conn = psycopg2.connect(os.getenv("DATABASE_URL"))
pg_cursor = pg_conn.cursor()

# Connect to MySQL
mysql_conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PWD"),
    database=os.getenv("DB_NAME"),
    autocommit=True
)
mysql_cursor = mysql_conn.cursor()

# Tables in dependency order
tables = ['Users', 'Resumes', 'JDList', 'Matches', 'InterviewSlots']

# Specify columns that are JSON in MySQL schema
json_columns = {
    'Resumes': ['skills']
}

for table in tables:
    print(f"Transferring data from table: {table}")

    # Get columns and types from PostgreSQL
    pg_cursor.execute(f"SELECT * FROM {table} LIMIT 0")
    col_names = [desc[0] for desc in pg_cursor.description]
    columns_str = ', '.join(col_names)
    placeholders = ', '.join(['%s'] * len(col_names))

    # Fetch all rows from PostgreSQL
    pg_cursor.execute(f"SELECT * FROM {table}")
    rows = pg_cursor.fetchall()

    # Clear MySQL table
    mysql_cursor.execute(f"DELETE FROM {table}")

    # Insert each row into MySQL
    for row in rows:
        # Convert row to list so it's mutable
        row = list(row)

        # Handle JSON columns by dumping to JSON string
        if table in json_columns:
            for i, col in enumerate(col_names):
                if col in json_columns[table]:
                    # Convert Python object to JSON string, or set None
                    if row[i] is not None:
                        row[i] = json.dumps(row[i])
                    else:
                        row[i] = None
        
        # Optional: Handle None conversion if needed (MySQL Connector usually handles this)
        # Example:
        # row = [None if v is None else v for v in row]

        try:
            mysql_cursor.execute(
                f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})", tuple(row))
        except mysql.connector.Error as err:
            print(f"Error inserting into {table}: {err}")

# Close all connections
pg_cursor.close()
pg_conn.close()
mysql_cursor.close()
mysql_conn.close()

print("✅ Data migration completed.")

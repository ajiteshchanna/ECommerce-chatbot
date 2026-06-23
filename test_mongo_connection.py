import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

def run_diagnostics():
    print("--------------------------------------------------")
    print("MongoDB Connectivity Diagnostics")
    print("--------------------------------------------------")

    # 1. Environment Info
    cwd = os.getcwd()
    print(f"1. Current Working Directory: {cwd}")
    
    dotenv_path = os.path.join(cwd, ".env")
    print(f"2. Expected .env Path: {dotenv_path}")
    print(f"3. .env File Exists: {os.path.exists(dotenv_path)}")

    # 2. Load Environment
    load_dotenv(dotenv_path=dotenv_path)
    mongo_uri = os.getenv("MONGO_URI")

    if not mongo_uri:
        print("4. MONGO_URI: FAILED TO LOAD (Is None or Empty)")
        print("   -> Tip: Check if you are running this script from the correct directory.")
        return
    
    # Mask URI
    try:
        if "@" in mongo_uri:
            parts = mongo_uri.split("@")
            prefix = parts[0]
            host_part = parts[1]
            auth_parts = prefix.split(":")
            if len(auth_parts) >= 3:
                masked_uri = f"{auth_parts[0]}:{auth_parts[1]}:****@{host_part}"
            else:
                masked_uri = "mongodb+srv://****:****@" + host_part
        else:
            masked_uri = mongo_uri
    except Exception:
        masked_uri = "MASKING FAILED (Invalid URI format?)"
        
    print(f"4. MONGO_URI Loaded: {masked_uri}")

    # 3. Connection Attempt
    print("\n5. Attempting to connect to MongoDB...")
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # 4. Ping DB
        client.admin.command('ping')
        print("   -> Ping SUCCESS! Connection established.")
    except OperationFailure as e:
        print(f"   -> AUTHENTICATION FAILED: {e}")
        print("   -> Tip: Check username, password, or cluster IP whitelist.")
        return
    except ConnectionFailure as e:
        print(f"   -> CONNECTION FAILED: {e}")
        print("   -> Tip: Check network connectivity or URI host.")
        return
    except Exception as e:
        print(f"   -> UNKNOWN ERROR: {e}")
        return

    # 5. List Databases
    try:
        dbs = client.list_database_names()
        print(f"\n6. Databases Available: {dbs}")
    except Exception as e:
        print(f"   -> Failed to list databases: {e}")

    # 6. Check specific db
    target_db = "ecommerce_db"
    if target_db in dbs:
        print(f"7. '{target_db}' found!")
        try:
            collections = client[target_db].list_collection_names()
            print(f"8. Collections in '{target_db}': {collections}")
        except Exception as e:
            print(f"   -> Failed to list collections: {e}")
    else:
        print(f"7. '{target_db}' NOT FOUND in available databases.")

if __name__ == "__main__":
    run_diagnostics()

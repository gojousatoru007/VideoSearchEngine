import os
import json
from pymongo import MongoClient

# Replace these values with your MongoDB Atlas connection string and collection details
atlas_connection_string = "mongodb+srv://hush:hush@queryengine.dzrs3h4.mongodb.net/?retryWrites=true&w=majority"
collection_name = "VideoData"

# Connect to MongoDB Atlas
client = MongoClient(atlas_connection_string)
db = client.get_database()

# Function to insert JSON documents into the collection
def insert_documents(collection, documents):
    collection.insert_many(documents)

# Path to the folder containing JSON files
folder_path = "/home/hush/project/test"

# Iterate through each file in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".json"):
        file_path = os.path.join(folder_path, filename)
        
        # Open and read the JSON file
        with open(file_path, 'r') as file:
            json_data = json.load(file)
            
            # Specify the collection to insert the documents
            collection = db[collection_name]
            
            # Insert documents into the collection
            insert_documents(collection, json_data)

# Close the MongoDB Atlas connection
client.close()

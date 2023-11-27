from pymongo.mongo_client import MongoClient
import json
import glob
# from pymongo import MongoClient


uri = "mongodb+srv://hush:hush@queryengine.dzrs3h4.mongodb.net/?retryWrites=true&w=majority"
# Create a new client and connect to the server
client = MongoClient(uri)
# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

db = client["QueryEngine"]
collection_name = "VideoData"

# Function to insert JSON documents into the collection
def insert_documents(collection, documents):
    collection.insert_many(documents)

# Path to the folder containing JSON files
folder_path = "/home/hush/project/test"


# Iterate through each JSON file in the folder
for file_path in glob.glob(f"{folder_path}/*.json"):
    # Open and read the JSON file
    with open(file_path, 'r') as file:
        json_data = json.load(file)

        # Wrap the data in a list before inserting
        document_list = [json_data]

        # Specify the collection to insert the documents
        collection = db[collection_name]

        # Insert documents into the collection
        insert_documents(collection, document_list)

# Close the MongoDB Atlas connection
client.close()
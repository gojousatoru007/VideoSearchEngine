const fs = require('fs');
const { MongoClient } = require('mongodb');

// Replace these values with your MongoDB Atlas connection string and collection details
const atlasConnectionString = "mongodb+srv://hush:hush@queryengine.dzrs3h4.mongodb.net/?retryWrites=true&w=majority";
const collectionName = "VideoData";

// Connect to MongoDB Atlas
const client = new MongoClient(atlasConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });

// Function to insert JSON documents into the collection
async function insertDocuments(collection, documents) {
    await collection.insertMany(documents);
}

// Path to the folder containing JSON files
const folderPath = "/home/hush/project/test";

// Connect to MongoDB Atlas and insert documents
async function uploadJsonFiles() {
    try {
        await client.connect();

        const db = client.db();
        const collection = db.collection(collectionName);

        //Iterate through each file in the folder
        fs.readdirSync(folderPath).forEach(filename => {
            if (filename.endsWith(".json")) {
                const filePath = `${folderPath}/${filename}`;
                
                // Read the JSON file
                const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                
                // Insert documents into the collection
                insertDocuments(collection, jsonData);
            }
        });

        console.log("Data uploaded successfully!");

    } catch (error) {
        console.error("Error:", error);

    } finally {
        // Close the MongoDB Atlas connection
        await client.close();
    }
}

// Run the script
uploadJsonFiles();

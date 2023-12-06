const express = require('express');

const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Atlas connection URI
const uri = 'mongodb+srv://hush:hush@queryengine.dzrs3h4.mongodb.net/?retryWrites=true&w=majority';
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect the client to the server (optional starting in v4.7)
client.connect().then(() => {
  // Send a ping to confirm a successful connection
  return client.db("admin").command({ ping: 1 });
}).then(() => {
  console.log("Pinged your deployment. You successfully connected to MongoDB!");

  // Specify the database and collection
  const db = client.db('QueryEngine');
  const collection = db.collection('VideoData');

  // Express route to handle search queries
  app.post('/search', async (req, res) => {
    const searchQuery = req.body.query;

    try {
      // Search for documents where the query matches tags
      const result = await collection.find({
        'videoInfo.snippet.tags': { $in: [searchQuery] }
      }).toArray();

      console.log('Search query:', searchQuery);
      console.log('Search result:', result);

      res.status(200).json(result); // Send the search result as JSON response
    } catch (error) {
      console.error('Error searching MongoDB:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // Start the Express server
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  // Handle shutdown gracefully
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Closing server and MongoDB connection...');
    server.close(() => {
      console.log('Express server closed.');
      client.close().then(() => {
        console.log('MongoDB connection closed. Exiting...');
        process.exit(0);
      });
    });
  });
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

const neo4j = require('neo4j-driver');
// const { MongoClient, ServerApiVersion } = require('mongodb');

// Neo4j Aura connection details
const neo4jUri = 'neo4j+s://4825f9aa.databases.neo4j.io';
const neo4jUser = 'neo4j';
const neo4jPassword = 'vC4DRwOhgQ5G1OD6jDfmEPtrdzDxUWbe73ODlk9246g';

// MongoDB Atlas connection URI
const mongoUri = 'mongodb+srv://hush:hush@queryengine.dzrs3h4.mongodb.net/?retryWrites=true&w=majority';

// Create Neo4j driver instance
const neo4jDriver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));

// Connect to MongoDB
const mongoClient = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Function to update video info in Neo4j with videoId, title, tags, and channelId
async function updateVideoInfoInNeo4j(video) {
  const session = neo4jDriver.session();

  try {
    // Cypher query to update video info with videoId, title, tags, and channelId
    const query = `
      MERGE (v:Video {videoId: $videoId})
      SET v.title = $title,
          v.tags = $tags,
          v.channelId = $channelId
      RETURN v
    `;

    const params = {
      videoId: video.videoInfo.id,
      title: video.videoInfo.snippet.title,
      tags: video.videoInfo.snippet.tags || [], // Use an empty array if 'tags' is undefined
      channelId: video.videoInfo.snippet.channelId,
    };

    const result = await session.run(query, params);

    console.log('Video info (videoId, title, tags, and channelId) updated in Neo4j:', result.records);
  } finally {
    await session.close();
  }
}

function intersection(video1, video2) {
  const tags1 = new Set(video1);
  const tags2 = new Set(video2);
  return [...tags1].filter(tag => tags2.has(tag));
}

// Function to create relationships between videos in Neo4j
async function createVideoRelationships(video1, video2, weight) {
  const session = neo4jDriver.session();

  try {
    // Cypher query to create or update relationship between videos
    const query = `
      MATCH (v1:Video {videoId: $videoId1})
      MATCH (v2:Video {videoId: $videoId2})
      MERGE (v1)-[r:RELATED]->(v2)
      ON CREATE SET r.weight = $weight
      ON MATCH SET r.weight = r.weight + $weight
    `;

    // Calculate weight based on matching criteria
    const matchingTags = intersection(video1.videoInfo.snippet.tags, video2.videoInfo.snippet.tags).length;
    const matchingTitle = video1.videoInfo.snippet.title === video2.videoInfo.snippet.title ? 1 : 0;
    const matchingChannelId = video1.videoInfo.snippet.channelId === video2.videoInfo.snippet.channelId ? 1 : 0;

    const weight = matchingTags + matchingTitle + matchingChannelId;

    // Execute the query
    if(weight > 0){
    await session.run(query, {
      videoId1: video1.videoInfo.id,
      videoId2: video2.videoInfo.id,
      weight: weight,
    })
  };

    console.log(`Relationship created between ${video1.videoInfo.id} and ${video2.videoInfo.id} with weight ${weight}`);
  } finally {
    await session.close();
  }
}

// Connect to MongoDB and Neo4j, then process the data
async function processData() {
  try {
    await mongoClient.connect();

    const db = mongoClient.db('QueryEngine');
    const collection = db.collection('VideoData');

    // Fetch data from MongoDB
    const mongoData = await collection.find({}).toArray();

    // Check if there are new videos
    if (mongoData.length > 0) {
      const neo4jSession = neo4jDriver.session();

      try {
        // Cypher query to count existing videos in Neo4j
        const countQuery = 'MATCH (v:Video) RETURN count(v) AS count';
        const countResult = await neo4jSession.run(countQuery);
        const existingVideoCount = countResult.records[0].get('count').toInt();
        console.log(mongoData.length)
        console.log(existingVideoCount)

        // If there are new videos, update Neo4j
        if (mongoData.length > existingVideoCount) {
          console.log(`Found ${mongoData.length - existingVideoCount} new videos. Updating Neo4j...`);

          

          // Update Neo4j with the fetched data
          for (const video of mongoData) {
            //await updateVideoInfoInNeo4j(video);
          }

          console.log('Neo4j update complete.');


          for(let i = mongoData.length/4; i < mongoData.length; i++){
            for(let j = i + 1; j < mongoData.length; j++){
              await createVideoRelationships(mongoData[i], mongoData[j]);

            }
          }

          console.log('Video relationships createdacca')
        } else {
          console.log('No new videos found. Neo4j update not required.');
        }
      } finally {
        await neo4jSession.close();
      }
    } else {
      console.log('No videos found in MongoDB. Skipping Neo4j update.');
    }
  } catch (error) {
    console.error('Error processing data:', error);
  } finally {
    await mongoClient.close();
    neo4jDriver.close();
  }
}

// Run the data processing function
processData();


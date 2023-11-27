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

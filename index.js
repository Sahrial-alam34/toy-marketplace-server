const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kzrcuv8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    client.connect();

    const database = client.db("houseOfCar");
    const carCollection = database.collection("cars");

    app.post("/addCar", async (req, res) => {
      const body = req.body;
      if (!body) {
        return res.status(404).send({ message: "body data not found" })
      }
      const result = await carCollection.insertOne(body);
      // console.log(result);
      res.send(result);
    })

    app.get("/allCars", async (req, res) => {
      const result = await carCollection.find({}).toArray();
      // console.log(result)
      res.send(result)
    })
    app.get("/allCars/:text", async (req, res) => {
      console.log(req.params.text);
      if (req.params.text == "car" || req.params.text == "bus" || req.params.text == "truck") {
        const result = await carCollection
        .find({ Subcategory: req.params.text})
        .toArray();
        return res.send(result)

      }
      const result = await carCollection.find({}).toArray();
      //console.log(result)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('House of Tory cars is busy');
})

app.listen(port, () => {
  console.log(`House of Troy cars is running on port: ${port}`);
})
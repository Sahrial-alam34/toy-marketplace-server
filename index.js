const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
// const corsConfig = {
//   origin: '*',
//   Credential:true,
//   method:['GET', 'POST', 'PUT', 'DELETE']
// }
//  app.use(cors(corsConfig));
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kzrcuv8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  // maxPoolSize:10,

});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    // client.connect((err)=>{
    //   if(err){
    //     console.error(err)
    //     return;
    //   }
    // });

    const database = client.db("houseOfCar");
    const carCollection = database.collection("cars");

    //sorting




    app.post("/addCar", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      if (!body) {
        return res.status(404).send({ message: "body data not found" })
      }
      const result = await carCollection.insertOne(body);
      // console.log(result);
      res.send(result);
    })



    // Creating index on  fields
    // const indexKeys = { toyName: 1 }; // Replace field1  with your actual field names
    // const indexOptions = { name: "toyName" }; // Replace index_name with the desired index name
    // const result = await carCollection.createIndex(indexKeys, indexOptions);

    app.get("/allCars", async (req, res) => {
      const result = await carCollection.find({}).sort({ createdAt: -1 }).limit(20).toArray();
      // console.log(result)
      res.send(result)
    })
    app.get("/allTotalCars", async (req, res) => {
      const result = await carCollection.find({}).sort({ createdAt: -1 }).toArray();
      // console.log(result)
      res.send(result)
    })
    //get car by text
    app.get("/allCars/:text", async (req, res) => {
      //console.log(req.params.text);
      if (req.params.text == "car" || req.params.text == "bus" || req.params.text == "truck") {
        const result = await carCollection
          .find({ Subcategory: req.params.text })
          .sort({ createdAt: -1 })
          .toArray();
        return res.send(result)

      }
      const result = await carCollection.find({}).sort({ createdAt: -1 }).toArray();
      //console.log(result)
      res.send(result)
    })
    //get element by email
    app.get("/myallCars/:email", async (req, res) => {
      //console.log(req.params.email);
      const result = await carCollection.find({ postedBy: req.params.email }).toArray()
      res.send(result)
      
    })

    app.get('/sorted/:text' ,async (req, res) => {
      console.log(req.params.text);
      let sorting = {}
      if (req.params.text == "ascending") {
        sorting = { price: 1 }
      }
      else if (req.params.text == "descending") {
        sorting = { price: -1 }
      }
      else {
        res.send({ error: "error" })
      }

      const result = await carCollection.find().sort(sorting).collation({ locale: "en_US", numericOrdering: true }).toArray();
      console.log(result);
      return res.send(result)
    })
  


    // delete single car
    app.delete("/myCars/:id", async (req, res) => {

      const id = req.params.id
      console.log('please delete', id);
      const query = { _id: new ObjectId(id) }
      const result = await carCollection.deleteOne(query);
      console.log('result', result)
      res.send(result);
    })
    // get data for update car
    app.get('/updatedCars/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await carCollection.findOne(query);
      res.send(result)
    })

    // for update car
    app.put('/updatedACar/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedACar = req.body;
      const car = {
        $set: {
          price: updatedACar.price,
          quantity: updatedACar.quantity,
          description: updatedACar.description
        }
      }
      const result = await carCollection.updateOne(filter, car, options)
      res.send(result)
    })

    app.get("/getCarsByName/:text", async (req, res) => {
      const text = req.params.text;
      const result = await carCollection
        .find({
          $or: [
            { toyName: { $regex: text, $options: "i" } },

          ],
        })
        .toArray();
      res.send(result);
    });
    //get single car details
    app.get('/carDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await carCollection.findOne(query);
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
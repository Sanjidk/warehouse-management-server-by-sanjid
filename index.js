const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.port || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@warehouse-management.sjnu1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const itemsCollection = client
      .db("warehouse-management")
      .collection("item");

    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = itemsCollection.find(query);
      const item = await cursor.toArray();
      res.send(item);
    });

    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await itemsCollection.findOne(query);
      res.send(item);
    });

    // Update Quantity
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updatedQuantity = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updatedQuantity.quantity,
        },
      };
      const result = await itemsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //POST method for Add Item
    app.post("/inventory", async (req, res) => {
      const newItem = req.body;
      const result = await itemsCollection.insertOne(newItem);
      res.send(result);
    });

    //DELETE from Manage Item
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });

//addItem
app.get('/addItem' , verifyJWT , async(req, res) =>{
  const decodedEmail = req.decoded.email;
  const email = req.query.email;
  if (email === decodedEmail) {
      const query = {email: email};
  const cursor = orderCollection.find(query);
  const item = await cursor.toArray();
  res.send(item); 
  } else {
      res.status(403).send({message: 'forbidden access'})
  }
 

})
app.post('/addItem', async(req, res) => {
  const newItem = req.body;
  const result = await orderCollection.insertOne(newItem);
  res.send(result)
});

    //myitem
    app.get('/myitems', async(req, res) => {
      const email = req.query.email;
      const query = {email: email};
      const cursor = itemsCollection.find(query);
      const myItems = await cursor.toArray() ;
      res.send(myItems);
  });

  app.delete('/myitems/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
  });




  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("My name is Warehouse Server");
});

app.listen(port, () => {
  console.log("listening to port", port);
});

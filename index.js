const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.port || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@warehouse-management.sjnu1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    await client.connect();
    const itemsCollection = client.db('warehouse-management').collection('item');

    app.get('/inventory', async (req, res) => {
      const query = {};
      const cursor = itemsCollection.find(query);
      const item = await cursor.toArray();
      res.send(item);
    });

    
    app.get('/inventory/:id' , async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const item = await itemsCollection.findOne(query);
      res.send(item);
  });
  //POST
  app.post('/inventory', async(req, res) => {
      const newItem = req.body;
      const result = await itemsCollection.insertOne(newItem);
      res.send(result)
  });

  //DELETE
  app.delete('/inventory/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await itemsCollection.delete(query);
      res.send(result);
  });


  } 
  finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("My name is Warehouse Server");
});

app.listen(port, () => {
  console.log("listening to port", port);
});



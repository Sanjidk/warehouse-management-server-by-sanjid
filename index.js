const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.port || 5000;

// middleware
const corsConfig = {
  origin: true,
  credentials: true,
}
app.use(cors(corsConfig))
app.options('*', cors(corsConfig))
app.use(express.json());



function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({ message: 'unauthorized access'});
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
    if(err){
      return res.status(403).send({ message: 'Forbidden access'});
    }
    console.log('decded', decoded);
    req.decoded = decoded ;
    next();
  })
}


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


      //AUTH Login
      app.post("/login", async (req, res)=>{
        const user = req.body;
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '1d'
        });
        res.send({accessToken})
      })

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
app.get('/addItem', verifyJWT, async(req, res) =>{
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
    app.get('/myitems', verifyJWT, async(req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;

      if(email === decodedEmail){
      const query = {email: email};
      const cursor = itemsCollection.find(query);
      const myItems = await cursor.toArray() ;
      res.send(myItems);
      }
      else{
        res.status(403).send({message: 'forbidden access'})
      }
  });

  app.delete('/myitems/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await itemsCollection.deleteOne(query);
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

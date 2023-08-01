import express from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('1234567890', 20)

import { MongoClient } from 'mongodb';
import './config/index.mjs'

const mongodbURI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.uriswah.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(mongodbURI);
const database = client.db('ecom');
const productsCollection = database.collection('products');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Welcome to my Shop");
  });

  
// Get All Data
  app.get("/products", async (req, res) => {
    try {
      const result = await productsCollection.find({}).toArray();
      res.send(result); 
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).send("Error getting products");
    }
  });



//   Get Single product
  app.get("/product/:id", async (req, res) => {
    const id = req.params.id;
    // console.log("id", id);
    const resultAll = await productsCollection.find({}).toArray();

    let isFound = false;
  
    for (let i = 0; i < resultAll.length; i++) {
      if (resultAll[i]._id == id) {
        console.log("product found...");
        isFound = i;
        break;
      }
    }
  
    if (isFound === false) {
      res.status(404);
      res.send({
        message: "product not found",
      });
    } else {
      res.send({
        message: "product found at index: " + isFound,
        data: resultAll[isFound],
      });
    }
  });
  


// Add Product
app.post("/product", async (req, res) => {
  if (!req.body.name
    || !req.body.price
    || !req.body.description) {

    res.status(403).send(`
      required parameter missing. example JSON request body:
      {
        name: "abc product",
        price: "$23.12",
        description: "abc product description"
      }`);
  }

  try {
    const doc = {
      id: nanoid(),
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
    }
    const result = await productsCollection.insertOne(doc);
    res.status(201).send({ message: "created product" });
  } catch (error) {
    console.error("Error while Added product: ", error);
    res.status(500).send("Error while Added product");
  }
});




// Edit a product 
  app.put("/product/:id", async (req, res) => {
  if (!req.body.name && !req.body.price && !req.body.description) {
    res.status(403).send(`
      required parameter missing.
      atleast one parameter is required: name, price or description to complete update
      example JSON request body:
      {
        name: "abc product",
        price: "$23.12",
        description: "abc product description"
      }`);
  }

  try {
    const id = req.params.id;
    console.log(id);
    const getAll = await productsCollection.find({}).toArray();
  
    for (let i = 0; i < getAll.length; i++) {
      const strId = getAll[i]._id.toString();
      if (strId === id) {
        console.log("product found...");
        const result = await productsCollection.updateOne({_id: getAll[i]._id}, {$set: {name: req.body.name, price: req.body.price, description: req.body.description}});
        res.send({
          message: "product found at index: ",
          data: result,
        });
        break;
      }
    }
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).send("Error getting products");
  }
});





// Delete a product
app.delete("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const getAll = await productsCollection.find({}).toArray();
  
    for (let i = 0; i < getAll.length; i++) {
      const strId = getAll[i]._id.toString();
      if (strId === id) {
        console.log("product found...");
        const result = await productsCollection.deleteOne({_id: getAll[i]._id});
        res.send({
          message: "product found at index: ",
          data: result,
        });
        break;
      }
    }
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).send("Error getting products");
  }
});





const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
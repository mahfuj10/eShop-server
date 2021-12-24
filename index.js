const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId

require('dotenv').config();


app.use(cors());
app.use(express.json())


// mongo db uri

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.39aol.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);
// 1N6LiQUZjK6FkGhA
async function run() {

  try {

    // mongo db database collection

    await client.connect();
    const database = client.db("rayan-shop");
    const allProducts = database.collection("products");
    const popularProduct = database.collection("popular-product");
    const reviewCollection = database.collection("user-review");
    const wishdomCollection = database.collection("wishdom-product");
    const usersCollection = database.collection('users');
    const cartCollection = database.collection("cart-item");


    // get api
    app.get('/products', async (req, res) => {
      const cursor = allProducts.find({});
      const product = await cursor.toArray();
      res.send(product);
    });

    //get propular product api
    app.get('/popularProduct', async (req, res) => {
      const query = popularProduct.find({})
      const popular = await query.toArray();
      res.send(popular);
    });

    // get single api
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = {
        projection: { _id: 0 },
      };
      const product = await allProducts.findOne(query, options);
      res.send(product);
    });

    // add product on cart
    app.post('/addToCart', async (req, res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);
      res.send(result)
    });

    // get all cart product
    app.get('/cartProduct', async (req, res) => {
      const products = await cartCollection.find({}).toArray();
      res.send(products);
    });

    // user cart items
    app.get('/cartProduct/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const products = await cartCollection.find(query).toArray();
      res.send(products);
    })

    // get user reivew
    app.get('/review', async (req, res) => {
      res.send(await reviewCollection.find({}).toArray());
    });

    // post review
    app.post('/review', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result)
    })

    // delete cart item
    app.delete('/cartProduct/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await cartCollection.deleteOne(query);
      res.json(result)
    });

    // add product on wishdom
    app.post('/addToWishdom', async (req, res) => {
      const product = req.body;
      const result = await wishdomCollection.insertOne(product);
      res.send(result);
    });

    // get wishdom product
    app.get('/myWishdom/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const products = await wishdomCollection.find(query).toArray();
      res.send(products);
    })

    // delete wishlist item
    app.delete('/myWishdom/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await wishdomCollection.deleteOne(query);
      res.json(result)
    });

    // saver our website user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // save google login user  
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // make website admin 
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // get admin status
    app.get('/users/:email', async (req, res) => {
      const user = await usersCollection.findOne({ email: req.params.email });
      let Admin = false;
      if (user?.role === 'admin') {
        Admin = true;
      };
      res.json({ Admin: Admin });
    });

  }



  finally {
    // await client.close();
  }




}


run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('The new e commerce');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
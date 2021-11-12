const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cqu6n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('connected');
        const database = client.db("products");
        const productCollection = database.collection("product");
        const myOrders = database.collection("myorders");
        const users = database.collection("users");
        const reviews = database.collection("reviews");

        // create a document to insert
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        })

        // create a document to insert
        app.post('/myorders', async (req, res) => {
            const myorders = req.body;
            const result = await myOrders.insertOne(myorders);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        })

        // create a document to insert
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await users.insertOne(user);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        })

        // create a document to insert
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviews.insertOne(review);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        })

        // get all products
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({})
            const result = await cursor.toArray();
            res.json(result)
        })

        // get all reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviews.find({})
            const result = await cursor.toArray();
            res.json(result)
        })

        // get admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await users.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        // get all my orders
        app.get('/myorders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await myOrders.find(query).toArray()
            res.json(result)
        })

        // get all orders
        app.get('/allorders', async (req, res) => {
            const cursor = myOrders.find({})
            const result = await cursor.toArray();
            res.json(result)
        })

        // get single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.json(result)
        })

        // delete a document
        app.delete('/allorders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await myOrders.deleteOne(query);
            res.json(result);
        })

        // delete a document
        app.delete('/myorders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await myOrders.deleteOne(query);
            res.json(result);
        })

        // delete a document
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })

        // add role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: "admin" } }
            const result = await users.updateOne(filter, updateDoc);
            res.json(result);
        })

        // update status 
        app.put('/allorders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const updateDoc = { $set: { status: "Shipped" } }
            const options = { upsert: true };
            const result = await myOrders.updateOne(query, updateDoc, options);
            res.json(result);
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`this app listening at http://localhost:${port}`)
})
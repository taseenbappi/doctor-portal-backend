const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wyglv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('doctorDB');
        const appoinmentsCollection = database.collection('appointments');
        const usersCollection = database.collection('users');

        //search booking by email
        app.get('/appointment', async (req, res) => {
            const email = req.query.email;
            const date = new Date(req.query.date).toLocaleDateString();
            console.log(date);
            const query = { email: email, date: date };
            console.log(query);
            const cursor = appoinmentsCollection.find(query);
            const result = await cursor.toArray();
            res.json(result)
        })
        //search by all booking

        app.get('/appointments', async (req, res) => {
            const cursor = appoinmentsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        //insert appoinments to doctorDB
        app.post('/appointments', async (req, res) => {
            const appoinment = req.body;
            const result = await appoinmentsCollection.insertOne(appoinment);
            res.json(result);

        })


        //save user info
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);

        })

        //update user info
        app.put('/user', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Doctor Manager');
})

app.listen(port, () => {
    console.log(`listening at:${port}`);
})

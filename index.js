const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wyglv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        // const database = client.db('doctorDB');
        // const movies = database.collection('movies');
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
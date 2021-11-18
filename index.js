const express = require('express');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// firebase admin
// doctors-portal-adminsdk.json

const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_ACCOUNT_SERVICE);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function verifyToken(req, res, next) {
    if (req.headers?.authorization.startWith("Bearer ")) {
        const token = req.headers.authorization.split(' ')[1]
        try {
            const decoderEmail = await admin.auth().verifyIdToken(token);
            req.decoderEmail = decoderUser.email;
        }
        catch {

        }
    }
    next();

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wyglv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('doctorDB');
        const appoinmentsCollection = database.collection('appointments');
        const usersCollection = database.collection('users');
        const doctorsCollection = database.collection('doctors');

        //search booking by email
        app.get('/appointment', async (req, res) => {
            const email = req.query.email;
            const date = req.query.date;
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

        //admin check api
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.roll === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });

        })

        //insert appoinments to doctorDB
        app.post('/appointments', async (req, res) => {
            const appoinment = req.body;
            const result = await appoinmentsCollection.insertOne(appoinment);
            res.json(result);

        })

        // doctors api
        app.get('/doctors', async (req, res) => {
            const cursor = doctorsCollection.find({});
            const doctors = await cursor.toArray();
            res.json(doctors);
        });
        //insert doctors data
        app.post('/doctos', async (req, res) => {
            const name = req.body.name;
            const email = req.body.email;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const doctor = {
                name,
                email,
                image: imageBuffer
            }
            const result = await doctorsCollection.insertOne(doctor);
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
        //update user roll
        app.put('/user/admin', verifyToken, async (req, res) => {
            const user = req.body;
            console.log(user);
            const requester = req.decoderEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.roll === "admin") {
                    const filter = { email: user.email };
                    const updateDoc = {
                        $set: { roll: "admin" }
                    };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
                else {
                    res.status(401).json({ message: "Your don't have permission" });
                }

            }

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

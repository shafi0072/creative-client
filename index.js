const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()




const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_PASS}@cluster0.li2le.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;




const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('service'))
app.use(fileUpload());

const port = 5000;

app.get('/',(req, res) => {
    res.send('hello World')
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });
client.connect(err => {
  const orderCollection = client.db("creativeAgency").collection("Orders");
  const reviewCollection = client.db("creativeAgency").collection("review");
  const serviceCollection = client.db("creativeAgency").collection("service");
  app.post('/addOrder', (req, res) => {
      const order = req.body;
      console.log(order);
      orderCollection.insertOne(order)
      .then(result => {
          res.send(result.insertedCount > 0);
      })
  })
  app.get('/orderSummary', (req,res) => {
      console.log(req.query.email)
    orderCollection.find({email: req.query.email})
    .toArray((err, documents) => {
       res.send(documents); 
    })
  })
  app.post('/review', (req, res) => {
      const review = req.body;
      reviewCollection.insertOne(review)
    .then(result => {
        res.send(result.insertedCount > 0);
    })
  })
  app.get('/reviewSummary', (req, res) => {
    reviewCollection.find({})
    .toArray((err, documents) => {
        res.send(documents);
    })
  })
  app.post('/services', (req, res) => {
      const file = req.files.file;
      const name = req.body.name;
      const email = req.body.email;
      console.log(name, email, file);
      file.mv(`${__dirname}/service/${file.name}`, err => {
         if(err){
             console.log(err);
             return res.status(500).send({msg: 'Failed to upload image'})
         }
         return res.send({name: file.name, path: `/${file.name}`})
      })
  })
});

app.listen(port);
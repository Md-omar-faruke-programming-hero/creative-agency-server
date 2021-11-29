const express= require('express')
const cors=require('cors')
require('dotenv').config()
const app=express()
const ObjectId= require('mongodb').ObjectId
const { MongoClient } = require('mongodb');
const fileupload= require('express-fileupload')

const port= process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

app.listen(port,()=>{
    console.log("listining port",port)
})

// middleware
app.use(cors())
app.use(express.json())
app.use(fileupload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eqb98.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)
async function run(){
    try{
        await client.connect()
        const database=client.db("agency")
        const userReviewCollection= database.collection("review")
        const userOrderCollection=database.collection("userOrder")
        
        // user review post
        app.post('/userReview',async(req,res)=>{
            

            const result= await userReviewCollection.insertOne(req.body)
            res.json(result)
           
        })

        // get user review
        app.get('/userReview',async(req,res)=>{
            const cursor= userReviewCollection.find({})
            const result= await cursor.toArray()
            res.send(result)

        })

        // post user order
        app.post('/userOrder',async(req,res)=>{
            // console.log(req.body)
            const pic=req.files.image
            const picData=pic.data;
            const encodedPic=picData.toString("base64")
            const image= Buffer.from(encodedPic,"base64")

            const orderInfo={
                ...req.body,image,status:"pending"
            }
            const result= await userOrderCollection.insertOne(orderInfo)
            res.json(result)
            console.log(result)

            
        })

        // get all orders
        app.get('/userOrder',async(req,res)=>{
            const email=req.query.email
            let filter={}

            if(email){
               filter={email:email}
            }
           const cursor= userOrderCollection.find(filter)
            const result= await cursor.toArray()
            res.send(result)
        })

        // user single order
        app.get('/userOrder/:id',async(req,res)=>{
            const id= req.params.id
            const query={_id: ObjectId(id)}
            const result= await userOrderCollection.findOne(query)
            res.send(result)

        })

        // delete user order
        app.delete('/userOrder/:id',async(req,res)=>{
            const id= req.params.id
            const query={_id: ObjectId(id)}
            const result= await userOrderCollection.deleteOne(query)
            res.json(result)
            console.log(result)
        })

    }
    finally{

    }

}
run().catch(console.dir)

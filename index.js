const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
app.route("/").get(async (req, res)=>{
    res.json({
        ourapp:"ok"
    })
})
app.route("/doit").post(async (req, res)=>{
    console.log(req.body.imagebase64)
    res.json({
        success: true,   
            data: {
                test:"true"
            },   
            message: "Successfully extracted JSON from image" 
          }
          
    )
})
app.listen(3000,()=>{
    console.log("app running...")
})
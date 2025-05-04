const express = require('express')
const app = express()
app.use(express.json())
app.route("/").get(async (req, res)=>{
    res.json({
        ourapp:"ok"
    })
})
app.route("/doit").post(async (req, res)=>{
    console.log(req.body.imagebase64)
    res.json({
        data:"hi"
    })
})
app.listen(3000,()=>{
    console.log("app running...")
})
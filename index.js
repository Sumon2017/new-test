const express = require('express')
const app = express()
app.use(express.json())
app.route("/").post(async (req, res)=>{
    console.log(req.body.imagebase64)
    res.json({
        data:"hi"
    })
})
app.listen(3000,()=>{
    console.log("app running...")
})
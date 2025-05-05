const express = require('express')
const cors = require('cors')
const fs = require('fs')
const PNG = require('pngjs').PNG;
const { ocrSpace } = require('ocr-space-api-wrapper')

async function transformImage(base64String) {
    const buffer = Buffer.from(base64String, 'base64')

    return new Promise((resolve, reject) => {
        const png = new PNG()
        png.parse(buffer, (err, data) => {
            if (err) return reject(err)

            for (let i = 0; i < data.data.length; i += 4) {
                const alpha = data.data[i + 3] // Alpha channel
          
                if (alpha === 0) {
                  // Fully transparent pixels → Convert to pure white
                  data.data[i] = 255   // R
                  data.data[i + 1] = 255 // G
                  data.data[i + 2] = 255 // B
                  data.data[i + 3] = 255 // Fully opaque
                } else if (alpha < 255) {
                  // Semi-transparent pixels → Blend with white
                  let blendFactor = alpha / 255 // Normalize alpha (0-1)
                  data.data[i] = Math.round(data.data[i] * blendFactor + 255 * (1 - blendFactor))
                  data.data[i + 1] = Math.round(data.data[i + 1] * blendFactor + 255 * (1 - blendFactor))
                  data.data[i + 2] = Math.round(data.data[i + 2] * blendFactor + 255 * (1 - blendFactor))
                  data.data[i + 3] = 255 // Make fully opaque
                }
            }

            const outputBuffer = PNG.sync.write(data)
            resolve(outputBuffer.toString('base64'))
        })
    })
}

function processString(input){
    let arr
    let newStr
    if(input[0] == '{'){
        arr = input.split(""); // Convert to array
        arr[0] = ' '; // Change 'e' to 'X'
        newStr = arr.join(""); // Convert back to string
    }
    if(input[input.length-1] == '}'){
        arr = input.split(""); // Convert to array
        arr[input.length-1] = ' '; // Change 'e' to 'X'
        newStr = arr.join(""); // Convert back to string
    }
    return "{ "+newStr+" }"
}


const app = express()
app.use(cors())
app.use(express.json())
app.route("/").get(async (req, res)=>{
    res.json({
        ourapp:"ok"
    })
})
app.route("/doit").post(async (req, res)=>{
    try{

        const mystring = req.body.imageBase64.replace(/^data:image\/png;base64,/, '')
        const whitenedimage = await transformImage(mystring)
        //fs.writeFileSync("./temp2.png", Buffer.from(whitenedimage, 'base64'))
        const text = await ocrSpace("data:image/png;base64,"+whitenedimage, { apiKey: process.env.OCR , language: 'eng', scale:true, OCREngine:2})

        console.log(processString(text.ParsedResults[0].ParsedText))

        res.status(200).json({
            success: true,   
            data: JSON.parse(processString(text.ParsedResults[0].ParsedText)),   
            message: "Successfully extracted JSON from image" 
        })
    }
    catch(e){
        console.error("error happened...",e)
    }
})
app.listen(3000,()=>{
    console.log("app running...")
})
require('dotenv').config();

const express = require('express');
const app = express();
const AWS = require('aws-sdk');

app.use(express.static('public/'));

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.AWS_REGION
});

const bucket = process.env.BUCKET_NAME;
const s3 = new AWS.S3();

app.get('/aws', async (req, res) => {
    console.log(req.query);
    console.log(bucket);

    const params = { Bucket: bucket, Key: 'High_res_0.5_sigma_threshold.png'};
    s3.getObject(params, function(err, data) {
        if(err) {
            console.log('Error');
        } else {
            console.log(data);
            res.send(data);
        }
    });
});

app.listen(8080,()=>{
    console.log('Web Server running on port', 8080);
});
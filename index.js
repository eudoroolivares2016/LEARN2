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

let imageData = Array(10);
function getImageData(params, index) {
    return new Promise(resolve => {
        s3.getObject(params, function(err, data) {
            if(err) {
                console.log('Error:', err.code);
            } else {
                imageData[index] = data;
            }
            resolve();
        });
    });
}

function gatherImageData(fileNames, _callback) {
    const promise0 = Promise.resolve(getImageData({ Bucket: bucket, Key: fileNames[0]}, 0));
    const promise1 = Promise.resolve(getImageData({ Bucket: bucket, Key: fileNames[1]}, 1));
    const promise2 = Promise.resolve(getImageData({ Bucket: bucket, Key: fileNames[2]}, 2));
    const promise3 = Promise.resolve(getImageData({ Bucket: bucket, Key: fileNames[3]}, 3));
    const promise4 = Promise.resolve(getImageData({ Bucket: bucket, Key: fileNames[4]}, 4));
    const promise5 = Promise.resolve(getImageData({ Bucket: bucket, Key: fileNames[5]}, 5));
    const promise6 = Promise.resolve(getImageData({ Bucket: bucket, Key: fileNames[6]}, 6));
    const promise7 = Promise.resolve(getImageData({ Bucket: bucket, Key: fileNames[7]}, 7));
    const promise8 = Promise.resolve(getImageData({ Bucket: bucket, Key: fileNames[8]}, 8));
    const promise9 = Promise.resolve(getImageData({ Bucket: bucket, Key: fileNames[9]}, 9));

    Promise.all([promise0, promise1, promise2, promise3, promise4, promise5, promise6, promise7, promise8, promise9]).then((values) => {
        console.log('done');
        _callback();
    });
}

app.get('/aws', async (req, res) => {
    let rootName = req.query.file;
    let fileNames = [];
    for(let i = 1; i <= 10; i++) {
        fileNames.push(rootName + i + '.png');
    }
    gatherImageData(fileNames, function() {
        console.log('sending');
        res.send(imageData);
    });
});

app.listen(8080,()=>{
    console.log('Web Server running on port', 8080);
});
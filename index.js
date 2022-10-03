require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');

app.use(express.static('public/'));

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.AWS_REGION,
    signatureVersion: 'v4'
});
app.get('/user_guide', function(req,res) {
    fs.readFile('public/user_guide.html',   function (err, data) {
        res.setHeader('Content-Type', 'text/html');
        res.send(data);
    });
});

app.get('/test', function(req,res) {
    fs.readFile('public/interactive_map_test.html',   function (err, data) {
        res.setHeader('Content-Type', 'text/html');
        res.send(data);
    });
});

const bucket = process.env.BUCKET_NAME;
const s3 = new AWS.S3();

let imageData = Array(50);
let csvData = [];

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

async function makePromiseSet(fileNames, functionName, start) {
    const promise0 = functionName({Bucket: bucket, Key: fileNames[start + 0]}, start + 0);
    const promise1 = functionName({Bucket: bucket, Key: fileNames[start + 1]}, start + 1);
    const promise2 = functionName({Bucket: bucket, Key: fileNames[start + 2]}, start + 2);
    const promise3 = functionName({Bucket: bucket, Key: fileNames[start + 3]}, start + 3);
    const promise4 = functionName({Bucket: bucket, Key: fileNames[start + 4]}, start + 4);
    const promise5 = functionName({Bucket: bucket, Key: fileNames[start + 5]}, start + 5);
    const promise6 = functionName({Bucket: bucket, Key: fileNames[start + 6]}, start + 6);
    const promise7 = functionName({Bucket: bucket, Key: fileNames[start + 7]}, start + 7);
    const promise8 = functionName({Bucket: bucket, Key: fileNames[start + 8]}, start + 8);
    const promise9 = functionName({Bucket: bucket, Key: fileNames[start + 9]}, start + 9);
    return [await promise0, await promise1, await promise2, await promise3,
        await promise4, await promise5, await promise6,
        await promise7, await promise8, await promise9,
    ];
}

function gatherImageData(fileNames, _callback) {
    const promise0 = Promise.resolve(makePromiseSet(fileNames, getImageData, 0));
    const promise1 = Promise.resolve(makePromiseSet(fileNames, getImageData, 10));
    const promise2 = Promise.resolve(makePromiseSet(fileNames, getImageData, 20));
    const promise3 = Promise.resolve(makePromiseSet(fileNames, getImageData, 30));
    const promise4 = Promise.resolve(makePromiseSet(fileNames, getImageData, 40));
    Promise.all([promise0, promise1, promise2, promise3, promise4
    ]).then((values) => {
        _callback();
    });
}

let imageURLS = Array(50);
function gatherURL(fileNames, _callback) {
    for(let i = 0; i < 50; i++) {
        imageURLS[i] = s3.getSignedUrl('getObject', {
            Bucket: bucket,
            Key: fileNames[i],
            Expires: 36000
        });
    }
    _callback();
}

function gatherCSV(csvNames, _callback) {
    let csvStreams = [];
    for(let i = 0; i < 50; i++) {
        let fileData = [];
        csvStreams[i] = s3.getObject({Bucket: bucket, Key: csvNames[i]}).createReadStream();
        require('fast-csv').parseStream(csvStreams[i])
            .on('data', (data) => {
                fileData.push(data);
            }).on('end', count => {
                csvData[i] = fileData;
                if(i === 49) {
                    _callback();
                }
        });
    }
}

app.get('/aws2', async (req, res) => {
    let fileBase = req.query.file;
    let csvNames = [];
    for(let j = 0; j < 5; j++) {
        let sigma = '';
        switch(j) {
            case 0:
                sigma = '_0';
                break;
            case 1:
                sigma = '_0.5';
                break;
            case 2:
                sigma = '_1.0';
                break;
            case 3:
                sigma = '_1.5';
                break;
            case 4:
                sigma = '_2.0';
                break;
        }
        for(let i = 1; i <= 10; i++) {
            csvNames.push(fileBase + i + '.csv' + sigma + '.csv');
        }
    }
    gatherCSV(csvNames, function() {
        res.send(csvData);
    });
});

let recentDate = '';
function mostRecentAvailableDate(dataArray, _callback) {
    let latest = dataArray[0].Key.split('_');
    latest = latest[2];
    for(let i = 0; i < dataArray.length; i++) {
        let tempDate = dataArray[i].Key.split('_');
        tempDate = tempDate[2];
        if(tempDate > latest) {
            latest = tempDate;
        }
    }
    recentDate = latest;
    _callback();
}

app.get('/aws3', async (req, res) => {
    let rootName = req.query.file;
    let dateObject = new Date();
    let today = dateObject.getFullYear() + '-' + dateObject.getMonth() + '-' + dateObject.getDay();

    s3.listObjects({Bucket: bucket}, function (err, data) {
        if(err)throw err;
        mostRecentAvailableDate(data.Contents, function() {
            res.send(recentDate);
        });
    });
});

app.get('/aws', async (req, res) => {
    let rootName = req.query.file;
    let dateObject = new Date();
    let today = dateObject.getFullYear() + '-' + dateObject.getMonth() + '-' + dateObject.getDay();

    let fileNames = [];
    for(let j = 0; j < 5; j++) {
        let sigma = '';
        switch(j) {
            case 0:
                sigma = '_0';
                break;
            case 1:
                sigma = '_0.5';
                break;
            case 2:
                sigma = '_1.0';
                break;
            case 3:
                sigma = '_1.5';
                break;
            case 4:
                sigma = '_2.0';
                break;
        }
        for(let i = 1; i <= 10; i++) {
            fileNames.push(rootName + i + sigma + '.png');
        }
    }

    gatherURL(fileNames, function() {
        res.send(imageURLS);
    });
});

app.listen(8080,()=>{
    console.log('Web Server running on port', 8080);
});
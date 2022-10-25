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

const bucket = process.env.BUCKET_NAME;
const s3 = new AWS.S3();
let csvData = [];
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
        csvStreams[i] = s3.getObject({Bucket: bucket, Key: csvNames[i]}).createReadStream().on('error', err => {
            // console.log('error');
        }).on('data', data => {
            // console.log('success');
        });
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
        let percentile = '';
        switch(j) {
            case 0:
                percentile = '_50th.csv';
                break;
            case 1:
                percentile = '_60th.csv';
                break;
            case 2:
                percentile = '_70th.csv';
                break;
            case 3:
                percentile = '_80th.csv';
                break;
            case 4:
                percentile = '_90th.csv';
                break;
        }
        for(let i = 1; i <= 10; i++) {
            csvNames.push(fileBase + i + percentile);
        }
    }
    gatherCSV(csvNames, function() {
        res.send(csvData);
    });
});

let s3DataContents = [];
function s3ListObjects(params, _callback) {
    s3.listObjects(params, function(err, data) {
        if (err) {
            console.log("listS3Objects Error:", err);
        } else {
            let contents = data.Contents;
            console.log(contents[1].Key);
            s3DataContents = s3DataContents.concat(contents);
            if (data.IsTruncated) {
                params.Marker = contents[contents.length / 4].Key;
                s3ListObjects(params, _callback);
            } else {
                _callback();
            }
        }
    });
}

let recentDate = '';
function mostRecentAvailableDate(dateObject, dateOffset, prefix, suffix, _callback) {
    let date = dateObject.getFullYear() + '-' + pad(dateObject.getMonth() + 1) + '-' + pad(dateObject.getDate());
    let tempPrefix = prefix;
    if(prefix.includes('Vote_')) {
        tempPrefix += dateObject.getFullYear() + '' + pad(dateObject.getMonth() + 1) + '' + pad(dateObject.getDate()) + '_';
    }
    let keyName = tempPrefix + date + suffix;
    s3.headObject({Bucket: bucket, Key: keyName}, function(err, metadata) {
        if(err) {
            dateObject.setDate(dateObject.getDate() - 1);
            mostRecentAvailableDate(dateObject, dateOffset, prefix, suffix, _callback);
        } else {
            if(dateOffset > 0) {
                dateObject.setDate(dateObject.getDate() - 1);
                mostRecentAvailableDate(dateObject, dateOffset - 1, prefix, suffix, _callback);
            } else {
                recentDate = date;
                _callback();
            }
        }
    });
}

function pad(n) {
    return (n < 10) ? ('0' + n) : n;
}

app.get('/aws3', async (req, res) => {
    let dateObject = new Date();
    let dateOffset = parseInt(req.query.offset);
    let prefix = req.query.prefix + req.query.model;
    let suffix = '_1_' + req.query.suffix + '.png';

    mostRecentAvailableDate(dateObject, dateOffset, prefix, suffix, function() {
        res.send(recentDate);
    });
});

app.get('/aws', async (req, res) => {
    let rootName = req.query.file;
    let fileNames = [];

    for(let j = 0; j < 5; j++) {
        let percentile = '';
        switch(j) {
            case 0:
                percentile = '_50th.png';
                break;
            case 1:
                percentile = '_60th.png';
                break;
            case 2:
                percentile = '_70th.png';
                break;
            case 3:
                percentile = '_80th.png';
                break;
            case 4:
                percentile = '_90th.png';
                break;
        }
        for(let i = 1; i <= 10; i++) {
            fileNames.push(rootName + i + percentile);
        }
    }
    gatherURL(fileNames, function() {
        res.send(imageURLS);
    });
});

app.listen(8080,()=>{
    console.log('Web Server running on port', 8080);
});
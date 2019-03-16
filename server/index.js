const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const http = require('http');
const WebSocket = require('ws');
const SpookyMath = require('./SpookyMath');
const editor = require('./editor');
const crypt = require('./crypt')
var port = 3001;
const app = express();

let WSServer = require('ws').Server;
let server = require('http').createServer();
let wss = new WSServer({
    server: server
});

server.listen(port, function() {

  console.log(`http/ws server listening on ${port}`);
});

const globalTerrestrialArray = [319.08, 130, 7340.09, 25261.08, 1126.50, 166.90, 1594.24];



app.use(bodyParser.urlencoded({
    extended: true
}));

const Storage = multer.diskStorage({
    destination(req, file, callback) {
            console.log('file', file);
            fs.mkdirSync('./media/' + req.headers.userid + '/' + req.headers.starttime + '/' + req.headers.mediatype + '/', {recursive: true}, err => {});
            callback(null, './media/' + req.headers.userid  + '/' + req.headers.starttime +  '/' + req.headers.mediatype);

    },
    filename(req, file, callback) {
        console.log('multer callback', `${file.fieldname}_${Date.now()}_${file.originalname}`);
        callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    }
});

function editMedia(req, ws){
    const ffmpeg = require('fluent-ffmpeg');
    mediaFilePath = __dirname + '/media/' + req.headers.userid + '/' + req.headers.starttime;
    let spookyMath = new SpookyMath();


    fs.mkdirSync('./media/' + req.headers.userid + '/' + req.headers.starttime + '/image_scaled/', {recursive: true}, err => {});
    fs.mkdirSync('./media/' + req.headers.userid + '/' + req.headers.starttime + '/video_scaled/', {recursive: true}, err => {});
    fs.mkdirSync('./media/' + req.headers.userid + '/' + req.headers.starttime + '/imagecuts/', {recursive: true}, err => {});
    fs.mkdirSync('./media/' + req.headers.userid + '/' + req.headers.starttime + '/videocuts/', {recursive: true}, err => {});
    fs.mkdirSync('./media/' + req.headers.userid + '/' + req.headers.starttime + '/audiocuts/', {recursive: true}, err => {});
    fs.mkdirSync('./media/' + req.headers.userid + '_final/' + req.headers.starttime + '/', {recursive: true}, err => {});

    var getTerrestrialData = (lat, long, terrestrialArray, info, nearestStormDistance) => {
        return new Promise((resolve, reject) => {
            const marketSymbols = ['%5EIXIC', '%5EDJI', 'GOOG', 'FB', 'AMZN'];
            marketIDX = 0;

            var gatherWeatherData = (lat, long) => {
                weatherURL = `https://api.darksky.net/forecast/${crypt.darksky}/${lat},${long}`;
                axios.get(weatherURL)
                    .then(response => {
                        const { currently } = response.data;
                        const clemency = currently.nearestStormDistance ? currently.nearestStormDistance:
                            currently.pressure;

                        if(currently.nearestStormDistance) {
                            nearestStormDistance = true;
                        }
                        terrestrialArray= [...terrestrialArray, currently.temperature, clemency];
                        gatherMarketData(marketSymbols, marketIDX, terrestrialArray);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }

            var gatherMarketData = (marketSymbols, marketIDX) => {
                if(!marketSymbols[marketIDX]) {
                    resolve({terrestrialArray, info, nearestStormDistance});
                    return;

                }
                const marketSymbolPrefix = 'https://query1.finance.yahoo.com/v7/finance/chart/';
                const marketSymbolSuffix = '?&interval=5m';
                const marketURL = marketSymbolPrefix + marketSymbols[marketIDX] + marketSymbolSuffix;

                axios.get(marketURL)
                    .then(response => {
                        terrestrialArray= [...terrestrialArray, response.data.chart.result[0].indicators.quote[0].close[0]];

                        marketIDX++;
                        gatherMarketData(marketSymbols, marketIDX);
                    })
                    .catch(error => {
                        console.log(error);
                        reject();
                });
            }
            gatherWeatherData(lat, long, nearestStormDistance);
        })
    }

    var calculateHeavenlyArray = (lat, long) => {
        const ephemeris = require('ephemeris');
        const Moment = require('moment-timezone');

        var now = new Date();

        var zeroAdder = num => (num > 9 ? num: '0' + num);

        var dateString = `${zeroAdder(now.getDate())}.${zeroAdder(now.getMonth())}.${now.getFullYear()} ${zeroAdder(now.getHours())}:${zeroAdder(now.getMinutes())}:${zeroAdder(now.getSeconds())}`;

        const dateObj = new Moment.tz(dateString, 'DD.MM.YYYY HH:mm:ss', 'UTC');
        var result = ephemeris.getAllPlanets(dateObj, lat, long, 0);
        const { moon, mars, venus, jupiter, mercury, saturn, sun } = result.observed;

        heavenlyArray = [
            moon.apparentLongitudeDd,
            mars.apparentLongitudeDd,
            venus.apparentLongitudeDd,
            jupiter.apparentLongitudeDd,
            mercury.apparentLongitudeDd,
            saturn.apparentLongitudeDd,
            sun.apparentLongitudeDd
        ];

        return heavenlyArray;
    }

    const sendEmail = (terrestrialArray, heavenlyArray, nearestStormDistance) => {
        const host = req.hostname;
        const fullReturnAddress = `${host}:${port}`;
        var nodemailer = require('nodemailer');

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                   user: 'collagekidmedia@gmail.com',
                   pass: 'Madeup!donkey!college!70'
               }
        });

        const mailOptions = {
            from: 'collagekidmedia@gmail.com', // sender address
            to: req.headers.email, // list of receivers
            subject: 'Your Work', // Subject line
            html: `<p>Here is a link to your art.  It will be available for 30 days.
            <a href="http://${fullReturnAddress}/download?userid=${req.headers.userid}&starttime=${req.headers.starttime}">Download your piece</a></p>
            <p>At the time you finalized this piece, the temperature was ${(terrestrialArray[0] + 273.15).toFixed(2)} &deg; Kelvin, the ${nearestStormDistance
                 ? 'nearest storm was ' + terrestrialArray[1] + ' km away': 'barometric pressure was ' + terrestrialArray[1].toFixed(2) + ' millibars'}, the
                 Dow and Nasdaq were at ${terrestrialArray[2].toFixed(2)} and ${terrestrialArray[3].toFixed(2)} respectively.</p>

                 <p>Here are the values of the terrestrial and heavenly entities that also shaped your piece:</p>
                 <table border=0>
                    <tr>
                        <td colspan=2><strong>Terrestrial values (USD)</strong</td>
                    <tr>
                        <td>Google stock price:</td>
                        <td>$${terrestrialArray[4].toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Facebook stock price</td>
                        <td>$${terrestrialArray[5].toFixed(2)}</td>
                    <tr>
                        <td>Amazon stock price</td>
                        <td>$${terrestrialArray[6].toFixed(2)}</td>
                    </td>
                    <tr>
                        <td colspan=2>&nbsp;</td>
                    </tr>
                    <tr>
                        <td colspan=2><strong>Heavenly values</strong> (all angles w/respect to true north)</td>
                    <tr>
                    <tr>
                        <td>Sun</td>
                        <td>${heavenlyArray[6].toFixed(2)} &deg;</td>
                    </tr>
                    <tr>
                        <td>Moon</td>
                        <td>${heavenlyArray[0].toFixed(2)} &deg;</td>
                    </tr>
                    <tr>
                        <td>Mercury</td>
                        <td>${heavenlyArray[4].toFixed(2)} &deg;</td>
                    </tr>
                    <tr>
                        <td>Venus</td>
                        <td>${heavenlyArray[2].toFixed(2)} &deg;</td>
                    </tr>
                    <tr>
                        <td>Mars</td>
                        <td>${heavenlyArray[1].toFixed(2)} &deg;</td>
                    </tr>
                    <tr>
                        <td>Jupiter</td>
                        <td>${heavenlyArray[3].toFixed(2)} &deg;</td>
                    </tr>
                    <tr>
                        <td>Saturn</td>
                        <td>${heavenlyArray[5].toFixed(2)} &deg;</td>
                    </tr>
                </table>
                <br>
                Sincerely,<br /><br/>
                The Collage Kid Media team <br /><br />
                ${req.headers.empirestate==="true" ? `p.s. <br /> We defaulted your location to that of the
                    Empire State Building in New York City, arguably the center of the known universe.
                    If you would like more accurate results, please feel free to
                    allow geolocation in settings for this app.` : ''}
            `
          };

        transporter.sendMail(mailOptions, function (err, info) {
            if(err)
              console.log(err)
            else
              console.log(info);
         });
    }

    var getTrackDurations = (ffmpeg, info) => {
        return Promise.all([editor.getTrackDuration(ffmpeg, info[0]), editor.getTrackDuration(ffmpeg, info[1])]);
    }

    //Do everything
    editor.concatMedia().scaleVideos(ffmpeg, mediaFilePath)
    .then((result) => Promise.all(
        [
            editor.concatMedia().concatVideos(ffmpeg, result),
            editor.concatMedia().concatSounds(ffmpeg, result.path)
        ]
    ))
    .then(info => {
        ws.send(JSON.stringify({
            status: 'wait'
        }));
        return Promise.all([editor.extractAudio(ffmpeg, info), editor.removeAudio(ffmpeg, info)]);
    })
    .then(info => {
        ws.send(JSON.stringify({
            status: 'wait'
        }));
        return getTrackDurations(ffmpeg, info[0]);
    })
    .then(durationInfo => {
        ws.send(JSON.stringify({
            status: 'wait'
        }));
        var mediaInfo = {};
        var heavenlyArray = [];
        var EDLdata = {}

        mediaInfo.rawClipTime = durationInfo[0].duration;
        mediaInfo.concatSoundsLength = durationInfo[1].duration;
        mediaInfo.imageNames = editor.getImagesInfo(durationInfo[0].path);

        EDLdata.mediaInfo = mediaInfo;
        return { EDLdata: EDLdata, path: durationInfo[0].path}
    })
    .then((info) => {
        ws.send(JSON.stringify({
            status: 'wait'
        }));
        var terrestrialArray = [];
        var nearestStormDistance = false;
        return getTerrestrialData(
            req.headers.latitude,
            req.headers.longitude,
            terrestrialArray,
            info,
            nearestStormDistance
        )
    })
    .then((info) => {
        ws.send(JSON.stringify({
            status: 'wait'
        }));
        for(let i=0; i< info.terrestrialArray.length; i++) {
            if (!info.terrestrialArray) {
                info.terrestrialArray[i] = globalTerrestrialArray[i];
            } else {
                globalTerrestrialArray[i] = info.terrestrialArray[i];
            }
        }

        info.info.EDLdata.terrestrialArray = info.terrestrialArray;
        info.info.EDLdata.heavenlyArray = calculateHeavenlyArray(req.headers.latitude, req.headers.longitude);
        emailData={
            terrestrial: info.info.EDLdata.terrestrialArray,
            heavenly: info.info.EDLdata.heavenlyArray,
            nearestStormDistance: info.nearestStormDistance
        }
        const EDL = spookyMath.calculateEDL(info.info.EDLdata, req.headers.starttime, req.headers.duration);
        const mediaFilePathFinal = './media/' + req.headers.userid + '_final/' + req.headers.starttime + '/'
        return editor.executeEDL(
            ffmpeg,
            [...EDL, info.info.EDLdata.mediaInfo.imageNames],
            info.info.path,
            mediaFilePathFinal,
            emailData,
            ws
        );
    })
    .then((info)  => {
        ws.send(JSON.stringify({
            status: 'wait'
        }));
        console.log(ws);
        console.log(`${req.headers.host}/download?userid=${req.headers.userid}&starttime=${req.headers.starttime}`);
        //sendEmail(info.emailInfo.terrestrial, info.emailInfo.heavenly, info.emailInfo.nearestStormDistance);
        ws.send(JSON.stringify({
            status: 'go',
            url: `${req.headers.host}/download?userid=${req.headers.userid}&starttime=${req.headers.starttime}`
        }));
    })
    .catch((error) => console.log('error:', error));
}

const logRequestStart = (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
}

app.use(logRequestStart);


const upload = multer({
    storage: Storage,
    limits: { fieldSize: 25 * 1024 * 1024, fileSize: 500 * 1024 * 1024 }
});

app.post('/api/upload', upload.array('media'), (req, res) => {
    console.log('upload request headers:', req.headers)
    res.status(200).json({
        message: 'success!'
    })
})

app.get('/download', (req, res) => {
    var file = `${__dirname}/media/${req.query.userid}_final/${req.query.starttime}/finalvideo.mp4`;
    res.download(file);
})

app.get('/delete', (req, res) => {
    var file = `${__dirname}/media/${req.query.userid}/${req.query.starttime}/${req.query.filename}`;
    fs.unlinkSync(file);
})

app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'welcome to collage server'
    })
})


server.on('request', app);

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log(`received: ${message}`);
        const editData = JSON.parse(message);

        if (editData.type==='edit') {
            editMedia(editData, ws);
        }

    ws.send(JSON.stringify({
        status: 'wait'
    }));
  });
});



//app.listen(port, () => console.log(`listening on port ${port}`))

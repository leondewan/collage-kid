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

//LOCAL
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
        callback(null, `${file.originalname}`);
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

    var getTrackDurations = (ffmpeg, info) => {
        return Promise.all([editor.getTrackDuration(ffmpeg, info[0]), editor.getTrackDuration(ffmpeg, info[1])]);
    }

    //Do everything
    editor.concatMedia().scaleVideos(ffmpeg, mediaFilePath, ws)
    .then((result) => Promise.all(
        [
            editor.concatMedia(ws).concatVideos(ffmpeg, result),
            editor.concatMedia(ws).concatSounds(ffmpeg, result.path)
        ]
    ))
    .then(info => {
        console.log('about to extract audio');
        ws.send(JSON.stringify({
            status: 'wait',
            interval: 10
        }));
        return Promise.all([editor.extractAudio(ffmpeg, info), editor.removeAudio(ffmpeg, info)]);
    })
    .then(info => {
        ws.send(JSON.stringify({
            status: 'wait',
            interval: 10
        }));
        return getTrackDurations(ffmpeg, info[0]);
    })
    .then(durationInfo => {
        ws.send(JSON.stringify({
            status: 'wait',
            interval: 10
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
            status: 'wait',
            interval: 10
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
            status: 'wait',
            interval: 10
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


        ws.send(JSON.stringify({
            status: 'info',
            terrestrial: info.info.EDLdata.terrestrialArray,
            heavenly: info.info.EDLdata.heavenlyArray,
            nearestStormDistance: info.nearestStormDistance
        }));

        const EDL = spookyMath.calculateEDL(info.info.EDLdata, req.headers.starttime, req.headers.duration);
        const mediaFilePathFinal = './media/' + req.headers.userid + '_final/' + req.headers.starttime + '/'
        return editor.executeEDL(
            ffmpeg,
            [...EDL, info.info.EDLdata.mediaInfo.imageNames],
            info.info.path,
            mediaFilePathFinal,
            ws
        );
    })
    .then((info)  => {
        ws.send(JSON.stringify({
            status: 'wait',
            interval: 10
        }));
        console.log(ws);

        ws.send(JSON.stringify({
            status: 'go',
            url: `${req.headers.host}/download?userid=${req.headers.userid}&starttime=${req.headers.starttime}`
        }));
    })
    .catch((error) => {
        console.log('overall editing error:', error)
        ws.send(JSON.stringify({
            status: 'error'
        }));
    });
}

const narrateMedia = (req, ws) => {
    const ffmpeg = require('fluent-ffmpeg');
    path = __dirname + '/media/' + req.headers.userid + '/' + req.headers.starttime;
    path_final = __dirname + '/media/' + req.headers.userid + '_final/' + req.headers.starttime;
    console.log('start narration add', path);


    const addNarrationToVideo = () => {

        const mergeToVideo = () => {
            ffmpeg(`${path_final}/finalvideo.mp4`)
            .addInput(`${path}/final_video_narrated_audio.mp4`)
            .outputOptions(['-map 0:v', '-map 1:a'])
            .save(`${path_final}/finalvideo_narrated.mp4`)
            .on('error', (err) => (console.log('merge to video error')))
            .on('end', () => {
                fs.copyFileSync(`${path_final}/finalvideo_narrated.mp4`, `${path_final}/finalvideo.mp4`);

                var deleteFolderRecursive = (path) => {
                    if( fs.existsSync(path) ) {
                        fs.readdirSync(path).forEach(function(file,index){
                            var curPath = path + "/" + file;
                            if(fs.lstatSync(curPath).isDirectory()) {
                            deleteFolderRecursive(curPath);
                        } else {
                            fs.unlinkSync(curPath);
                        }
                      });
                      fs.rmdirSync(path);
                    }
                };

                deleteFolderRecursive(`${path}/narration`);

                ws.send(JSON.stringify({
                    status: 'narrated',
                    url: `${req.headers.host}/download?userid=${req.headers.userid}&starttime=${req.headers.starttime}`
                }));
            });
        }

        const mixAudioTracks = () => {
            ffmpeg(`${path}/finalvideo_audio.mp4`)
            .addInput(`${path}/narration_concat.mp4`)
            .complexFilter('[0:a]volume=1.5[a0];[1:a]volume=0.75[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=3')

            .save(`${path}/final_video_narrated_audio.mp4`)
            .on('end', () => {
                mergeToVideo();
            })
            .on('error', (err) => (console.log('mix tracks error', err)));
        }
        //start addnarrationtovideo
        ffmpeg(`${path_final}/finalvideo.mp4`)
            .save(`${path}/finalvideo_audio.mp4`)
            .on('end', () => {

                mixAudioTracks();
            })
            .on('error', (err) => (console.log('extract audio error')));
    }

    var clips = [];
    clips = fs.existsSync(path + '/narration')
        ? fs.readdirSync(path + '/narration'): [];


    fullClips = clips.map((clip) => path + '/narration/' + clip);
    console.log(fullClips);

    var mergedMedia=ffmpeg();

    //START CONCAT
    fullClips.forEach((clip) => {
        mergedMedia = mergedMedia.addInput(clip);
    });

    mergedMedia.mergeToFile(`${path}/narration_concat.mp4`, './tmp/')
        .on('error', function(err) {
            console.log('Error in audio' + err.message);
        })
        .on('end', () => {
            console.log(`finished concat: ${path}/narration_concat.mp4`);
            addNarrationToVideo();
    });
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

app.get('/api/delete', (req, res) => {
    console.log('delete', req);
    var file = `${__dirname}/media/${req.headers.userid}/${req.headers.starttime}/${req.headers.mediatype}/${req.headers.filename}`;
    fs.unlinkSync(file);
    res.status(200).json({
        message: 'file deleted'
    })
})

app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'welcome to collage server'
    })
})

app.get('/api/test', (req, res) => {
    res.status(200).json({
        message: 'welcome to collage server test'
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

        if (editData.type==='narrate') {
            narrateMedia(editData, ws);
        }

    ws.send(JSON.stringify({
        status: 'wait',
        interval: 10
    }));
  });
});

const fs = require('fs');
const spawn = require('child_process').spawn;

exports.concatMedia = () => {
    var videoScaleHolder = [];

    var scaleVideos = (ffmpeg, mediaFilePath, ws) => {
        return new Promise((resolve, reject) => {
            var videoList = fs.readdirSync(mediaFilePath + '/video');
            var waitInterval = 10 / videoList.length;
            for(index = 0; index < videoList.length; index ++) {
                videoScaleHolder[index] = (index) =>  {
                    return new Promise((resolve, reject) => {
                        ffmpeg(`${mediaFilePath}/video/${videoList[index]}`)
                            .videoFilters('scale=480:640')
                            .fps(15)

                            .on('error', error => {
                                console.log('scaler error?');
                                reject((err) => console.log('individual video scaler error', err));
                                ws.send(JSON.stringify({
                                    status: 'error'
                                }));
                            })
                            .on('end', () => {
                                console.log('scaled video');
                                ws.send(JSON.stringify({
                                    status: 'wait',
                                    interval: waitInterval
                                }));
                                resolve( `${mediaFilePath}/video_scaled/${videoList[index]}`);
                            })
                            .save(`${mediaFilePath}/video_scaled/${videoList[index]}`)

                    })
                }
            }
            return Promise.all(videoScaleHolder.map((cut, index) => cut(index)))
                .then((result) => {
                    console.log('scaled videos');
                    return resolve({
                        assets: result,
                        path: mediaFilePath
                    })
                })
                .catch((err) => reject('video scaler error:' + err))
        })
    }
    var spliceMedia = (mediaFilePath, mediaConcat, mediaType, fileExtension, scaled, done) => {
        var mediaPath = `${mediaFilePath}/${mediaType}${scaled ? '_scaled' : ''}/`
        var mediaList = mediaConcat.map((mediaClip) => `file ${mediaClip}`).join('\n');

        fs.writeFileSync(`${mediaPath}concatList.txt`, mediaList);

        let ffmpeg = spawn('ffmpeg', [
            '-y',
            '-f',
            'concat',
            '-safe',
            '0',
            '-i',
            `${mediaPath}/concatList.txt`,
            '-c',
            'copy',
            `${mediaFilePath}/concat${mediaType}.${fileExtension}`
        ]);
        ffmpeg.on('exit', done(true, `${mediaFilePath}/concat${mediaType}.${fileExtension}`));
    }

    var concatVideos = (ffmpeg, media, ws) => {
        var videoConcat = media.assets;
        return new Promise((resolve, reject) => {
            spliceMedia(media.path, videoConcat, 'video', 'mp4', true, (success, info) => {
                if(success) {
                    console.log('concat videos');
                    return resolve({media: info, path: media.path});
                } else {
                    return reject(info);
                }
            });
        }, true);
    }

    var concatSounds = (ffmpeg, path) => {
        var soundConcat = [];
        soundConcat = fs.existsSync(path + '/sound')
            ? fs.readdirSync(path + '/sound'): [];

        return new Promise((resolve, reject) => {
            if(!soundConcat.length) {
                resolve(soundConcat);
                return;
            }
            soundConcatFull = soundConcat.map((clip) => path + '/sound/' + clip);
            spliceMedia(path, soundConcatFull, 'sound', 'mp4', false, (success, info) => {
                if(success) {
                    console.log('concat sounds');
                    resolve({media: info, path});
                } else {
                    reject(info);
                }
            } );
        });
    }

    return {
        scaleVideos,
        concatVideos,
        concatSounds
    }
}

exports.getTrackDuration = (ffmpeg, track) => {
    return new Promise((resolve, reject) => {
        if(!track.media) {
            resolve(0);
            return;
        }
        ffmpeg.ffprobe(track.media, (err, metadata) => {
            if(err) {
                reject('error:' + err);
            } else {
                console.log('calculated duration');
                resolve({ duration: metadata.format.duration, path: track.path });
            }
        });
    });

}

exports.getImagesInfo = (path) => {
    if(!fs.existsSync(path + '/image')) {
        return [];
    }
    return fs.readdirSync(`${path}/image`);
}

exports.extractAudio = (ffmpeg, info) => {
    return new Promise((resolve, reject) => {
        setTimeout( () => ffmpeg(info[0].media).noVideo()
            .save(`${info[0].path}/concatvideo_audio.mp4`)
            .on('error', function(err) {
                console.log('Error in extract audio ' + err.message);
                reject(err => console.log('error', err));
            })
            .on('end', () => {
                console.log('extracted audio');
                return resolve(info);
            }), 500);
    })

}

exports.removeAudio = (ffmpeg, info) => {
    return new Promise((resolve, reject) => {
        setTimeout( () => ffmpeg(info[0].media).noAudio()
            .save(`${info[0].path}/concatvideo_noaudio.mp4`)
            .on('error', function(err) {
                console.log('Error in remove audio' + err.message);
                reject(err => console.log('error', err));
            })
            .on('end', () => {
                console.log('removed audio');
                return resolve(info);
            }), 500);
    })

}

exports.executeEDL = (ffmpeg, EDL, mediaFilePath, mediaFilePathFinal, ws) => {
    return new Promise((resolve, reject) => {
        var rawImageTimes = EDL[1];
        var imageList = EDL[2];
        var imageScaleHolder = [];
        var imageCutsHolder = [];
        var videoCutsHolder = [];
        var audioCutsHolder = [];

        var generateTerrestrialMap = () => {
            var sortMap = EDL[0].terrestrial.reduce((acc, cur, index) => [...acc, {index: index, sortBy: cur.sortBy}] , []);
            sortMap.sort((a, b) => a.sortBy - b.sortBy);
            return sortMap.reduce((acc, cur) => [...acc, cur.index], []);
        }

        var generateHeavenlyMap = () => {
            var sortMap = EDL[0].heavenly.reduce((acc, cur, index) => [...acc, {index: index, sortBy: cur.sortBy}] , []);
            sortMap.sort((a, b) => a.sortBy - b.sortBy);
            return sortMap.reduce((acc, cur) => [...acc, cur.index], []);
        }

        var terrestrialMap = generateTerrestrialMap();
        var heavenlyMap = generateHeavenlyMap();

        for(index = 0; index < imageList.length; index ++) {
            imageScaleHolder[index] = (index) =>  {
                return new Promise((resolve, reject) => {
                    ffmpeg(`${mediaFilePath}/image/${imageList[index]}`)
                        .videoFilters('scale=480:-1')
                        .videoFilters('crop=480:640')
                        .on('error', error => {
                            console.log('error', error)
                            reject((err) => console.log('error', err));
                        })
                        .on('end', () => {
                            console.log('scaled image');
                            return resolve(`${mediaFilePath}/image_scaled/${imageList[index]}`);
                        })
                        .save(`${mediaFilePath}/image_scaled/${imageList[index]}`)

                })
            }
        }

        for(index = 0; index < imageList.length; index ++) {
            imageCutsHolder[index] = (index) =>  {
                return new Promise((resolve, reject) => {
                    ffmpeg(`${mediaFilePath}/image_scaled/${imageList[index]}`)
                        .loop(rawImageTimes[index])
                        .fps(15)
                        .on('error', error => {
                            console.log('error', error)
                            reject((err) => console.log('error', err));
                        })
                        .on('end', () => {
                            console.log('made image cut');
                            return resolve(`${mediaFilePath}/imagecuts/imageCut${index}.mp4`)})
                        .save(`${mediaFilePath}/imagecuts/imageCut${index}.mp4`);
                })
            }
        }

        const appendImageCuts = (imageCuts) => {
            var mergedMedia = ffmpeg();
            var mediaConcat = [`${mediaFilePath}/concatvideo_noaudio.mp4`, ...imageCuts];
            return new Promise((resolve, reject) => {
                if(!imageCuts.length) {
                    fs.rename(`${mediaFilePath}/concatvideo_noaudio.mp4`,
                        `${mediaFilePath}/concatfullvideo.mp4`,
                        (err) => {
                            if ( err ) console.log('ERROR: ' + err);
                        });
                    resolve();
                    return;
                }

                mediaList = mediaConcat.map((mediaClip) => `file ${mediaClip}`).join('\n');

                fs.writeFileSync(`${mediaFilePath}/imageCutsList.txt`, mediaList);

                let ffmpeg = spawn('ffmpeg', [
                    '-y',
                    '-f',
                    'concat',
                    '-safe',
                    '0',
                    '-i',
                    `${mediaFilePath}/imageCutsList.txt`,
                    '-c',
                    'copy',
                    `${mediaFilePath}/concatfullvideo.mp4`
                ]);
                ffmpeg.on('exit', () => {
                    console.log('concatted full video');
                    return resolve(`${mediaFilePath}/concatfullvideo.mp4`)
                });
            });
        }

        const concatAudio = () => {
            return new Promise((resolve, reject ) => {
                if(!fs.existsSync(`${mediaFilePath}/concatsound.mp4`)){
                    console.log('no concat sounds')
                    fs.rename(`${mediaFilePath}/concatvideo_audio.mp4`,
                        `${mediaFilePath}/concatfullaudio.mp4`,
                        (err) => {
                            if ( err ) console.log('ERROR: ' + err);
                        });
                    resolve();
                    return;
                }


                ffmpeg(`${mediaFilePath}/concatvideo_audio.mp4`)
                    .addInput(`${mediaFilePath}/concatsound.mp4`)
                    .mergeToFile(`${mediaFilePath}/concatfullaudio.mp4`, './tmp/')

                    .on('error', function(err) {
                        console.log('Error', err.message);
                        reject('error:', err);
                    })
                    .on('end', function() {
                        console.log('concatted full audio');
                        resolve();
                });
            });
        }

        const prepareCutVideoClips = () => {
            var terrestrial = EDL[0].terrestrial;
            var waitInterval = 10 / terrestrial.length;
            for(var index = 0; index < terrestrial.length; index ++) {
                videoCutsHolder[index] = (index) =>  {
                    return new Promise((resolve, reject) => {
                        ffmpeg(`${mediaFilePath}/concatfullvideo.mp4`)
                            .seekInput(terrestrial[index].startTime)
                            .duration(EDL[0].terrestrial[index].duration)
                            .fps(15)
                            .on('error', error => {
                                console.log('error', error)
                                reject((err) => console.log('error', err));
                            })
                            .on('end', () => {
                                console.log('prepared video cut clip');
                                ws.send(JSON.stringify({
                                    status: 'wait',
                                    interval: waitInterval
                                }));
                                resolve(`${mediaFilePath}/videocuts/videocut${index}.mp4`);
                            })
                            .save(`${mediaFilePath}/videocuts/videocut${index}.mp4`);
                    })
                }
            }
        }

        prepareCutVideoClips();

        const assembleVideoClips = (videoClips) => {
            console.log('starting assemblevideoclips');
            return new Promise((resolve, reject) => {
                //var mediaList = videoClips.map((mediaClip) => `file ${mediaClip}`).join('\n');
                var mediaList = '';
                for(var i = 0; i < videoClips.length; i++) {
                    mediaList += `file ${videoClips[terrestrialMap[i]]}\n`;
                }

                fs.writeFileSync(`${mediaFilePath}/assembleVideoList.txt`, mediaList);

                let ffmpeg = spawn('ffmpeg', [
                    '-y',
                    '-f',
                    'concat',
                    '-safe',
                    '0',
                    '-i',
                    `${mediaFilePath}/assembleVideoList.txt`,
                    '-c',
                    'copy',
                    `${mediaFilePath}/assembledfullvideo.mp4`
                ]);
                ffmpeg.on('exit', () => {
                    console.log('assembled full video');
                    ws.send(JSON.stringify({
                        status: 'wait',
                        interval: 10
                    }));
                    return resolve(`${mediaFilePath}/assembledfullvideo.mp4`)
                });
            })
        }

        const prepareCutAudioClips = () => {
            var heavenly = EDL[0].heavenly;
            var waitInterval = 10 / heavenly.length;
            for(var index = 0; index < heavenly.length; index ++) {
                audioCutsHolder[index] = (index) =>  {
                    return new Promise((resolve, reject) => {
                        ffmpeg(`${mediaFilePath}/concatfullaudio.mp4`)
                            .seekInput(heavenly[index].startTime)
                            .duration(EDL[0].heavenly[index].duration)
                            .on('error', error => {
                                console.log('error', error)
                                reject((err) => console.log('error', err));
                            })
                            .on('end', () => {
                                console.log('prepared audio cut clip');
                                ws.send(JSON.stringify({
                                    status: 'wait',
                                    interval: waitInterval
                                }));
                                resolve(`${mediaFilePath}/audiocuts/audiocut${index}.mp4`);
                            })
                            .save(`${mediaFilePath}/audiocuts/audiocut${index}.mp4`);
                    })
                }
            }
        }

        prepareCutAudioClips();

        const assembleAudioClips = (audioClips) => {
            var mergedMedia = ffmpeg();
            return new Promise((resolve, reject) => {
                var mediaList = '';
                for(var i = 0; i < audioClips.length; i++) {
                    mediaList += `file ${audioClips[heavenlyMap[i]]}\n`;
                }

                fs.writeFileSync(`${mediaFilePath}/assembleAudioList.txt`, mediaList);

                let ffmpeg = spawn('ffmpeg', [
                    '-y',
                    '-f',
                    'concat',
                    '-safe',
                    '0',
                    '-i',
                    `${mediaFilePath}/assembleAudioList.txt`,
                    '-c',
                    'copy',
                    `${mediaFilePath}/assembledfullaudio.mp4`
                ]);
                ffmpeg.on('exit', () => {
                    console.log('assembled full audio');
                    ws.send(JSON.stringify({
                        status: 'wait',
                        interval: 10
                    }));
                    return resolve(`${mediaFilePath}/assembledfullaudio.mp4`)
                });

            })
        }

        const assembleFinalVideo = () => {
          console.log('started assembling final video');
              return new Promise((resolve, reject) => {
                ffmpeg(`${mediaFilePath}/assembledfullvideo.mp4`)
                .addInput(`${mediaFilePath}/assembledfullaudio.mp4`)
                .size('480x640')
                .fps(29.96)
                .videoCodec('libx264')
                .save(`${mediaFilePathFinal}/finalvideo.mp4`)
                .on('error', (err) => reject(console.log('assemble final video error', err)))
                .on('end', () => {
                    resolve(`${mediaFilePathFinal}finalvideo.mp4`);
                    console.log('assembly finish from inside assemble');
                });
            })
        }

        const assembly = () => {
            return new Promise((resolve, reject) => {
                Promise.all(imageCutsHolder.map((cut, index) => cut(index)))
                    .then((result) => appendImageCuts(result))
                    .then(() => concatAudio())
                    .then(() => {
                        ws.send(JSON.stringify({
                            status: 'wait',
                            interval: 10
                        }));
                        return Promise.all(videoCutsHolder.map((cut, index) => cut(index)))
                    })
                    .then((result)=> assembleVideoClips(result))
                    .then(() => {
                        ws.send(JSON.stringify({
                            status: 'wait',
                            interval: 10
                        }));
                        return Promise.all(audioCutsHolder.map((cut, index) => cut(index)))
                    })
                    .then((result)=> assembleAudioClips(result))
                    .then(() => {
                        ws.send(JSON.stringify({
                            status: 'wait',
                            interval: 10
                        }));
                        return assembleFinalVideo()
                    })
                    .then((finalVideo) => {
                        console.log('final video assembled');
                        resolve(finalVideo);
                    })
                    .catch((err) => {
                        console.log('error', err);
                        reject('error: ' + err)
                    })

            })

        }

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


        const cleanup = () => {
            //deleteFolderRecursive(mediaFilePath);
            console.log('cleanup complete')

        }

        Promise.all(imageScaleHolder.map((cut, index) => cut(index)))
            .then(() => assembly())
            .then((finalVideo)=> {
                cleanup();
                resolve({EDL, mediaFilePath});
            })
            .catch((err) => {
                console.log('error: ', err);
                reject('error', err)
            });
    });
}

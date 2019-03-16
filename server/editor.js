const fs = require('fs');

exports.concatMedia = () => {
    var videoScaleHolder = [];

    var scaleVideos = (ffmpeg, mediaFilePath) => {
        return new Promise((resolve, reject) => {
            var videoList = fs.readdirSync(mediaFilePath + '/video');
            for(index = 0; index < videoList.length; index ++) {
                videoScaleHolder[index] = (index) =>  {
                    return new Promise((resolve, reject) => {
                        ffmpeg(`${mediaFilePath}/video/${videoList[index]}`)
                            .videoFilters('scale=144:-1')
                            .videoFilters('crop=144:192')

                            .on('error', error => {
                                reject((err) => console.log('individual video scaler error', err));
                            })
                            .on('end', () => {
                                resolve( `${mediaFilePath}/video_scaled/${videoList[index]}`);
                            })
                            .save(`${mediaFilePath}/video_scaled/${videoList[index]}`)

                    })
                }
            }
            return Promise.all(videoScaleHolder.map((cut, index) => cut(index)))
                .then((result) => resolve({
                    assets: result,
                    path: mediaFilePath
                }))
                .catch((err) => reject('video scaler error:' + err))
        })
    }
    var spliceMedia = (ffmpeg, mediaFilePath, mediaConcat, mediaType, fileExtension, scaled, done) => {
        var mergedMedia = ffmpeg();
        //var mediaPath = `${mediaFilePath}/${mediaType}${scaled ? '_scaled' : ''}/`
        mediaConcat.forEach((mediaClip) => {
            mergedMedia = mergedMedia.addInput(mediaClip);
        });

        if(mediaType==='audio') {
            mergedMedia.mergeToFile(`${mediaFilePath}/concat${mediaType}.${fileExtension}`, './tmp/')
                .on('error', function(err) {
                    console.log('Error in audio' + err.message);
                    done(false, err.message);
                })
                .on('end', function() {
                    done(true, `${mediaFilePath}/concat${mediaType}.${fileExtension}`);
            });
        } else {

            mergedMedia.mergeToFile(`${mediaFilePath}/concat${mediaType}.${fileExtension}`, './tmp/').fps(15)
                .on('error', function(err) {
                    console.log('Error:' + mediaType + ' ' + err.message);
                    done(false, err.message);
                })
                .on('end', function() {
                    done(true, `${mediaFilePath}/concat${mediaType}.${fileExtension}`);
            });
        }
    }

    var concatVideos = (ffmpeg, media) => {;
        var videoConcat = media.assets;
        return new Promise((resolve, reject) => {
            spliceMedia(ffmpeg, media.path, videoConcat, 'video', 'mov', true, (success, info) => {
                if(success) {
                    resolve({media: info, path: media.path});
                } else {
                    reject(info);
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
            spliceMedia(ffmpeg, path, soundConcatFull, 'sound', 'mp3', false, (success, info) => {
                if(success) {
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
        ffmpeg(info[0].media).noVideo()
            .save(`${info[0].path}/concatvideo_audio.mp3`)
            .on('error', function(err) {
                console.log('Error in extract audio ' + err.message);
                reject(err => console.log('error', err));
            })
            .on('end', () => resolve(info));
    })

}

exports.removeAudio = (ffmpeg, info) => {
    return new Promise((resolve, reject) => {
        ffmpeg(info[0].media).noAudio()
            .save(`${info[0].path}/concatvideo_noaudio.mov`)
            .on('error', function(err) {
                console.log('Error in remove audio' + err.message);
                reject(err => console.log('error', err));
            })
            .on('end', () => resolve(info));
    })

}

exports.executeEDL = (ffmpeg, EDL, mediaFilePath, mediaFilePathFinal, emailInfo, ws) => {
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
                        .size('144x192')
                        .on('error', error => {
                            console.log('error', error)
                            reject((err) => console.log('error', err));
                        })
                        .on('end', () => {
                            resolve(`${mediaFilePath}/image_scaled/${imageList[index]}`);
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
                        .size('144x192')
                        .on('error', error => {
                            console.log('error', error)
                            reject((err) => console.log('error', err));
                        })
                        .on('end', () => resolve(`${mediaFilePath}/imagecuts/imageCut${index}.mov`))
                        .save(`${mediaFilePath}/imagecuts/imageCut${index}.mov`);
                })
            }
        }

        const appendImageCuts = (imageCuts) => {
            var mergedMedia = ffmpeg();
            var mediaConcat = [`${mediaFilePath}/concatvideo_noaudio.mov`, ...imageCuts];
            return new Promise((resolve, reject) => {
                if(!imageCuts.length) {
                    fs.rename(`${mediaFilePath}/concatvideo_noaudio.mov`,
                        `${mediaFilePath}/concatfullvideo.mov`,
                        (err) => {
                            if ( err ) console.log('ERROR: ' + err);
                        });
                    resolve();
                    return;
                }


                mediaConcat.forEach((mediaClip) => {
                    mergedMedia = mergedMedia.addInput(mediaClip);
                });


                mergedMedia.mergeToFile(`${mediaFilePath}/concatfullvideo.mov`, './tmp/')
                    .fps(15)
                    .on('error', function(err) {
                        console.log('Error ' + err.message);
                        reject((err) => console.log('error', err));
                    })
                    .on('end', () => resolve(`${mediaFilePath}/concatfullvideo.mov`));
            });
        }

        const concatAudio = () => {
            return new Promise((resolve, reject ) => {
                if(!fs.existsSync(`${mediaFilePath}/concatsound.mp3`)){
                    fs.rename(`${mediaFilePath}/concatvideo_audio.mp3`,
                        `${mediaFilePath}/concatfullaudio.mp3`,
                        (err) => {
                            if ( err ) console.log('ERROR: ' + err);
                        });
                    resolve();
                    return;
                }
                ffmpeg(`${mediaFilePath}/concatvideo_audio.mp3`)
                    .addInput(`${mediaFilePath}/concatsound.mp3`)
                    .mergeToFile(`${mediaFilePath}/concatfullaudio.mp3`, './tmp/')

                    .on('error', function(err) {
                        console.log('Error', err.message);
                        reject('error:', err);
                    })
                    .on('end', function() {
                        resolve();
                });
            });
        }

        const prepareCutVideoClips = () => {
            var terrestrial = EDL[0].terrestrial;
            for(var index = 0; index < terrestrial.length; index ++) {
                videoCutsHolder[index] = (index) =>  {
                    return new Promise((resolve, reject) => {
                        ffmpeg(`${mediaFilePath}/concatfullvideo.mov`)
                            .seekInput(terrestrial[index].startTime)
                            .duration(EDL[0].terrestrial[index].duration)
                            .fps(15)
                            .on('error', error => {
                                console.log('error', error)
                                reject((err) => console.log('error', err));
                            })
                            .on('end', () => {
                                resolve(`${mediaFilePath}/videocuts/videocut${index}.mov`);
                            })
                            .save(`${mediaFilePath}/videocuts/videocut${index}.mov`);
                    })
                }
            }
        }

        prepareCutVideoClips();

        const assembleVideoClips = (videoClips) => {
            var mergedMedia = ffmpeg();
            return new Promise((resolve, reject) => {
                for(var i = 0; i < videoClips.length; i++) {
                    mergedMedia = mergedMedia.addInput(videoClips[terrestrialMap[i]]);
                }

                mergedMedia.mergeToFile(`${mediaFilePath}/assembledfullvideo.mov`, './tmp/')
                    .fps(15)
                    .on('error', function(err) {
                        console.log('Error ' + err.message);
                        reject((err) => console.log('error', err));
                    })
                    .on('end', function() {
                        resolve(`${mediaFilePath}/assembledfullvideo.mov`);
                });

            })
        }

        const prepareCutAudioClips = () => {
            var heavenly = EDL[0].heavenly;
            for(var index = 0; index < heavenly.length; index ++) {
                audioCutsHolder[index] = (index) =>  {
                    return new Promise((resolve, reject) => {
                        ffmpeg(`${mediaFilePath}/concatfullaudio.mp3`)
                            .seekInput(heavenly[index].startTime)
                            .duration(EDL[0].heavenly[index].duration)
                            .on('error', error => {
                                console.log('error', error)
                                reject((err) => console.log('error', err));
                            })
                            .on('end', () => {
                                resolve(`${mediaFilePath}/audiocuts/audiocut${index}.mp3`);
                            })
                            .save(`${mediaFilePath}/audiocuts/audiocut${index}.mp3`);
                    })
                }
            }
        }

        prepareCutAudioClips();

        const assembleAudioClips = (audioClips) => {
            var mergedMedia = ffmpeg();
            return new Promise((resolve, reject) => {
                for(var i = 0; i < audioClips.length; i++) {
                    mergedMedia = mergedMedia.addInput(audioClips[heavenlyMap[i]]);
                }

                mergedMedia.mergeToFile(`${mediaFilePath}/assembledfullaudio.mp3`, './tmp/')
                    .fps(15)
                    .on('error', function(err) {
                        console.log('Error ' + err.message);
                        reject((err) => console.log('error', err));
                    })
                    .on('end', function() {
                        resolve(`${mediaFilePath}/assembledfullaudio.mp3`);
                });

            })
        }

        const assembleFinalVideo = () => {
          console.log('started assembling final video');
              return new Promise((resolve, reject) => {
                ffmpeg(`${mediaFilePath}/assembledfullvideo.mov`)
                .addInput(`${mediaFilePath}/assembledfullaudio.mp3`)
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
                            status: 'wait'
                        }));
                        return Promise.all(videoCutsHolder.map((cut, index) => cut(index)))
                    })
                    .then((result)=> assembleVideoClips(result))
                    .then(() => {
                        ws.send(JSON.stringify({
                            status: 'wait'
                        }));
                        return Promise.all(audioCutsHolder.map((cut, index) => cut(index)))
                    })
                    .then((result)=> assembleAudioClips(result))
                    .then(() => {
                        ws.send(JSON.stringify({
                            status: 'wait'
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
                resolve({EDL, mediaFilePath, emailInfo});
            })
            .catch((err) => {
                console.log('error: ', err);
                reject('error', err)
            });
    });
}

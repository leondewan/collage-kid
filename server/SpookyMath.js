module.exports = class SpookyMath {

    calculateEDL(EDLdata, startTime, duration) {
        const { mediaInfo, terrestrialArray, heavenlyArray } = EDLdata;
        this.rawClipTime = mediaInfo.rawClipTime;
        this.concatSoundsLength = mediaInfo.concatSoundsLength || 0;
        this.imagesNumber = mediaInfo.imageNames.length || 0;
        this.finalFilmTime = duration;
        this.terrestrialArray = terrestrialArray;
        this.heavenlyArray = heavenlyArray;
        this.protoEDLTerrestrial = [];
        this.protoEDLHeavenly = [];
        this.emergencyBreaker = 0;
        this.startTime = startTime;
        this.minVideoClipTime= 0.1;
        this.minAudioClipTime = 0.333;

        const tryProto = (arr) => {
            let targetArr=[];
            while(targetArr.length < 7 ){
                targetArr = this.calculateProtoEDL(arr, startTime);//Spookier math
                this.emergencyBreaker++;
                if(this.emergencyBreaker > 100) break;
            }
            return targetArr;
        }

        this.protoEDLTerrestrial = tryProto(this.terrestrialArray, this.protoEDLTerrestrial);


        this.protoEDLHeavenly = tryProto(this.heavenlyArray, this.protoEDLHeavenly);

        this.rawImageLengths = [];
        const  protoScaledClips =  this.protoScaleClips();
        const objectifiedProtos = this.objectifyProtos(protoScaledClips);
        const scaledClips = this.scaleClips(objectifiedProtos);
        return [scaledClips, this.rawImageLengths]
    }

    calcImageClipProportions(cutTemplate) {
        const midpoint = this.calcTotalTime(cutTemplate)/2;
        let progress = 0;
        let midIndex = 0;
        let evenClipsLeft = false;
        let imagesNumber = this.imagesNumber > cutTemplate.length ? cutTemplate.length: this.imagesNumber;
        for(var i=0; i < cutTemplate.length; i++) {
            progress += cutTemplate[i];
            if(progress >= midpoint) {
                midIndex = i;
                break;
            }
        }

        const midClip = cutTemplate[midIndex];
        const startClip = cutTemplate.slice(0, midIndex).reduce((acc, curr) => acc + curr);
        const endClip = startClip + midClip;

        if( endClip - midpoint >= midpoint - startClip){
            evenClipsLeft = true
        }

        const imageClipProportions = [];

        const startingIndex = (cutTemplate.length === imagesNumber) ? 0:
            evenClipsLeft ? Math.floor(cutTemplate.length/2) - Math.ceil(imagesNumber/2):
                Math.ceil(cutTemplate.length/2) - Math.floor(imagesNumber/2);

        for (var i=0; i < imagesNumber; i++) {
            imageClipProportions.push(cutTemplate[i + startingIndex ]);
        }

        return imageClipProportions;
    }


    maxImgClipScale (proportions) {
        const maxClipTime = (60/72)*3;
        const longestClip = Math.max(...proportions);
        return maxClipTime/longestClip;
    }

    maxTotalImgClipLength (proportions) {
        const currLength = this.calcTotalTime(proportions);
        const maxScale = this.maxImgClipScale(proportions);
        return currLength*maxScale;
    }

    calcTotalTime(arr) {
        if(!arr.length) {
            return 0;
        }

        var totTime  = arr.reduce((acc, curr) => acc + curr);
        return totTime;
    }

    calculateSoundsCuts(cutTemplate) {
        let soundsCuts= [];
        const midpoint = this.calcTotalTime(cutTemplate)/2;
        let progress = 0;
        let midIndex = 0;

        for(var i=0; i < cutTemplate.length; i++) {
            progress += cutTemplate[i];
            if(progress >= midpoint) {
                midIndex = i;
                break;
            }
        }

        if(this.concatSoundsLength <= cutTemplate[midIndex]) {
            return [this.concatSoundsLength];
        }
        let leftTime = cutTemplate[midIndex]/2;
        let leftIndex = 0;

        for(var i = (midIndex - 1); i > 0; i--) {
            leftTime += cutTemplate[i];
            if (leftTime > this.concatSoundsLength/2) {
                leftIndex = i;
                break;
            }
        }

        if(leftIndex + 1 == midIndex) {
            soundsCuts.push(this.concatSoundsLength/2);
        } else {
            soundsCuts.push(this.concatSoundsLength/2 -  (leftTime - cutTemplate[leftIndex]));
        }

        for(var i = leftIndex + 1; i <= midIndex; i++) {
            soundsCuts.push(cutTemplate[i]);
        }

        let rightTime = cutTemplate[midIndex]/2;
        let rightIndex = cutTemplate.length - 1;

        for(var i=midIndex + 1; i < cutTemplate.length; i++) {
            rightTime += cutTemplate[i];
            if (rightTime > this.concatSoundsLength/2) {
                rightIndex = i;
                break;
            }
        }

        for(var i = midIndex + 1; i < rightIndex; i++) {
            soundsCuts.push(cutTemplate[i]);
        }
        if(rightIndex - 1 === midIndex) {
            soundsCuts.push(this.concatSoundsLength/2);
        } else {
            soundsCuts.push(this.concatSoundsLength/2 - (rightTime - cutTemplate[rightIndex]));
        }
        return soundsCuts;
    }

    protoScaleClips () {
        const protoVidTime = this.calcTotalTime(this.protoEDLTerrestrial);
        const protoAudTime = this.calcTotalTime(this.protoEDLHeavenly);
        let protoScaledImages = [];
        let protoScaledVideo = [];

        const imgClipProportions = this.calcImageClipProportions (this.protoEDLHeavenly);
        // const minImgTime = this.minTotalImgClipLength(imgClipProportions);

        const imgTime = this.maxTotalImgClipLength(imgClipProportions);

        const calcProtoScaledVideo = () => {
            const imgScale = this.maxImgClipScale(imgClipProportions);
            protoScaledImages = imgClipProportions.map(clip => clip * imgScale);

            const vidScale = (this.rawClipTime)/protoVidTime;

            //clean up video edl
            protoScaledVideo = this.protoEDLTerrestrial.reduce((acc, clip) => {
                if(clip*this.finalFilmTime/(protoVidTime + imgTime) > this.minVideoClipTime) {
                    return [...acc, clip*vidScale];

                }
                return [...acc];
            }, []);
        }

        calcProtoScaledVideo();


        this.rawImageLengths = [...protoScaledImages];

        const protoSounds = this.calculateSoundsCuts(protoScaledVideo);

        const protoScaleAudio = () => {
            var protoSoundsTime = this.calcTotalTime(protoSounds);
            const audScale = (this.rawClipTime + this.concatSoundsLength)/(protoAudTime + protoSoundsTime);
            var protoScaledHeavenly = this.protoEDLHeavenly.map((clip) => clip*audScale);
            var protoScaledSounds = protoSounds.reduce((acc, clip) => {
                if(clip*this.finalFilmTime/(protoSoundsTime + protoAudTime) > this.minAudioClipTime) {
                    return [...acc, clip*audScale];
                }
                return [...acc];
            }, []);

            if(protoScaledSounds.length > 1) {
                return [...protoScaledHeavenly, ...protoScaledSounds];
            } else {
                return protoScaledHeavenly
            }
        }
        const protoScaledAudio = protoScaleAudio();

        var protoScaledVideoFinal = protoScaledImages.length ? [ ...protoScaledVideo, ...protoScaledImages]: protoScaledVideo;

        return {
            terrestrial: [ ...protoScaledVideoFinal],
            heavenly: [...protoScaledAudio]
        };
    }

    objectifyProtos(protos) {
        const terrProto = protos.terrestrial;
        const heavProto = protos.heavenly;

        var terrContainer = {};
        let heavContainer = {};

        terrContainer = terrProto.map((value, index ) => ({'clip': index, 'duration': value}));
        heavContainer = heavProto.map((value, index ) => ({'clip': index, 'duration': value}));

        const addStartTimes = (container) => {
            var startTime = 0;
            container = container.slice();
            for(var i=0; i< container.length; i++) {
                if(i) {
                    startTime += container[i-1].duration;
                }
                container[i].startTime = startTime;
            }
            return container;
        }

        addStartTimes(terrContainer);
        addStartTimes(heavContainer);

        var terrContainerMap = terrContainer.reduce((acc, curr) => [...acc, curr.duration.toFixed(2)], []);
        var heavContainerMap = heavContainer.reduce((acc, curr) => [...acc, curr.duration.toFixed(2)], []);

        const applyMapToContainer = (container, map) => {
            container = container.slice();
            if(map.length >= container.length) {
                var start = Math.floor((map.length - container.length)/2);
                for(var i=0; i < container.length; i++) {
                    container[i].sortBy = map[i + start];
                }
            } else {
                var containerStartLeft = Math.floor(container.length/2);
                var containerStartRight = Math.ceil(container.length/2);
                var mapStartLeft = Math.floor(map.length/2);
                var mapStartRight = Math.ceil(map.length/2);

                var mapIndex = mapStartLeft;
                for(var i=containerStartLeft; i >= 0; i--) {
                    if(map[mapIndex]) {
                        container[i].sortBy = map[mapIndex];
                    } else {
                        mapIndex = map.length - 1;
                        container[i].sortBy = map[mapIndex];
                    }
                    mapIndex--;
                }
                mapIndex = mapStartRight;
                for(var i=containerStartRight; i < container.length; i++) {
                    if(map[mapIndex]) {
                        container[i].sortBy = map[mapIndex];
                    } else {
                        mapIndex = 0;
                        container[i].sortBy = map[mapIndex];
                    }
                    mapIndex++;
                }
             }
            return container;
        }
        protos.terrestrial = applyMapToContainer(terrContainer, heavContainerMap);
        protos.heavenly = applyMapToContainer(heavContainer, terrContainerMap);


        return protos;
    }

    scaleClips(protos) {
        const scaledProtos = {};

        const scaleContainer = (container, scale) => {
            container = container.slice();
            for(let mediaClip of container) {
                mediaClip.startTime += mediaClip.duration * (1 - scale)/2;
                mediaClip.duration = mediaClip.duration * scale;
            }
            return container;
        }

        const terrestrialLength = protos.terrestrial.reduce((acc, cur) => (acc + cur.duration), 0);
        const heavenlyLength = protos.heavenly.reduce((acc, cur) => (acc + cur.duration), 0);

        const vidScale = this.finalFilmTime/terrestrialLength;
        const audScale = this.finalFilmTime/heavenlyLength;

        scaledProtos.terrestrial = scaleContainer([...protos.terrestrial], vidScale);
        scaledProtos.heavenly = scaleContainer([...protos.heavenly], audScale);

        return scaledProtos;
    }

    /*** SPOOKIER MATH ***/
    calculateProtoEDL(currentFacts){
        var signified = this.signifier(currentFacts);
        const protoEditArray = this.numerizor(signified);
        var breaker = 0;
        return protoEditArray;
    }

    numerizor(clueArray) {
        const permutedClueArrays= this.permuter(clueArray);
        var permutedClueNumbers = [];
        var convValue=0;
        for(var i = 0; i < permutedClueArrays.length; i++) {
            convValue=0;
            for(let j=permutedClueArrays[i].length -1; j>=0; j--) {
                convValue+= Math.pow((permutedClueArrays[i].length - j), 2)*permutedClueArrays[i][j];
            }
            permutedClueNumbers.push(convValue);
        }
        var permutedClueNumbersSet = new Set(permutedClueNumbers);
        let permutedClueNumbersArray = [...permutedClueNumbersSet];

        var ramp =(m, i) => (m - Math.abs(i % (2*m) - m))/m;

        var clueSetProduct = permutedClueNumbersArray.reduce((acc, curr) => acc * curr);
        var editNumber = Math.round((ramp(3.14159, clueSetProduct))*permutedClueNumbersArray.length);
        var firstHalfEditNumber = Math.floor(editNumber/2);
        var secondHalfEditNumber = Math.ceil(editNumber/2);
        const editArray = Math.floor(permutedClueNumbersArray.length)/2;
        const protoEditArray = permutedClueNumbersArray.slice(editArray - firstHalfEditNumber, editArray + secondHalfEditNumber);
        return protoEditArray;

    }

    signifier(clues){
        const date = new Date();
        const now = date.getTime();
        const elapsedHeartbeats = (now - this.startTime)/1000*72/60;

        const sinify = (val) => Math.round((Math.sin(val*elapsedHeartbeats) + 1)/2);
        const clueMap = (clues) =>  {
            return clues.map( clue => sinify(clue));
        }
        return clueMap(clues);

    }

    permuter (input){
    var permArr = [],
    usedChars = [];
        const permute = (input) => {
        var i, ch;
        for (i = 0; i < input.length; i++) {
            ch = input.splice(i, 1)[0];
            usedChars.push(ch);
            if (input.length == 0) {
            permArr.push(usedChars.slice());
            }
            permute(input);
            input.splice(i, 0, ch);
            usedChars.pop();
        }
        return permArr
        };
        return permute(input);
    }
}

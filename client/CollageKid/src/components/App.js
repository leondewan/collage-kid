
import React, { Component } from 'react';
import { View, AsyncStorage, Platform } from 'react-native';

import Gather from './Gather';
import Create from './Create';
import Watch from './Watch';
import Videocam from './Videocam';
import Camera from './Camera';
import SoundRecording from './SoundRecording';
import { styles } from './CollageStyles';

export default class App extends Component {
    state = {
        media: [],
        startTime: 0,
        minVideo: false,
        uploading: false,
        finalVideoURI: '',
        videoInfo: '',
        pageView: 'gather'
    };

    componentDidMount() {
        //this.host = '192.168.1.2:3001';
        this.host = 'collagekid.com/collageserver/';

        //this.httpProtocol = 'http://';
        this.httpProtocol = 'https://';

        //this.socketProtocol = 'ws://';
        this.socketProtocol = 'wss://';

        const createUID = () => ('' + 1e7+-1e3+-4e3+-8e3+-1e11)
        .replace(/1|0/g,
            () => (0 | Math.random() * 16).toString(16));

        AsyncStorage.getItem('uid').then(value => {
           if (!value) {
               const uid = createUID();
               console.log(uid);
               AsyncStorage.setItem('uid', uid);
               this.uid = uid;
           }
           this.uid = value;
       });
    }

    setMinVideo = (minVideo) => {
        this.setState({ minVideo });
    }

    setStartTime = (startTime) => {
        this.setState({ startTime });
    }

    setVideoURI = (finalVideoURI) => {
        this.setState({ finalVideoURI });
    }

    setMedia = (media) => {
        this.setState({ media });
    }

    loadMedia = (mediaItem, narration) => {
        if (!narration) {
            this.setState({ media: [...this.state.media, mediaItem] });
        }
        this.setState({ uploading: true });
        if (mediaItem.type === 'video') {
            if (!this.state.minVideo) {
                this.setState({ minVideo: true });
            }
        }
        console.log('setstate uploading true app.js');

        const data = new FormData();

        data.append('media', {
            name: mediaItem.fileName,
            uri: Platform.OS === 'android' ? mediaItem.uri : mediaItem.uri.replace('file://', '')
        });
        console.log('media object', data);
        const body = data;
        const headers = {
            mediatype: mediaItem.type,
            userid: this.uid,
            startTime: this.state.startTime
        };

        const fetchURL = `${this.httpProtocol}${this.host}/api/upload`;

        fetch(fetchURL, {
            method: 'POST',
            headers,
            body
        }).then(response => {
            this.setState({ uploading: false });
            console.log('upload response', response);
            if (!response.ok) {
                console.log('bad connection');
            }
        }).catch(error => {
            console.log('upload error', error);
        });
    }

    deleteMedia = (mediaItem) => {
        console.log('called delete media from App');

        const headers = {
            filename: mediaItem.fileName,
            mediatype: mediaItem.type,
            userid: this.uid,
            startTime: this.state.startTime
        };

        const fetchURL = `${this.httpProtocol}${this.host}/api/delete`;

        fetch(fetchURL, {
            method: 'GET',
            headers
        }).then(response => {
            console.log('delete response', response);
            if (!response.ok) {
                console.log('bad connection');
            }
        }).catch(error => {
            console.log('delete error', error);
        });
    }

    unloadMedia = () => {
        this.setState({ media: [] });
    }

    loadVideoInfo = (videoInfo) => {
        this.setState({ videoInfo });
    }

    switchPage = (page) => {
        this.setState({ pageView: page });
    }

    reset = () => {
        this.setState({ minVideo: false })
        this.unloadMedia();
    }

    navigate = (page) => {
        switch (page) {
            case 'gather':
                return (<Gather
                    switchPage={this.switchPage}
                    loadMedia={this.loadMedia}
                    startTime={this.state.startTime}
                    setStartTime={this.setStartTime}

                />);
            case 'create':
                    return (<Create
                        httpProtocol={this.httpProtocol}
                        socketProtocol={this.socketProtocol}
                        switchPage={this.switchPage}
                        media={this.state.media}
                        minVideo={this.state.minVideo}
                        setMedia={this.setMedia}
                        deleteMedia={this.deleteMedia}
                        reset={this.reset}
                        uid={this.uid}
                        uploading={this.state.uploading}
                        startTime={this.state.startTime}
                        host={this.host}
                        setVideoURI={this.setVideoURI}
                        setMinVideo={this.setMinVideo}
                    />);
            case 'watch':
                    return (<Watch
                        httpProtocol={this.httpProtocol}
                        socketProtocol={this.socketProtocol}
                        switchPage={this.switchPage}
                        loadMedia={this.loadMedia}
                        finalVideoURI={this.state.finalVideoURI}
                        startTime={this.state.startTime}
                        host={this.host}
                        uid={this.uid}
                        setVideoURI={this.setVideoURI}

                    />);

            case 'videocam' :
                return (<Videocam
                    loadMedia={this.loadMedia}
                    switchPage={this.switchPage}
                />);

            case 'camera' :
                return (<Camera
                    loadMedia={this.loadMedia}
                    switchPage={this.switchPage}
                />);

            case 'soundrecording':
                return (<SoundRecording
                    loadMedia={this.loadMedia}
                    switchPage={this.switchPage}
                />);

            default:
                return (<Gather
                    switchPage={this.switchPage}
                    loadMedia={this.loadMedia}
                    startTime={this.state.startTime}
                    setStartTime={this.setStartTime}

                />);
        }
    }

    displayContent = () => this.navigate(this.state.pageView);
    render() {
        return (
            <View style={styles.fullCenteredView}>
                {this.displayContent()}
            </View>
        );
   }
}

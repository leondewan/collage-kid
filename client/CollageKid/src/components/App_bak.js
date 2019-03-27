
import React, { Component } from 'react';
import { View, ActivityIndicator, ImageBackground, AsyncStorage, Platform } from 'react-native';
import firebase from 'firebase';

import Welcome from './Welcome';
import Video from './Video';
import Videocam from './Videocam';
import Camera from './Camera';
import CameraRollViewer from './CameraRollViewer';
import ImagesSounds from './ImagesSounds';
import SoundRecording from './SoundRecording';
import Finalize from './Finalize';
import Login from './Login';

import { firebaseAuth } from '../crypt';
import { styles } from './CollageStyles';

export default class App extends Component {
    state = {
        media: [],
        collageView: '',
        welcome: true,
        currVideoLength: 0,
        loggedIn: null,
        cycle: 1,
        startTime: 0,
        uploading: false
    };

    componentWillMount() {
        //const firebase = require('firebase');

        firebase.initializeApp({
            ...firebaseAuth
        });

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({ loggedIn: true });
                this.user = user;
            } else {
                this.setState({ loggedIn: false });
            }
          });
    }

    componentDidMount() {
        this.host = '192.168.1.3:3001';
        //this.host = 'collagekid.com/collageserver/'
        this.allowedCycles = 1;

        AsyncStorage.getItem('welcome').then(value => {
           if (value === 'true' || value === null) {
                AsyncStorage.setItem('welcome', 'false');
                this.switchPage('welcome');
           } else {
               this.switchPage('video');
           }
       });
    }

    setWelcome = (val) => {
        AsyncStorage.setItem('welcome', val);
    }

    setLogin = (loggedIn) => this.setState({ loggedIn });

    setStartTime = (startTime) => {
        this.setState({ startTime });
    }

    signOut = () => {
        this.reset();
        firebase.auth().signOut().then(() => {
            this.switchPage('welcome');
            this.setWelcome('true');
        });
    }

    incrementCycle = () => {
        this.setState({ cycle: this.state.cycle + 1 });
    }

    loadMedia = (mediaItem) => {
        this.setState({ media: [...this.state.media, mediaItem] });
        this.setState({ uploading: true });
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
            userid: this.user.uid,
            startTime: this.state.startTime
        };

        const fetchURL = `http://${this.host}/api/upload`;

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

    unloadMedia = () => {
        this.setState({ media: [] });
    }

    loadCurrVideoLength = (currVideoLength) => {
        this.setState({
            currVideoLength: this.state.currVideoLength + currVideoLength
        });
    }

    switchPage = (page) => {
        this.setState({ collageView: page });
    }

    reset = () => {
        this.setState({ currVideoLength: 0 });
        this.navigationHistory = [];
        this.setState({ cycle: 1 });
        this.unloadMedia();
    }

    navigate = (page) => {
        if (page !== 'welcome') {
            this.navigationHistory = [...this.navigationHistory || [], page];
        }

        switch (page) {
            case 'welcome':
                return <Welcome switchPage={this.switchPage} />;
            case 'video':
                return (<Video
                    loadMedia={this.loadMedia}
                    switchPage={this.switchPage}
                    navigationHistory={this.navigationHistory}
                    currVideoLength={this.state.currVideoLength}
                    setStartTime={this.setStartTime}
                    startTime={this.state.startTime}
                    signOut={this.signOut}
                />);
            case 'videocam' :
                return (<Videocam
                    loadMedia={this.loadMedia}
                    loadCurrVideoLength={this.loadCurrVideoLength}
                    currVideoLength={this.state.currVideoLength}
                    switchPage={this.switchPage}
                    setStartTime={this.setStartTime}
                    startTime={this.state.startTime}
                />);
            case 'imagessounds':
                return (<ImagesSounds
                    loadMedia={this.loadMedia}
                    switchPage={this.switchPage}
                    setSoundFileName={this.setSoundFileName}
                />);
            case 'camera':
                return (<Camera
                    loadMedia={this.loadMedia}
                    switchPage={this.switchPage}
                />);
            case 'camerarollviewer':
                    return (<CameraRollViewer
                        loadMedia={this.loadMedia}
                        switchPage={this.switchPage}
                    />);

            case 'soundrecording':
                return (<SoundRecording
                    loadMedia={this.loadMedia}
                    switchPage={this.switchPage}
                />);
            case 'finalize':
                return (<Finalize
                    media={this.state.media}
                    user={this.user}
                    reset={this.reset}
                    switchPage={this.switchPage}
                    startTime={this.state.startTime}
                    cycle={this.state.cycle}
                    incrementCycle={this.incrementCycle}
                    allowedCycles={this.allowedCycles}
                    setWelcome={this.setWelcome}
                    signOut={this.signOut}
                    uploading={this.state.uploading}
                    host={this.host}
                    loadMedia={this.loadMedia}
                />);
            default:
                return (<Video
                    loadMedia={this.loadMedia}
                    switchPage={this.switchPage}
                />);
        }
    }

    displayContent = () => {
        switch (this.state.loggedIn) {
            case true:
                return this.navigate(this.state.collageView);
            case false:
                return (<Login
                    setLogin={this.setLogin}
                    reset={this.reset}
                    initPage={this.state.collageView}
                />);
            default:
                return (
                <ImageBackground
                    style={{ width: '100%', height: '100%' }}
                    source={require('../img/collageart_splash4.jpg')}
                >
                    <View style={styles.fullCenteredView}>
                        <ActivityIndicator size='large' />
                    </View>
                </ImageBackground>
            );
        }
    }

    render() {
        return (
            <View style={styles.fullCenteredView}>
                {this.displayContent()}
            </View>
        );
   }
}


import React, { Component } from 'react';
import { View, ActivityIndicator, ImageBackground, AsyncStorage } from 'react-native';
import firebase from 'firebase';

import Welcome from './Welcome';
import Video from './Video';
import Videocam from './Videocam';
import Camera from './Camera';
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
        cycle: 1
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

    loadMedia = (mediaFile) => {
        this.setState({ media: [...this.state.media, mediaFile] });
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
                    signOut={this.signOut}
                />);
            case 'videocam' :
                return (<Videocam
                    loadMedia={this.loadMedia}
                    loadCurrVideoLength={this.loadCurrVideoLength}
                    currVideoLength={this.state.currVideoLength}
                    switchPage={this.switchPage}
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
                    cycle={this.state.cycle}
                    incrementCycle={this.incrementCycle}
                    allowedCycles={this.allowedCycles}
                    setWelcome={this.setWelcome}
                    signOut={this.signOut}
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

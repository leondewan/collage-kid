/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */
// weather api key: b64edf7210dba7a10e45835c89bc5b1c
//api.openweathermap.org/data/2.5/weather?q=NewYork
//https://api.darksky.net/forecast/614d1564e2234221557d2f47c650b73d/40.7127,-74.0059`

//40.7127,-74.0059


/*
navigator.geolocation.getCurrentPosition(
  position => {
    const location = JSON.stringify(position);

    this.setState({ location });
  },
  error => Alert.alert(error.message),
  { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
);
*/

//https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDhTcjZOZ4dKdmlPiVzQTC-6gbP7ucd7Ok&sensor=false&address=${encodeURIComponent(new york, ny)}`,

import React, {Component} from 'react';
import { View, ActivityIndicator, ImageBackground, Button } from 'react-native';
import firebase from 'firebase';
import Video from './Video';
import ImagesSounds from './ImagesSounds';
import SoundRecording from './SoundRecording';
import Finalize from './Finalize';
import Login from './Login';
import { styles } from './CollageStyles';

export default class App extends Component {
    state = {
        media: [],
        collageView: 'video',
        loggedIn: null
    };

    componentWillMount() {
        firebase.initializeApp({
            apiKey: "AIzaSyDlPZ-_nZVqjImbHYOjnuBp6cz82rZXoW8",
            authDomain: "collage-kid.firebaseapp.com",
            databaseURL: "https://collage-kid.firebaseio.com",
            projectId: "collage-kid",
            storageBucket: "collage-kid.appspot.com",
            messagingSenderId: "66649736149"
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
        this.startTime = Date.now();
    }
    
    loadMedia = (mediaFile) => {
        this.setState({media: [...this.state.media, mediaFile]})
    }
    
    switchPage = (page) => {
        console.log('switching page', page);
        this.setState({collageView: page})
    }

    navigate = (page) => {
        switch(page) {
            case 'video':
                return <Video loadMedia={this.loadMedia} 
                    switchPage={this.switchPage} />;
            case 'imagessounds':
                return <ImagesSounds loadMedia={this.loadMedia} 
                    switchPage={this.switchPage}
                    setSoundFileName={this.setSoundFileName} />;
                    
            case 'soundrecording':
                return <SoundRecording loadMedia={this.loadMedia} 
                    switchPage={this.switchPage} />;
            case  'finalize':
                return <Finalize media={this.state.media} 
                    user={this.user}
                    startTime={this.startTime} />;
            default: 
                return <Video loadMedia={this.loadMedia}  
                switchPage={this.switchPage} />;
        }
    }

    setLogin = (loggedIn) => this.setState({ loggedIn });

    displayContent = () => {
        switch(this.state.loggedIn) {
            case true:
                return this.navigate(this.state.collageView);
            case false:
                return  <Login setLogin={this.setLogin} />;
            default:
                return (
                <ImageBackground style={{width: '100%', height: '100%'}}
                    source={require('../img/collageart.png')}> 
                    <View style={styles.fullCenteredView}>
                        <ActivityIndicator size='large' />
                    </View>
                </ImageBackground> 
                ) 
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
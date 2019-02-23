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
import {Dimensions, Image, StatusBar, Text,  TouchableOpacity, View, Button} from 'react-native';

import CollageFadeTransition from './CollageFadeTransition';
import { styles } from './CollageStyles';
import ShootVideo from './ShootVideo';

// import TakePhoto from './TakePhoto'
// import RecordSound from './RecordSound';

export default class Video extends Component {
    state = { currVideoLength: 0 }

    loadCurrVideoLength = (currVideoLength) => {
        this.setState({currVideoLength: this.state.currVideoLength + currVideoLength});
    }

    videoLengthStatement = () => {
        console.log('statement:', this.state.currVideoLength)
        if(this.state.currVideoLength && this.state.currVideoLength <= 3){
            console.log('returning statemtent');
            return <Text style={{marginTop: 40, paddingLeft:40, paddingRight:40}}>You have captured under 3 minutes of video so far - you will need at least 3 minutes total in order to proceed.</Text>;
        } else {
            return null;
        }
    }

    proceed = () => {
    return this.state.currVideoLength > .01 ? (
            <Button onPress={() => this.props.switchPage('imagessounds')}
                title = "Next >>"
            />
        ): <View style={{height: 40, alignItems: 'center', justifyContent: 'center'}}><Text style={{color: '#fff', fontSize:18}}>Shoot time: {this.state.currVideoLength}</Text></View>
    }
    
    render() {
        return(
            
            <CollageFadeTransition style={{flex: 1}}>
                <View>
                    <StatusBar backgroundColor="blue" barStyle="light-content"/>
                </View>
                <View style={styles.header}>
                    <Image  
                        source={require('../img/collageart7.png')}
                        style={styles.headerImage}
                    />
                </View>
                <View style={styles.container}>
                    <View style={styles.instructionsContainer}>
                        <Text style={styles.instructions}>
                            Take this opportunity to document what you're thinking about and what is around you.
                        </Text>
                        {this.videoLengthStatement()}
                        </View>
                    <ShootVideo loadMedia={this.props.loadMedia}
                        loadCurrVideoLength={this.loadCurrVideoLength}/>
                        
                </View>
                {this.proceed()}
            </CollageFadeTransition>  
        );
   }
}

const win = Dimensions.get('window');




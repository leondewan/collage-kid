import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import SoundRecorder from 'react-native-sound-recorder';
import RNSoundLevel from 'react-native-sound-level'

import CollageFadeTransition from './CollageFadeTransition';
import { styles } from './CollageStyles';



export default class SoundRecording extends Component {
    state = { recording: false, soundLevel:0}

    handleRecordStart = () => {
        this.setState({recording: true})
        RNSoundLevel.start();
        RNSoundLevel.onNewFrame = (data) => {
            this.setState({soundLevel: (parseInt(data.value))+ 60 ? parseInt(data.value) + 60: 0});
            console.log('sound level state', this.state.soundLevel);
        }
        this.soundFileName = `sound_${Date.now()}.mp4`;
        SoundRecorder.start(`${SoundRecorder.PATH_CACHE}/${this.soundFileName}`);
    }
   
    handleRecordStop = () => {
        this.setState({recording: false})
        RNSoundLevel.stop();
        SoundRecorder.stop()
            .then((result) => {
                console.log('stopped recording: ', result);
                this.props.loadMedia({
                    uri: result.path,
                    fileName: this.soundFileName,
                    type: 'sound'
                }
            );
        });
    }

    handleRecordClose = () => {
        if(this.state.recording) {
            this.setState({recording: false})
            RNSoundLevel.stop();
            SoundRecorder.stop()
                .then((result) => {
                    console.log('stopped recording: ', result);
                    this.props.loadMedia({
                        uri: result.path,
                        fileName: this.soundFileName,
                        type: 'sound'
                    });
                    this.props.switchPage('imagessounds');
            });
        } else {
            this.props.switchPage('imagessounds');
        }
        

    }

    render() {
        return (
            <CollageFadeTransition style={{flex: 1}}>
                <View>
                    <StatusBar backgroundColor="blue" barStyle="light-content" />
                </View>
                
                <View style={styles.container}>
                    <View style={{flex: 1, paddingTop:80, justifyContent: 'center', alignItems: 'center'}}>
                        <View style={{ height: 25, 
                            width: this.state.soundLevel, 
                            backgroundColor: '#fdc',
                            borderWidth: 2,
                            borderColor: '#0f0' }} />
                    </View>
                    {this.state.recording ? 
                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={this.handleRecordStop}>
                            <Text style={styles.buttonText}>Stop Recording</Text>
                        </ TouchableOpacity>: 
                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={this.handleRecordStart}>
                            <Text style={styles.buttonText}>Record</Text>
                        </ TouchableOpacity> }   
                        <TouchableOpacity
                            style={styles.button}
                            onPress={this.handleRecordClose}>
                            <Text style={styles.buttonText}>Close</Text>
                         </TouchableOpacity>
                </View>
            </CollageFadeTransition>
        );
    }
}
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import SoundRecorder from 'react-native-sound-recorder';
import RNSoundLevel from 'react-native-sound-level';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';


import CollageFadeTransition from './CollageFadeTransition';
import { styles } from './CollageStyles';
import { convertToHMS } from '../utils/math';

const RNFS = require('react-native-fs');

export default class SoundRecording extends Component {
    state = { recording: false, soundLevel: 0, runtime: 0 }

    componentDidMount() {
        RNFS.mkdir(`${RNFS.CachesDirectoryPath}/SoundRecorder`, {
            NSURLIsExcludedFromBackupKey: true
        });
    }

    runTimer = (run) => {
        let counter = this.state.runtime;
        if (run) {
            this.timer = setInterval(() => {
                this.setState({ runtime: counter });
                counter++;
            }, 1000);
        } else clearInterval(this.timer);
    }

    handleRecordStart = () => {
        this.setState({ recording: true });
        this.runTimer(true);
        // RNSoundLevel.start();
        // RNSoundLevel.onNewFrame = (data) => {
        //     this.setState({ soundLevel: (parseInt(data.value)) + 60 > 0
        //         ? parseInt(data.value) + 60 : 2 });
        // };
        this.soundFileName = `sound_${Date.now()}.mp4`;
        SoundRecorder.start(`${SoundRecorder.PATH_CACHE}/SoundRecorder/${this.soundFileName}`);
    }

    handleRecordStop = () => {
        this.setState({ recording: false });
        //RNSoundLevel.stop();
        SoundRecorder.stop()
            .then((result) => {
                this.runTimer(false);
                this.setState({ soundLevel: 0 });
                this.props.loadMedia({
                    uri: result.path,
                    fileName: this.soundFileName,
                    type: 'sound'
                }
            );
        });
    }

    renderRecordingButtons = () => {
        if (this.state.recording) {
            return (
                <TouchableOpacity
                    onPress={this.handleRecordStop}
                    style={{ ...styles.utilButton, backgroundColor: '#ff4e00' }}
                >
                    <Text style={{ ...styles.buttonText, fontSize: 14 }}> Stop Recording </Text>
                </TouchableOpacity>
            );
        }
            return (
                <TouchableOpacity onPress={this.handleRecordStart} style={styles.utilButton}>
                    <Text style={{ ...styles.buttonText, fontSize: 14 }}> Record Sounds </Text>
                </TouchableOpacity>
            );
    }

    render() {
        return (
            <CollageFadeTransition
                style={{ flex: 1 }}
            >
                <View style={{ ...styles.utilContainer }}>
                    <View>
                        <StatusBar hidden />
                    </View>
                    <View
                        style={{
                            height: 30,
                            alignItems: 'center',
                            alignSelf: 'stretch',
                            justifyContent: 'center'
                        }}
                    >
                        <Text
                            style={{ ...styles.instructions, fontSize: 16 }}
                        >{convertToHMS(this.state.runtime)}</Text>
                    </View>
                    <View style={styles.utilContainer}>

                        <View
                            style={{
                                flex: 1,
                                paddingTop: 80,
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'stretch'
                            }}
                        >

                            <LinearGradient
                                style={{
                                    height: 40,
                                    width: (this.state.soundLevel * 5) + 10,
                                    borderRadius: 3,
                                    borderWidth: 3,
                                    borderColor: '#054783'
                                }}
                                colors={['#01305b', '#00fafd', '#00fafd', '#00fafd', '#01305b']}
                                stops={[0.01, 1, 1, 1, 0.01]}
                            />
                        </View>

                        <View
                            style={{
                                flex: 0,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >

                            <TouchableOpacity
                                style={this.state.recording
                                ? { ...styles.utilButton, width: 50, borderColor: '#333' }
                                : { ...styles.utilButton, width: 50 }}
                                onPress={() => this.props.switchPage('imagessounds')}
                                disabled={this.state.recording}
                            >
                                <Icon
                                    name="chevron-left"
                                    size={20}
                                    color={this.state.recording ? '#333' : '#f2fffc'}
                                />

                             </TouchableOpacity>

                            {this.renderRecordingButtons()}

                            <TouchableOpacity
                                style={this.state.recording
                                ? { ...styles.utilButton, width: 50, borderColor: '#333' }
                                : { ...styles.utilButton, width: 50 }}
                                onPress={() => this.props.switchPage('finalize')}
                                disabled={this.state.recording}
                            >
                                <Icon
                                    name="chevron-right"
                                    size={20}
                                    color={this.state.recording ? '#333' : '#f2fffc'}
                                />
                             </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </CollageFadeTransition>
        );
    }
}

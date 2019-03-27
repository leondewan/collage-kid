import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import SoundRecorder from 'react-native-sound-recorder';
import RNSoundLevel from 'react-native-sound-level';
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
        RNSoundLevel.start();
        RNSoundLevel.onNewFrame = (data) => {
            this.setState({ soundLevel: (parseInt(data.value)) + 60 > 0
                ? parseInt(data.value) + 60 : 2 });
        };
        this.soundFileName = `sound_${Date.now()}.mp4`;
        SoundRecorder.start(`${SoundRecorder.PATH_CACHE}/SoundRecorder/${this.soundFileName}`);
    }

    handleRecordStop = () => {
        this.setState({ recording: false });
        RNSoundLevel.stop();
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
        return (
            <TouchableOpacity
                onPress={this.state.recording ? this.handleRecordStop : this.handleRecordStart}
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    borderColor: '#fff',
                    borderWidth: 5,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <View
                    style={this.state.recording
                        ? {
                            width: 30,
                            height: 30,
                            borderRadius: 5,
                            backgroundColor: '#f53333'
                        }
                        : {
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            backgroundColor: '#f53333'
                        }
                }
                />
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <CollageFadeTransition
                style={{ flex: 1, alignSelf: 'stretch' }}
            >
                <View style={styles.utilContainer}>
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
                                alignSelf: 'stretch',
                                alignItems: 'center',
                                paddingLeft: 25,
                                paddingRight: 25,
                                paddingTop: 20,
                                paddingBottom: 20
                            }}
                        >
                            <View style={{ width: 80 }} />

                            {this.renderRecordingButtons()}

                            <TouchableOpacity
                                onPress={() => this.props.switchPage('gather')}
                                disabled={this.state.recording}
                                style={{ marginTop: 15, width: 80, alignItems: 'flex-end' }}
                            >
                                <Text
                                    style={this.state.recording ?
                                        { color: '#333', fontSize: 18 }
                                        : { color: '#f2fffc', fontSize: 18 }
                                    }
                                >Done</Text>
                             </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </CollageFadeTransition>
        );
    }
}

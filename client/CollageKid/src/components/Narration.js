import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import SoundRecorder from 'react-native-sound-recorder';
import RNSoundLevel from 'react-native-sound-level';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';

import { styles } from './CollageStyles';

const RNFS = require('react-native-fs');

export default class Narration extends Component {
    state = { recording: false,
        soundLevel: 0,
        runtime: 0,
        paused: true,
        allowUse: false,
        allowAdd: false,
        adding: false,
        narrateProgress: 0,
        errorCount: 0
    }

    componentDidMount() {
        RNFS.mkdir(`${RNFS.CachesDirectoryPath}/SoundRecorder`, {
            NSURLIsExcludedFromBackupKey: true
        });
    }

    onProgress = (progress) => {
        this.setState({ narrateProgress: progress.currentTime / progress.seekableDuration });
        if (progress.seekableDuration - progress.currentTime <= 0.25) {
            this.stopNarrate();
            this.setState({ narrateProgress: 0 });
        }
    }

    startNarrate = () => {
        this.handleRecordStart();
        setTimeout(() => this.setState({ paused: false }), 100);
    }

    stopNarrate = () => {
        this.setState({ paused: true });
        setTimeout(() => this.handleRecordStop(), 100);
    }

    handleRecordStart = () => {
        this.setState({ recording: true });
        RNSoundLevel.start();
        RNSoundLevel.onNewFrame = (data) => {
            this.setState({ soundLevel: (parseInt(data.value)) + 60 > 0
                ? parseInt(data.value) + 60 : 2 });
        };
        this.soundFileName = `narration_${Date.now()}.mp4`;
        SoundRecorder.start(`${SoundRecorder.PATH_CACHE}/SoundRecorder/${this.soundFileName}`);
    }

    handleRecordStop = () => {
        console.log('called handle record stop');
        this.setState({ recording: false });
        RNSoundLevel.stop();
        SoundRecorder.stop()
            .then((result) => {
                console.log('result', result);
                this.setState({ soundLevel: 0 });
                this.narration = {
                    uri: result.path,
                    fileName: this.soundFileName,
                    type: 'narration'
                };
                this.props.loadMedia(this.narration, true);
                if (!this.state.allowAdd) {
                    this.setState({ allowAdd: true });
                }
        });
    }

    addNarration = () => {
        this.setState({ adding: true });
        const url = `${this.props.socketProtocol}${this.props.host}`;
        const message = {
            type: 'narrate',
            headers: {
                host: this.props.host,
                userid: this.props.uid,
                starttime: this.props.startTime
            }
        };

        const ws = new WebSocket(url);

        ws.onopen = () => {
            ws.send(JSON.stringify(message));
        };

        ws.onmessage = (msg) => {
            const narratorMessage = JSON.parse(msg.data);
            switch (narratorMessage.status) {
                case 'wait':
                    this.setState({ adding: true });
                    console.log('waiting');
                    break;

                case 'error':
                    console.log('adding error');
                    this.setState({ progress: 0 });
                    this.setState({ errorCount: this.state.errorCount + 1 });
                    if (this.state.errorCount < 3) {
                        ws.send(JSON.stringify(message));
                    }
                    break;

                case 'narrated':
                    console.log('narration ready');
                    ws.close();
                    this.props.setVideoURI(`${this.props.httpProtocol}${narratorMessage.url}`);
                    this.setState({ adding: false });
                    this.props.toggleNarrate();
                    break;

                default:
                    console.log('unknown editor message');
            }
        };

        ws.onerror = (e) => {
          console.log(e.message);
        };

        ws.onclose = (e) => {
          console.log('closed socket', e.code, e.reason);
        };
    }

    renderRecordingButtons = () => {
        return (
            <TouchableOpacity
                onPress={this.state.recording ? this.stopNarrate : this.startNarrate}
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderColor: '#fff',
                    borderWidth: 3,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <View
                    style={this.state.recording
                        ? {
                            width: 22,
                            height: 22,
                            borderRadius: 3,
                            backgroundColor: '#f53333'
                        }
                        : {
                            width: 37,
                            height: 37,
                            borderRadius: 18,
                            backgroundColor: '#f53333'
                        }
                }
                />
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <View
                style={{
                    ...styles.utilContainer,
                    alignItems: 'center',
                    alignSelf: 'stretch' }}

            >
                <View style={{ width: 310, height: 25, justifyContent: 'flex-end' }}>
                    <View
                        style={{ width: 310 * this.state.narrateProgress,
                            height: 5,
                            backgroundColor: '#f53333' }}
                    />
                </View>
                <Video
                    source={{ uri: this.props.finalVideoURI }}
                    ref={(ref) => {
                     this.player = ref;
                    }}
                    controls={false}
                    paused={this.state.paused}
                    onEnd={this.onEnd}
                    onProgress={this.onProgress}
                    style={{
                        flex: 1,
                        alignSelf: 'stretch',
                        alignItems: 'center' }}
                />
                    <View
                        style={{ ...styles.utilContainer,
                             flex: 0.25,
                             alignItems:
                             'center' }}
                    >
                        <View
                            style={{
                                flex: 1,
                                paddingTop: 10,
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'stretch'
                            }}
                        >
                            <LinearGradient
                                style={{
                                    height: 20,
                                    width: (this.state.soundLevel * 5) + 10,
                                    borderRadius: 3,
                                    borderWidth: 2,
                                    borderColor: '#054783'
                                }}
                                colors={['#01305b', '#00fafd', '#00fafd', '#00fafd', '#01305b']}
                                stops={[0.01, 1, 1, 1, 0.01]}
                            />
                            <View
                                style={{ flexDirection: 'row',
                                    height: 60,
                                    marginTop: 15,
                                    marginBottom: 15,
                                    flex: 1,
                                    alignItems: 'center',
                                    width: 315,
                                    justifyContent: 'space-between' }}
                            >
                                <View style={{ width: 80 }} />

                                {this.state.adding
                                    ? <ActivityIndicator />
                                    : this.renderRecordingButtons()}
                                <TouchableOpacity
                                    onPress={this.addNarration}
                                    disabled={!this.state.allowAdd || this.state.adding}
                                    style={{ width: 80, alignItems: 'flex-end' }}
                                >
                                    <Text
                                        style={this.state.allowAdd && !this.state.adding
                                        ? { ...styles.navText, fontSize: 16 }
                                        : { ...styles.navText, fontSize: 16, color: '#333' }}
                                    >Done</Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </View>
                </View>
        );
    }
}

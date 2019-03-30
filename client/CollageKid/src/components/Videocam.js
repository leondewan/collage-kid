import React, { Component } from 'react';
import { Text, TouchableOpacity, View, Dimensions, StatusBar } from 'react-native';
import { RNCamera } from 'react-native-camera';
import RNThumbnail from 'react-native-thumbnail';
import Icon from 'react-native-vector-icons/FontAwesome';

import { styles } from './CollageStyles';
import CollageFadeTransition from './CollageFadeTransition';
import { convertToHMS } from '../utils/math';

class Videocam extends Component {
    state = {
        recording: false,
        back: true,
        runtime: 0 }

    componentWillMount() {
        this.maxVideoLength = 360;
    }


    runTimer = (run) => {
        let counter = this.state.runtime;
        if (run) {
            this.timer = setInterval(() => {
                this.setState({ runtime: counter });
                counter++;
                if (counter > this.maxVideoLength) {
                    this.stopRecord();
                    this.setState({ maxTime: true });
                    this.setState({ recording: false });
                }
            }, 1000);
        } else {
            clearInterval(this.timer);
        }
    }

    recordVideo = async () => {
        if (this.camera) {
            this.setState({ recording: true });
            this.runTimer(true);
            const options = {
                quality: RNCamera.Constants.VideoQuality['4x3'],
                mirrorVideo: false,
                forceUpOrientation: true
            };
            const data = await this.camera.recordAsync(options);
            this.setState({ recording: false });

            RNThumbnail.get(data.uri)
                .then(result => {
                    console.log('thumb path', result.path);
                    return { data, result };
                })
                .then(res => {
                    console.log('media capture', data);

                    const path = res.data.uri.replace('file://', '');
                    const fileNameIndex = path.lastIndexOf('/') + 1;
                    const fileName = path.substr(fileNameIndex);

                    this.props.loadMedia({
                        uri: path,
                        fileName,
                        thumb: res.result.path,
                        type: 'video'
                      }
                    );
                    return data;
                })
                .catch(err => console.log('thumb error', err));
        }
    };

    stopRecord = () => {
        if (this.camera) {
            this.camera.stopRecording();
            this.runTimer(false);
      }
    }

    done = () => {
        if (this.state.recording) {
            this.stopRecord();
        }
        this.props.switchPage('gather');
    }

    renderRecordingButtons = () => {
        return (
            <TouchableOpacity
                onPress={this.state.recording ? this.stopRecord : this.recordVideo}
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
            <CollageFadeTransition>
                <View style={styles.utilContainer}>
                    <View>
                        <StatusBar hidden />
                    </View>

                    <RNCamera
                            ref={ref => {
                            this.camera = ref;
                        }}
                        style={{ ...styles.utilContainer, width: win.width }}
                    />

                    <View
                        style={{
                            height: 30,
                            width: win.width,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#000',
                            position: 'absolute',
                            top: 0,
                            opacity: 0.7
                        }}
                    >
                        <Text
                            style={{ ...styles.instructions, fontSize: 16, textAlign: 'center' }}
                        >{this.state.maxTime
                            ? 'Video limit reached'
                            : convertToHMS(this.state.runtime)}</Text>
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
            </CollageFadeTransition>
        );
      }
}
const win = Dimensions.get('window');

export default Videocam;

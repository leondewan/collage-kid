import React, { Component } from 'react';
import { Text, TouchableOpacity, View, Dimensions, StatusBar, Platform } from 'react-native';
import { RNCamera } from 'react-native-camera';
import MediaMeta from 'react-native-media-meta';
import Icon from 'react-native-vector-icons/FontAwesome';

import { styles } from './CollageStyles';
import CollageFadeTransition from './CollageFadeTransition';
import { convertToHMS } from '../utils/math';

class Videocam extends Component {
    state = {
        recording: false,
        back: true,
        currVideoLength: this.props.currVideoLength || 0,
        runtime: Math.floor(this.props.currVideoLength) || 0,
        maxTime: false }

    componentWillMount() {
        this.minVideoLength = 3;
        this.maxVideoLength = 360;
        if (this.props.currVideoLength >= this.maxVideoLength) {
            this.setState({ maxTime: true });
        }
    }
    componentDidUpdate(oldProps) {
        const newProps = this.props;
        if (oldProps.currVideoLength !== newProps.currVideoLength) {
            this.loadCurrVideoLength(newProps.currVideoLength);
        }
    }

    loadCurrVideoLength = (currVideoLength) => {
        this.setState({
            currVideoLength
        });
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
            const path = Platform.OS === 'android' ? data.uri.replace('file://', '') : data.uri.replace('file://', '');
            const fileNameIndex = path.lastIndexOf('/') + 1;
            const fileName = path.substr(fileNameIndex);

            MediaMeta.get(path)
                .then(metadata => {
                    this.props.loadCurrVideoLength(metadata.duration / 1000);
                    this.setState({ recording: false });
                })
                .catch(err => console.error(err));

            this.props.loadMedia({
                uri: data.uri,
                fileName,
                type: 'video'
              }
            );
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
        this.props.switchPage('video');
    }

    renderRecordingButtons = () => {
        if (this.state.recording) {
            return (
                <TouchableOpacity
                    onPress={this.stopRecord}
                    style={{ ...styles.utilButton, backgroundColor: '#ff4e00' }}
                >
                    <Text style={{ ...styles.buttonText, fontSize: 14 }}> Stop Recording </Text>
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity
                onPress={this.recordVideo}
                style={this.state.maxTime
                    ? { ...styles.utilButton, borderColor: '#333' }
                    : styles.utilButton}
                    disabled={this.state.maxTime}
            >
                <Text
                    style={this.state.maxTime
                        ? { ...styles.buttonText, fontSize: 14, color: '#333' }
                        : { ...styles.buttonText, fontSize: 14 }}

                > Record Video </Text>
            </TouchableOpacity>
        );
    }


    render() {
      return (
            <CollageFadeTransition style={{ flex: 1 }}>
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
                            style={{ ...styles.instructions, fontSize: 16 }}
                        >{this.state.maxTime
                            ? 'Video limit reached'
                            : convertToHMS(this.state.runtime)}</Text>
                    </View>

                    <View
                        style={{
                            flex: 0,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center' }}
                    >
                        <TouchableOpacity
                            onPress={this.done} style={this.state.recording ||
                                this.state.currVideoLength <= this.minVideoLength
                            ? { ...styles.utilButton, width: 50, borderColor: '#333' }
                            : { ...styles.utilButton, width: 50 }}
                            disabled={this.state.recording ||
                                this.state.currVideoLength <= this.minVideoLength}
                        >
                            <Icon
                                name="chevron-left"
                                size={20}
                                color={this.state.recording ||
                                    this.state.currVideoLength <= this.minVideoLength
                                    ? '#333' : '#f2fffc'}
                            />
                        </TouchableOpacity>

                        {this.renderRecordingButtons()}

                        <TouchableOpacity
                            onPress={() => this.props.switchPage('imagessounds')}
                            style={this.state.recording ||
                                this.state.currVideoLength <= this.minVideoLength
                                ? { ...styles.utilButton, width: 50, borderColor: '#333' }
                                : { ...styles.utilButton, width: 50 }}
                            disabled={this.state.recording ||
                                this.state.currVideoLength <= this.minVideoLength}
                        >
                            <Icon
                                name="chevron-right"
                                size={20}
                                color={this.state.recording ||
                                    this.state.currVideoLength <= this.minVideoLength
                                ? '#333' : '#f2fffc'}
                            />
                        </TouchableOpacity>

                    </View>

                </View>
            </CollageFadeTransition>
        );
      }
}
const win = Dimensions.get('window');

export default Videocam;

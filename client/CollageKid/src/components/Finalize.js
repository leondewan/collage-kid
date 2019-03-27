import React, { Component, Fragment } from 'react';
import {
    ActivityIndicator,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    PixelRatio,
    Share
} from 'react-native';
import Slider from 'react-native-slider';
import RadialGradient from 'react-native-radial-gradient';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import RNFetchBlob from 'rn-fetch-blob';

import CollageFadeTransition from './CollageFadeTransition';
import Header from './Header';
import { styles } from './CollageStyles';
import { convertToHMS } from '../utils/math';

const RNFS = require('react-native-fs');

export default class Finalize extends Component {

    state = {
        latitude: null,
        longitude: null,
        duration: 90,
        finalizing: false,
        done: false,
        hasError: false,
        cycle: this.props.cycle,
        videoPlayer: false,
        uploading: false,
        progress: 0
    };

    componentDidMount() {
        this.empireState = false;
        navigator.geolocation.getCurrentPosition((result) => {
            const { latitude, longitude } = result.coords;
            this.setState({ latitude, longitude });
        },
        () => {
            this.setState({ latitude: 40.7484405, longitude: -73.9878531 });
            this.empireState = true;
        });
        this.email = this.props.user.email;
        this.userId = this.props.user.uid;
        this.state.uploading = this.props.uploading;
    }


    componentDidUpdate(oldProps) {
        const newProps = this.props;
        if (oldProps.cycle !== newProps.cycle) {
            this.loadCycle(newProps.cycle);
        }
        if (oldProps.uploading !== newProps.uploading) {
            console.log('setting upload from finalize');
            this.setUploading(newProps.uploading);
        }
     }

    setUploading = (uploading) => {
        this.setState({ uploading });
    }

    componentDidCatch() {
        this.setState({ hasError: true });
        this.setState({ finalizing: false });
    }

    loadCycle = (cycle) => {
      this.setState({
          cycle
      });
    }


    finalizePiece = () => {
        if (this.state.hasError) {
            this.setState({ hasError: false });
        }

        const url = `ws://${this.props.host}`;
        const message = {
            type: 'edit',
            headers: {
                host: this.props.host,
                userid: this.userId,
                email: this.email,
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                starttime: this.props.startTime,
                duration: this.state.duration,
                empirestate: this.empireState
            }
        };

        const ws = new WebSocket(url);

        ws.onopen = () => {
            ws.send(JSON.stringify(message));
        };

        ws.onmessage = (msg) => {
            const editorMessage = JSON.parse(msg.data);
            if (editorMessage.status === 'wait') {
                this.setState({ finalizing: true });
                this.setState({ progress: this.state.progress + 10 });
                console.log('waiting', this.state.progress);
            } else {
                console.log('open video player');
                ws.close();
                this.videoURI = `http://${editorMessage.url}`;
                console.log('video uri', this.videoURI);
                this.setState({ finalizing: false });
                this.setState({ videoPlayer: true });
            }
        };

        ws.onerror = (e) => {
            // an error occurred
          console.log(e.message);
        };

        ws.onclose = (e) => {
          console.log(e.code, e.reason);
        };
    }

    handleRepeat = () => {
        this.props.reset();
        this.props.switchPage('video');
    }

    shareFinalVideo = () => {
        RNFetchBlob
        .config({
            fileCache: true,
            appendExt: 'mp4'
        })
        .fetch('GET', this.videoURI)
        .then((res) => {
            console.log('blob result', res);
            Share.share({
                title: 'My experimental film',
                message: 'with help from Collage Kid',
                url: `file://${res.path()}`,
                type: 'video/mp4',
                subject: 'My experimental film'
          });
      });
    }

    uploadFinalVideo = () => {
        RNFetchBlob
        .config({
            fileCache: true,
            appendExt: 'mp4'
        })
        .fetch('GET', this.videoURI)
        .then((res) => {
            this.props.loadMedia({
                uri: res.path(),
                fileName: 'finalvideo.mp4',
                type: 'video'
            });
        });
    }

    closeFinalVideo = () => {
        this.setState({ videoPlayer: false });
    }

    render() {
        return (
                <CollageFadeTransition style={{ flex: 1 }}>
                    <Header />
                    { this.state.videoPlayer ?
                    (<Video
                        source={{ uri: this.videoURI }}
                        ref={(ref) => {
                         this.player = ref;
                        }}

                        controls
                        paused
                        style={{
                            flex: 1,
                            alignSelf: 'stretch',
                            width: win.width }}
                    />)
                    : (<RadialGradient
                        style={{ flex: 1, alignSelf: 'stretch' }}
                        colors={['#01305b', '#000']}
                        stops={[0.3, 1]}
                        radius={win.width}
                    >
                        <View
                            style={{
                                ...styles.container,
                                 justifyContent: 'space-between'
                             }}
                        >
                        {this.state.finalizing
                            ? (<View style={{ height: 100, width: 300, justifyContent: 'center' }} >
                                    <Text style={styles.instructions} >
                                        Progress bar
                                    </Text>
                                    <View style={{ width: 300, height: 46 }} >
                                        <LinearGradient
                                            style={{
                                                height: 40,
                                                width: this.state.progress * 3,
                                                borderRadius: 3,
                                                borderWidth: 3,
                                                borderColor: '#054783'
                                            }}
                                            colors={[
                                                '#01305b',
                                                '#00fafd',
                                                '#00fafd',
                                                '#00fafd',
                                                '#01305b'
                                            ]}
                                            stops={[0.01, 1, 1, 1, 0.01]}
                                        />
                                    </View >
                                </View >

                            )

                            : (<Fragment><View
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    alignSelf: 'stretch'

                                }}
                            >
                                <Text
                                    style={{
                                    ...styles.instructions,
                                    fontWeight: 'bold',
                                    paddingTop: 30

                                 }}
                                >
                                    Set Duration
                                </Text>
                                <Slider
                                    minimumValue={30}
                                    maximumValue={180}
                                    step={5}
                                    value={this.state.duration}
                                    minimumTrackTintColor='#00427e'
                                    maximumTrackTintColor='#011222'
                                    onValueChange={duration => this.setState({ duration })}
                                    trackStyle={{ height: 20,
                                        borderRadius: 5,
                                        borderWidth: 1,
                                        borderColor: '#00519b' }}
                                    thumbStyle={{ height: 40,
                                        width: 18,
                                        borderRadius: 3,
                                        backgroundColor: '#0085ff',
                                        borderWidth: 4,
                                        borderColor: '#00519b' }}
                                    style={{ width: 300, marginTop: 20, marginBottom: 20 }}
                                />
                                <View style={{ paddingBottom: 20 }}>
                                    <Text style={{ ...styles.instructions, fontSize: 16 }}>
                                        {`[ ${convertToHMS(this.state.duration)} ]`}
                                    </Text>
                                </View>

                                <Text
                                    style={screenHeight < 1334
                                        ? { ...styles.instructions,
                                    fontSize: 18 }
                                        : { ...styles.instructions,
                                            paddingTop: 30 }}
                                >Choosing a short duration
                                    will return mostly quick cuts; longer values will
                                    yield more gentle, atmospheric results.
                                </Text>
                                <View
                                    style={{ height: 100,
                                        alignSelf: 'stretch',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {this.state.uploading
                                        ? <View
                                        style={{
                                            flex: 1,
                                            alignItems: 'center'
                                        }}
                                        >
                                            <Text
                                                style={{ ...styles.instructions,
                                                    fontSize: 12,
                                                    paddingBottom: 10
                                                }}
                                            >Uploading media...
                                            </Text>
                                            <ActivityIndicator style={{ marginBottom: 10 }} />
                                        </View>
                                        : null}
                                    {this.state.hasError
                                        ? <Text
                                            style={{ ...styles.instructions,
                                                fontSize: 14
                                            }}
                                        >Please try again shortly.
                                        </Text>
                                        : null}
                                </View>

                            </View>

                            <View
                                style={{
                                    alignSelf: 'stretch',
                                    alignItems: 'center',
                                    height: 100,
                                    justifyContent: 'center'
                                }}
                            >
                            {!this.state.done ? (
                                <LinearGradient
                                    colors={this.state.uploading
                                        ? ['#3b5998', '#01305b', '#3b5998']
                                        : ['#4167db', '#3b5998', '#01305b']}
                                    style={{
                                        borderRadius: 5,
                                        borderColor: '#01305b',
                                        borderWidth: 2,
                                        marginTop: 20,
                                        width: 200,
                                        height: 50
                                    }}
                                >
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={this.finalizePiece}
                                        disabled={(this.state.done ||
                                            this.state.uploading)}
                                    >
                                        <Text
                                            style={this.state.uploading
                                                ? { ...styles.buttonText, color: '#4167db' }
                                                : styles.buttonText}
                                        >
                                            Finalize Piece
                                        </Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            ) : (<Text
                                style={screenHeight < 1334
                                    ? { ...styles.instructions, fontSize: 14 }
                                    : { ...styles.instructions, fontSize: 16 }}
                            >
                                    A link to your work will be delivered
                                    by email within 3 minutes.
                                </Text>)
                            }
                            </View>
                            </Fragment >
                            )}

                        </View>
                    </RadialGradient>)
                }
                    { this.state.videoPlayer
                    ? (<View style={styles.navContainer}>
                            <TouchableOpacity
                                onPress={this.shareFinalVideo}
                                style={{
                                    width: 125,
                                    justifyContent: 'center',
                                    alignItems: 'center' }}
                            >
                                <Text style={styles.navText}>Share</Text>
                            </TouchableOpacity >

                            <TouchableOpacity
                                onPress={this.uploadFinalVideo}
                                style={{
                                    width: 125,
                                    justifyContent: 'center',
                                    alignItems: 'center' }}
                            >
                                <Text style={styles.navText}>+</Text>
                            </TouchableOpacity >

                            <TouchableOpacity
                                onPress={this.closeFinalVideo}
                                style={{
                                    width: 125,
                                    justifyContent: 'center',
                                    alignItems: 'center' }}
                            >
                                <Text style={styles.navText}>Back</Text>
                            </TouchableOpacity >

                    </View>)

                    : (<View style={styles.navContainer}>
                        <TouchableOpacity
                            onPress={this.props.signOut}
                            style={{ width: 125 }}
                        >
                            <Text
                                style={styles.navText}
                            >
                                &lt;&lt; Sign out
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.props.switchPage('imagessounds')}
                            style={{ alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text
                                style={this.state.done
                                    ? { ...styles.navTextDisabled,
                                        fontSize: 20,
                                        textAlign: 'center' }
                                : { ...styles.navText, fontSize: 24 }}
                            >
                                +
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={this.handleRepeat}
                            style={{ width: 125 }}
                            disabled={!this.state.done}
                        >
                            <Text style={this.state.done ? styles.navText : styles.navTextDisabled}>
                                Continue &gt;&gt;
                            </Text>
                        </TouchableOpacity>

                    </View>)}
                </CollageFadeTransition>
        );
    }
}

const win = Dimensions.get('window');
const screenHeight = PixelRatio.getPixelSizeForLayoutSize(win.height);

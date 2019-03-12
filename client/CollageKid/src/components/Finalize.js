import React, { Component } from 'react';
import {
    ActivityIndicator,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    PixelRatio,
    Platform
} from 'react-native';
import Slider from 'react-native-slider';
import RadialGradient from 'react-native-radial-gradient';
import LinearGradient from 'react-native-linear-gradient';

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
        cycle: this.props.cycle
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
    }


      componentDidUpdate(oldProps) {
          const newProps = this.props;
          if (oldProps.cycle !== newProps.cycle) {
              this.loadCycle(newProps.cycle);
          }
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
        this.startTime = Date.now();
        this.setState({ finalizing: true });
        let createFormData = null;

        Promise.all(
            this.props.media.map((mediaItem) => {
                return new Promise((resolve, reject) => {
                    createFormData = () => {
                        const data = new FormData();

                        data.append('media', {
                            name: mediaItem.fileName,
                            uri: Platform.OS === 'android' ? mediaItem.uri : mediaItem.uri.replace('file://', '')
                        });

                        return data;
                    };
                    const body = createFormData(mediaItem);
                    const headers = {
                        mediatype: mediaItem.type,
                        userid: this.userId,
                        startTime: this.startTime
                    };

                    const fetchURL = 'https://collagekid.com/collageserver/api/upload';

                    fetch(fetchURL, {
                        method: 'POST',
                        headers,
                        body
                    }).then(response => {
                        if (!response.ok) {
                            this.setState({ finalizing: false });
                            this.setState({ hasError: true });
                            reject('bad connection');
                            return;
                        }
                        resolve(response.json());
                    }).catch(error => {
                        this.setState({ 'upload error': false });
                        this.setState({ hasError: true });
                        reject('error', error);
                    });
                });
            })
        )
        .then(() => RNFS.exists(`${RNFS.CachesDirectoryPath}/SoundRecorder`)
                .then((exists) => {
                    if (exists && this.state.done) {
                        RNFS.unlink(`${RNFS.CachesDirectoryPath}/SoundRecorder`);
                    }
                    return true;
                })
        )
        .then(() => {
            if (this.state.done) {
                RNFS.unlink(`${RNFS.CachesDirectoryPath}/Camera`);
            }
            return true;
        })
        .then(() => {
            const fetchURL = 'https://collagekid.com/collageserver/api/edit';
            const headers = {
                userid: this.userId,
                email: this.email,
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                starttime: this.startTime,
                duration: this.state.duration,
                empirestate: this.empireState
            };
            fetch(fetchURL, {
                method: 'GET',
                headers
            })
                .then(() => {
                    this.setState({ finalizing: false });
                    if (this.state.cycle >= this.props.allowedCycles) {
                        this.setState({ done: true });
                    }
                    if (this.state.cycle < this.props.allowedCycles) {
                        this.props.incrementCycle();
                    }
                    return true;
                })
                .catch(() => {
                    this.setState({ finalizing: false });
                    this.setState({ hasError: true });
                });
        });
    }

    handleRepeat = () => {
        this.props.reset();
        this.props.switchPage('video');
    }
    render() {
        return (
            <CollageFadeTransition style={{ flex: 1 }}>
                <Header />

                <RadialGradient
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
                        <View
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
                                { this.state.finalizing
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
                                colors={this.state.finalizing
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
                                    disabled={(this.state.done || this.state.finalizing)}
                                >
                                    <Text
                                        style={this.state.finalizing
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
                    </View>
                </RadialGradient>
                <View style={styles.navContainer}>
                    <TouchableOpacity
                        onPress={this.props.signOut}
                        disabled={this.state.finalizing}
                        style={{ width: 125 }}
                    >
                        <Text
                            style={this.state.finalizing
                                ? styles.navTextDisabled
                                : styles.navText}
                        >
                            &lt;&lt; Sign out
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => this.props.switchPage('imagessounds')}
                        disabled={this.state.finalizing}
                        style={{ alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text
                            style={this.state.finalizing || this.state.done
                                ? { ...styles.navTextDisabled, fontSize: 20, textAlign: 'center' }
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

                </View>
            </CollageFadeTransition>
        );
    }
}

const win = Dimensions.get('window');
const screenHeight = PixelRatio.getPixelSizeForLayoutSize(win.height);

import React, { Component, Fragment } from 'react';
import { ActivityIndicator, Dimensions, Text, TouchableOpacity,
    ScrollView, View, Image, Modal } from 'react-native';
import RadialGradient from 'react-native-radial-gradient';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import Slider from 'react-native-slider';

import CollageFadeTransition from './CollageFadeTransition';
import Header from './Header';
import About from './About';
import { styles } from './CollageStyles';
import { convertToHMS } from '../utils/math';

const Sound = require('react-native-sound');
const RNFS = require('react-native-fs');

class Create extends Component {
    state = { currVideoLength: this.props.currVideoLength || 0,
        preview: false,
        media: [],
        selectedMedia: null,
        viewingMedia: false,
        duration: 90,
        pageState: 'intro',
        progress: 0,
        errorCount: 0,
        uploading: false,
        finalizing: false,
        videoInfo: null,
        minVideo: false
     }

    componentWillMount() {
        this.setState({ media: this.props.media });
    }

    componentDidMount() {
        this.setState({ minVideo: this.props.minVideo });
        this.empireState = false;
        debugger;
        navigator.geolocation.getCurrentPosition((result) => {
            const { latitude, longitude } = result.coords;
            this.setState({ latitude, longitude });
        },
        () => {
            this.setState({ latitude: 40.7484405, longitude: -73.9878531 });
            this.empireState = true;
        });
        this.userId = this.props.uid;
        this.state.uploading = this.props.uploading;
    }

    componentDidUpdate(oldProps) {
        const newProps = this.props;

        if (oldProps.media !== newProps.media) {
            this.props.media = newProps.media;
            this.updateMediaState(this.props.media);
        }

        if (oldProps.uploading !== newProps.uploading) {
            this.props.uploading = newProps.uploading;
            this.setUploading(this.props.uploading);
        }
    }

    setUploading = (uploading) => {
        this.setState({ uploading });
    }

    selectMedia = (index) => {
        if (index === this.state.selectedMedia) {
            this.setState({ selectedMedia: null });
        } else {
            this.setState({ selectedMedia: index });
        }
    }

    toggleReviewMedia = () => {
        this.setState({ viewingMedia: !this.state.viewingMedia });
        if (this.soundClip) {
            this.soundClip.stop();
        }
    }

    deleteMedia = () => {
        this.setState({ viewingMedia: false });
        console.log('called delete media from create');
        const media = this.state.media;
        const selectedIndex = this.state.selectedMedia;
        const newMedia = media.filter((clip, index) => index !== selectedIndex);
        this.setState({ media: newMedia });
        this.props.setMedia(newMedia);
        const videoCheck = newMedia.map(clip => clip.type);
        if (!videoCheck.includes('video')) {
            this.setState({ minVideo: false });
            this.props.setMinVideo(false);
        }

        this.props.deleteMedia(media[selectedIndex]);
        this.setState({ selectedMedia: null });
    }

    updateMediaState = (media) => this.setState({ media });

    loadCurrVideoLength = (currVideoLength) => {
        this.setState({
            currVideoLength
        });
    }

    togglePreview = () => {
        if (this.state.pageState !== 'preview') {
            this.setState({ pageState: 'preview' });
        } else {
            this.setState({ pageState: 'intro' });
        }
    };

    toggleCreate = () => {
        if (this.state.pageState !== 'create') {
            this.setState({ pageState: 'create' });
        } else {
            this.setState({ pageState: 'intro' });
        }
    };

    showPreviewItems = () => {
        const media = this.state.media;
        const thumbs = media.map((clip, index) => (
            <TouchableOpacity
                key={index}
                onPress={() => this.selectMedia(index)}
                style={styles.previewIconHolders}
            >
                <Fragment>
                    <Image
                        source={clip.type === 'sound'
                        ? require('../img/thumb_sound.png')
                        : { uri: clip.thumb }}
                        style={this.state.selectedMedia === index
                            ? { ...styles.previewIcons,
                                borderWidth: 2,
                                borderColor: '#9db6f6' }
                            : styles.previewIcons}
                    />
                    {clip.type === 'video'
                    ? <View
                        style={{ ...styles.previewIcons,
                            height: 20,
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingLeft: 10,
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            zIndex: 1
                        }}
                    >
                        <Image
                            source={require('../img/icon_videocall.png')}
                            style={{ width: 20, height: 20 }}
                        />
                    </View>
                    : null }
                    </Fragment>
            </TouchableOpacity>
        ));

        return thumbs;
    }

    showPreviewPlayer = () => {
        const media = this.state.media;
        const clip = media[this.state.selectedMedia];

        if (clip.type === 'sound') {
            console.log(clip.uri);
            Sound.setCategory('Playback');

             this.soundClip = new Sound(clip.uri, '', (error) => {
                console.log('error playing sound', error);
              });

              setTimeout(() => {
                this.soundClip.play((success) => {
                  console.log('played clip', success);
                });
              }, 100);
        }

        let previewPlayer = {};
        switch (clip.type) {
            case 'video':
                previewPlayer = (<View
                    style={{ flex: 1,
                        alignSelf: 'stretch',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 10,
                        borderWidth: 1,
                        borderColor: '#9db6f6',
                        borderRadius: 5
                    }}
                >
                    <Video
                        source={{ uri: clip.uri }}
                        ref={(ref) => {
                         this.player = ref;
                        }}

                        controls
                        style={{
                            flex: 1,
                            alignSelf: 'stretch' }}
                    />

                </View>
                );
                break;

            case 'image':
                previewPlayer = (<View
                    style={{ flex: 1,
                        alignSelf: 'stretch',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 10,
                        borderWidth: 1,
                        borderColor: '#013c4b',
                        borderRadius: 5
                    }}
                >
                        <Image
                            source={{ uri: clip.uri }}
                            style={{ flex: 1, alignSelf: 'stretch' }}
                        />
                    </View>
                );
                break;

            case 'sound':
                previewPlayer = (<View
                    style={{ flex: 1,
                        alignSelf: 'stretch',
                        alignItems: 'center',
                        justifyContent: 'center' }}
                >
                        <Image
                            source={require('../img/speaker_final.png')}
                            style={{ width: 300, height: 300 }}
                        />
                    </View>
                );
                break;

            default:
                previewPlayer = null;
        }
        return previewPlayer;
    }

    showDurationSlider = () => {
        const durationSlider = (
            <Fragment>
                <Slider
                    minimumValue={30}
                    maximumValue={180}
                    step={5}
                    value={this.state.duration}
                    minimumTrackTintColor='#01b0b2'
                    maximumTrackTintColor='#011222'
                    onValueChange={duration => this.setState({ duration })}
                    trackStyle={{ height: 20,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: '#00519b' }}
                    thumbStyle={{ height: 40,
                        width: 18,
                        borderRadius: 3,
                        backgroundColor: '#01b0b2',
                        borderWidth: 1,
                        borderColor: '#00519b' }}
                    style={{ width: 300, marginTop: 20, marginBottom: 20 }}
                />
                <View style={{ paddingBottom: 20 }}>
                    <Text style={{ ...styles.instructions, fontSize: 16, color: '#9db6f6' }}>
                        {`[ ${convertToHMS(this.state.duration)} ]`}
                    </Text>
                </View>
            </Fragment>
        );
        return durationSlider;
    }

    finalizePiece = () => {
        if (this.state.hasError) {
            this.setState({ hasError: false });
        }
        this.setState({ finalizing: true })

        const url = `${this.props.socketProtocol}${this.props.host}`;
        const message = {
            type: 'edit',
            headers: {
                host: this.props.host,
                userid: this.props.uid,
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
            switch (editorMessage.status) {
                case 'wait':
                    this.setState({ pageState: 'finalizing' });
                    this.setState({ progress: this.state.progress + editorMessage.interval });
                    console.log('waiting', this.state.progress);
                    break;

                case 'error':
                    console.log('editing error');
                    this.setState({ progress: 0 });
                    this.setState({ errorCount: this.state.errorCount + 1 });
                    if (this.state.errorCount < 3) {
                        ws.send(JSON.stringify(message));
                    } else {
                        this.setState({ pageState: 'create' });
                        this.setState({ finalizing: false })
                    }
                    break;

                case 'info':
                    this.setState({
                        videoInfo: {
                           terrestrial: editorMessage.terrestrial,
                           heavenly: editorMessage.heavenly,
                           nearestStormDistance: editorMessage.nearestStormDistance
                        }
                    });
                    break;

                case 'go':
                    console.log('open video player');
                    ws.close();
                    this.props.setVideoURI(`${this.props.httpProtocol}${editorMessage.url}`);
                    this.setState({ finalizing: false })
                    this.setState({ pageState: 'intro' });
                    this.props.switchPage('watch');
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

    reset = () => {
        this.props.reset();
        RNFS.exists(`${RNFS.CachesDirectoryPath}/SoundRecorder`)
            .then((exists) => {
                if (exists) {
                    RNFS.unlink(`${RNFS.CachesDirectoryPath}/SoundRecorder`);
                }
                return true;
                })
            .then(() => {
                RNFS.exists(`${RNFS.CachesDirectoryPath}/Camera`)
                .then(exists => {
                    if (exists) {
                        RNFS.unlink(`${RNFS.CachesDirectoryPath}/Camera`);
                    }
                });
                return true;
            })
            .catch((err) => console.log('error deleting files from phone', err));
        this.props.switchPage('gather');
    }

    render() {
        return (
            <CollageFadeTransition style={{ flex: 1 }}>
                <Header />
                <RadialGradient
                    style={{ flex: 1, alignSelf: 'stretch' }}
                    colors={['#1a2f65', '#100200']}
                    stops={[0.3, 1]}
                    radius={win.width * 0.8}
                >
                <View style={styles.container}>
                    {{
                        intro: (<View style={styles.instructionsContainer}>
                            <Text style={styles.instructions}>
                            Tap Media to open media bin and preview gathered
                            media before creating your experimental film.</Text>

                            <Text style={{ ...styles.instructions, paddingTop: 20 }}>Tap Edit to set paramaters and start
                            the editing and finalizing of your film.</Text>

                            <Text style={{ ...styles.instructions, paddingTop: 20 }}>Tap Watch to return to last edited film (tapping prior to having edited a film will reveal Watch page instructions.)</Text>

                            <Text style={{ ...styles.instructions, paddingTop: 20 }}>Tap Reset to empty media bin
                            and start a new film.</Text>

                        </View>),

                        preview: (
                            <View
                                style={{ flex: 1,
                                    alignSelf: 'stretch',
                                    paddingLeft: 20,
                                    paddingRight: 20 }}
                            >
                                <ScrollView
                                    contentContainerStyle={{
                                        flexGrow: 1,
                                        flexWrap: 'wrap',
                                        flexDirection: 'row',
                                        paddingTop: 40,
                                        paddingBottom: 40,
                                        alignSelf: 'stretch'

                                    }}
                                >
                                     {this.state.media.length ?
                                         this.state.viewingMedia ?
                                            this.showPreviewPlayer() :
                                            this.showPreviewItems()
                                        : <Text
                                            style={styles.instructions}
                                        >No media to select</Text>}
                                </ScrollView>
                                {this.state.media.length ?
                                    (<View
                                        style={{
                                            height: 40,
                                            paddingTop: 10,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                    <TouchableOpacity
                                        onPress={this.toggleReviewMedia}
                                        disabled={this.state.selectedMedia === null}
                                    >
                                        <Text
                                            style={!(this.state.selectedMedia === null) ?
                                                this.state.viewingMedia ?
                                                    { ...styles.navText,
                                                        fontSize: 16,
                                                        color: '#9db6f6'
                                                    }
                                                    : { ...styles.navText,
                                                        fontSize: 16
                                                    }
                                                : { ...styles.navText,
                                                    fontSize: 16,
                                                    color: '#1a2f65'
                                                }
                                            }
                                        >Review selected</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        disabled={this.state.selectedMedia === null}
                                        onPress={this.deleteMedia}
                                    >
                                        <Text
                                        style={!(this.state.selectedMedia === null) ?
                                            {
                                                ...styles.navText,
                                                fontSize: 16
                                            }
                                            : {
                                                ...styles.navText,
                                                fontSize: 16,
                                                color: '#1a2f65'
                                            }
                                        }
                                        >Delete selected</Text>
                                    </TouchableOpacity>
                                </View>) :
                            null}

                            </View>
                        ),
                        create: (<View
                                style={{
                                    flex: 1,
                                    alignSelf: 'stretch',
                                    alignItems: 'center',
                                    justifyContent: 'center' }}
                        >
                                <Text
                                    style={{
                                    ...styles.instructions,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    paddingTop: 30

                                 }}
                                >
                                    Set Duration
                                </Text>
                                <Text
                                    style={{ ...styles.instructions,
                                        textAlign: 'center',
                                        paddingTop: 20,
                                        paddingBottom: 40 }}
                                >Choosing a short duration
                                    will return mostly quick cuts; longer values will
                                    yield more gentle, atmospheric results.
                                </Text>

                                {this.showDurationSlider()}
                                <View
                                    style={{ flex: 1,
                                        alignSelf: 'stretch',
                                        alignItems: 'center',
                                        justifyContent: 'center' }}
                                >
                                    {this.state.uploading
                                        ? (<Fragment>
                                                <ActivityIndicator size='large' />
                                                <Text style={styles.navText}>
                                                    Processing media...
                                                </Text>
                                            </Fragment>)
                                        : (<TouchableOpacity
                                            style={{
                                                alignItems: 'center',
                                                justifyContent: 'center' }}
                                            onPress={this.finalizePiece}
                                            disabled={this.state.uploading || this.state.finalizing}
                                        >
                                        <Image
                                            source={require('../img/icon_makefilm.png')}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                marginTop: 40,
                                                opacity: 1
                                            }}
                                        />
                                        <Text
                                        style={{
                                            ...styles.navText,
                                            fontWeight: 'bold' }}
                                        >Make Film</Text>
                                    </TouchableOpacity>)}
                                </View>
                            </View>),

                        finalizing: (<Modal
                            animationType="slide"
                            transparent={false}
                            visible={this.state.modalVisible}
                        >
                            <View
                            style={{
                                position: 'absolute',
                                flex: 1,
                                alignSelf: 'stretch',
                                backgroundColor: '#000' }}
                            >
                                <Image
                                    source={require('../img/collageart_splash4.jpg')}
                                    style={this.state.videoInfo
                                        ? {
                                             width: win.width,
                                             height: win.height,
                                             opacity: 0.3
                                        }
                                        : {
                                             width: win.width,
                                             height: win.height
                                        }
                                    }
                                />
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    alignSelf: 'stretch',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center' }}
                            >
                                {this.state.videoInfo
                                    ? (<View style={{ flex: 1, marginTop: 80 }}>
                                            <About
                                                videoInfo={this.state.videoInfo}
                                            />
                                        </View>)
                                    : null}

                                <View
                                    style={{
                                        width: 300,
                                        height: 46,
                                        marginBottom: 15,
                                        marginTop: 80 }}
                                >
                                    <LinearGradient
                                        style={{
                                            height: 40,
                                            width: this.state.progress * 2,
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
                            </View>
                        </Modal>)


                    }[this.state.pageState]}
                </View>
                </RadialGradient>
                <View
                    style={styles.navContainer}
                >
                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={() => this.props.switchPage('gather')}
                    >
                        <Image
                            source={require('../img/icon_prev.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.navText}>Gather</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={this.togglePreview}
                    >
                        <Image
                            source={this.state.pageState === 'preview'
                                ? require('../img/icon_bin_on.png')
                                : require('../img/icon_bin.png')}
                            style={styles.icon}
                        />
                        <Text
                            style={this.state.pageState === 'preview'
                                ? { ...styles.navText, color: '#00fafd' }
                                : styles.navText}
                        >Media</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={this.toggleCreate}
                        disabled={!this.props.minVideo}
                    >
                        <Image
                            source={this.props.minVideo ?
                                    this.state.pageState === 'create'
                                    ? require('../img/icon_edit_on.png')
                                    : require('../img/icon_edit.png')
                                : require('../img/icon_edit_off.png')}
                            style={styles.icon}
                        />
                        <Text
                            style={this.state.minVideo ?
                                    this.state.pageState === 'create'
                                    ? { ...styles.navText, color: '#00fafd' }
                                    : styles.navText
                                : { ...styles.navText, color: '#0085ff' }}
                        >Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={() => this.props.switchPage('watch')}
                    >
                        <Image
                            source={require('../img/icon_makefilm.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.navText}>Watch</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={this.reset}
                    >
                        <Image
                            source={require('../img/icon_reset.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.navText}>Reset</Text>
                    </TouchableOpacity>
                </View>
            </CollageFadeTransition>
        );
   }
}

const win = Dimensions.get('window');
export default Create;

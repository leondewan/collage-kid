import React, { Component } from 'react';
import { AlertIOS, Dimensions, Text, TouchableOpacity, View, Image, Share } from 'react-native';
import RadialGradient from 'react-native-radial-gradient';
import Video from 'react-native-video';
import RNFetchBlob from 'rn-fetch-blob';
import RNThumbnail from 'react-native-thumbnail';

import CollageFadeTransition from './CollageFadeTransition';
import Header from './Header';
import Narration from './Narration';
import { styles } from './CollageStyles';

class Watch extends Component {
    state = {
        pageState: 'futureFilm',
        finalVideoURI: this.props.finalVideoURI
    }

    componentDidMount() {
        if (this.props.finalVideoURI) {
            this.setState({ pageState: 'film' });
        }
        console.log('video info from watch', this.props.videoInfo);
    }

    componentDidUpdate(oldProps) {
        const newProps = this.props;

        if (oldProps.finalVideoURI !== newProps.finalVideoURI) {
            this.props.finalVideoURI = newProps.finalVideoURI;
            this.updateFinalVideoURI(this.props.finalVideoURI);
            console.log('updated?', this.props.finalVideoURI);
        }
    }

    updateFinalVideoURI = (finalVideoURI) => this.setState({ finalVideoURI });

    uploadFinalVideo = () => {
        console.log('recycling');
        RNFetchBlob
        .config({
            fileCache: true,
            appendExt: 'mp4'
        })
        .fetch('GET', this.props.finalVideoURI)
        .then((res) => {
            const media = {
                uri: res.path(),
                fileName: `finalvideo${Date.now()}.mp4`,
                type: 'video' };

            RNThumbnail.get(res.path())
                .then(result => {
                    media.thumb = result.path;
                    this.props.loadMedia(media);
                    AlertIOS.alert('This video has been added to your media bin.');
                    return result;
                });
        });
    }

    shareFinalVideo = () => {
        RNFetchBlob
        .config({
            fileCache: true,
            appendExt: 'mp4'
        })
        .fetch('GET', this.props.finalVideoURI)
        .then((res) => {
            console.log('blob result', res);
            Share.share({
                title: 'My experimental film',
                message: 'with help from Collage Kid Experimental Filmmaker',
                url: `file://${res.path()}`,
                type: 'video/mp4',
                subject: 'My experimental film'
          });
      });
    }

    toggleNarrate = () => {
        if (this.state.pageState !== 'narrate') {
            this.setState({ pageState: 'narrate' });
        } else {
            if (this.props.finalVideoURI) {
                this.setState({ pageState: 'film' });
            } else {
                this.setState({ pageState: 'futureFilm' });
            }
        }
    }

    render() {
        return (
            <CollageFadeTransition style={{ flex: 1}}>
                <Header />
                <RadialGradient
                    style={{ flex: 1, alignSelf: 'stretch' }}
                    colors={['#1a2f65', '#100200']}
                    stops={[0.3, 1]}
                    radius={win.width * 0.8}
                >
                    <View
                        style={{ flex: 1,
                            alignSelf: 'stretch',
                            alignItems: 'center',
                            justifyContent: 'center' }}
                    >

                        {{ film: (<Video
                                source={{ uri: this.state.finalVideoURI }}
                                ref={(ref) => {
                                 this.player = ref;
                                }}

                                controls
                                paused
                                style={{
                                    flex: 1,
                                    alignSelf: 'stretch' }}
                        />),

                            futureFilm: (<View style={styles.instructionsContainer}>
                                <Text style={styles.instructions} >
                                    Tap Recycle to add the film that will appear in this space to your media bin.</Text>

                                <Text style={{ ...styles.instructions, paddingTop: 20 }} >Tap
                                    Narrate to add sound to your film - you can
                                    overlay an unlimited number of tracks.</Text>

                                <Text style={{ ...styles.instructions, paddingTop: 20 }} >Tap Gather to gather more media for the next iteration.</Text>
                            </View>),
                            narrate: (<Narration
                                    httpProtocol={this.props.httpProtocol}
                                    socketProtocol={this.props.socketProtocol}
                                    finalVideoURI={this.props.finalVideoURI}
                                    loadMedia={this.props.loadMedia}
                                    host={this.props.host}
                                    startTime={this.props.startTime}
                                    setVideoURI={this.props.setVideoURI}
                                    uid={this.props.uid}
                                    toggleNarrate={this.toggleNarrate}
                                    style={{
                                        flex: 1,
                                        alignSelf: 'stretch',
                                        width: win.width }}
                            />)
                        }[this.state.pageState]}

                    </View>
                </RadialGradient>
                <View style={styles.navContainer}>
                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={() => this.props.switchPage('create')}
                    >
                        <Image
                            source={require('../img/icon_prev.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.navText}>Create</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={this.uploadFinalVideo}
                    >
                        <Image
                            source={require('../img/icon_recycle.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.navText}>Recycle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={this.toggleNarrate}
                        disabled={!this.props.finalVideoURI}
                    >
                        <Image
                            source={this.state.pageState === 'narrate'
                            ? require('../img/icon_narrate_on.png')
                            : this.props.finalVideoURI
                                ? require('../img/icon_narrate.png')
                                : require('../img/icon_narrate_off.png')}
                            style={styles.icon}
                        />
                        <Text
                            style={this.state.pageState === 'narrate'
                                ? { ...styles.navText, color: '#00fafd' }
                                : this.props.finalVideoURI
                                    ? styles.navText
                                    : { ...styles.navText, color: '#0085ff' }}
                        >Narrate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={() => this.props.switchPage('gather')}
                    >
                        <Image
                            source={require('../img/icon_add.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.navText}>Gather</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={this.shareFinalVideo}
                    >
                        <Image
                            source={require('../img/icon_share.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.navText}>Share</Text>
                    </TouchableOpacity>
                </View>
            </CollageFadeTransition>
        );
   }
}

const win = Dimensions.get('window');
export default Watch;

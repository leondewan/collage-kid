import React, { Component } from 'react';
import { Dimensions, Text, TouchableOpacity, View, Image, ScrollView, Linking } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import RNThumbnail from 'react-native-thumbnail';

import RadialGradient from 'react-native-radial-gradient';

import CollageFadeTransition from './CollageFadeTransition';
import Header from './Header';
import { styles } from './CollageStyles';

class Gather extends Component {
    state = { about: false };

    componentDidMount() {
        if (!this.props.startTime) {
            this.props.setStartTime(Date.now());
        }
    }

    componentDidUpdate(oldProps) {
        const newProps = this.props;
        if (oldProps.currVideoLength !== newProps.currVideoLength) {
            this.loadCurrVideoLength(newProps.currVideoLength);
        }
        if (oldProps.navigationHistory !== newProps.navigationHistory) {
            this.props.navigationHistory = newProps.navigationHistory;
        }
    }

    loadCurrVideoLength = (currVideoLength) => {
        this.setState({
            currVideoLength
        });
    }

    takeVideo = () => {
        ImagePicker.openCamera({
            mediaType: 'video'
        })

        .then(data => {
            RNThumbnail.get(data.sourceURL)
                .then(result => {
                    console.log('thumb path', result.path);
                    return { data, result };
                })
                .then(res => {
                    console.log('media capture', data);
                    this.props.loadMedia({
                        uri: res.data.sourceURL,
                        fileName: res.data.filename,
                        thumb: res.result.path,
                        type: 'video'
                      }
                    );
                    return data;
                })
                .catch(err => console.log('thumb error', err));
        })
        .catch(err => console.log('image picker error', err));
    }

    takePhoto = () => {
        ImagePicker.openCamera({
            mediaType: 'image'
        }).then(data => {
            console.log('photo capture', data);
            const fileNameIndex = data.path.lastIndexOf('/') + 1;
            const fileName = data.path.substr(fileNameIndex);
            this.props.loadMedia({
                uri: data.path,
                fileName,
                thumb: data.path,
                type: 'image'
              }
            );
        });
    }


    toggleAbout = () => {
        this.setState({ about: !this.state.about });
    }

    render() {
        return (
            <CollageFadeTransition style={{ flex: 1 }}>
                <Header />
                <RadialGradient
                    style={{ flex: 1, alignSelf: 'stretch' }}
                    colors={['#1a2f65', '#100200']}
                    //colors={['#013c4b', '#100200']}
                    stops={[0.3, 1]}
                    radius={win.width * 0.7}
                >
                    <View style={styles.container}>
                        {this.state.about
                            ? (<ScrollView contentContainerStyle={{ flexGrow: 1, alignSelf: 'stretch', alignItems: 'center' }}>
                                <Text style={{ ...styles.instructions, fontSize: 16, paddingTop: 20, textAlign: 'left' }}>
                                    Collage Kid Experimental Filmmaker is designed to help you create video art
                                    pieces from whatever's around you.  After you have gathered video, images, and sounds,
                                    Filmmaker will create and execute edits based on weather, stock market, and
                                    planetary alignment data. While at times chaotic, the results are not random.
                                </Text>
                                <Text style={{ ...styles.instructions, fontSize: 16, paddingTop: 20, textAlign: 'left' }}>
                                    Generatd films can be cycled through the editor any number of times along with whatever combination
                                    of previous results and original media you desire.  This allows you to exploit the
                                     butterfly-effect interconnectedness of everything for the entertainment and philosophical enrichment
                                    of yourself and those around you while also creating intriguing and unexpected content.

                                </Text>
                                <TouchableOpacity
                                    onPress={() => Linking.openURL('https://termsfeed.com/privacy-policy/2195d8227da6e30dda7a0804b4bb4f92')}
                                    style={{ alignSelf: 'stretch',
                                    height: 40,
                                    paddingTop: 20,
                                    paddingLeft: 40}}
                                >
                                    <Text
                                        style={{
                                            alignSelf: 'stretch',
                                            height: 40,
                                            color: '#fff',
                                            fontSize: 14 }}
                                    >View our Privacy Policy</Text>
                               </TouchableOpacity>

                            </ScrollView>)

                            : (<View style={styles.instructionsContainer}>
                            <Text style={styles.instructions}>
                                Start making your experimental film by gathering
                                media: capturing video, taking pictures, recording sounds.
                                When you have gathered enough, tap Create.
                            </Text>
                            <Text style={{ ...styles.instructions, fontSize: 16, paddingTop: 20 }}>
                                It's best not to load videos that are
                                much longer than 3 minutes. The more media you use, the longer
                                it will take for your film to process. You will need at least 3 seconds of
                                video in order to make your film.
                            </Text>
                        </View>)}
                    </View>
                </RadialGradient>
                <View style={styles.navContainer}>
                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={this.toggleAbout}
                    >
                        <Image
                            source={this.state.about
                                ? require('../img/icon_about_on.png')
                                : require('../img/icon_about.png')}
                            style={styles.icon}
                        />
                        <Text style={this.state.about
                            ? { ...styles.navText, color: '#00fafd'}
                            : styles.navText}>Grok</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={() => this.props.switchPage('videocam')}
                    >
                        <Image
                            source={require('../img/icon_video.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.navText}>Video</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={() => this.props.switchPage('camera')}
                    >
                        <Image
                            source={require('../img/icon_camera.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.navText}>Images</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={() => this.props.switchPage('soundrecording')}
                    >
                        <Image
                            source={require('../img/icon_microphone.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.navText}>Sounds</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconHolder}
                        onPress={() => this.props.switchPage('create')}
                    >
                        <Image
                            source={require('../img/icon_next.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.navText}>Create</Text>
                    </TouchableOpacity>
                </View>
            </CollageFadeTransition>
        );
   }
}

const win = Dimensions.get('window');
export default Gather;

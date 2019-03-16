import React, { Component } from 'react';
import { Text, View, TouchableOpacity, Dimensions } from 'react-native';
import RadialGradient from 'react-native-radial-gradient';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker';

import CollageFadeTransition from './CollageFadeTransition';
import Header from './Header';
import { styles } from './CollageStyles';

export default class ImagesSounds extends Component {
    state = {
        soundFileName: '',
        recording: false
    };
    //
    // componentDidMount() {
    //     console.log('image picker', ImagePicker);
    // }

    setSoundFileName = (soundFileName) => {
        this.setState({ soundFileName });
    }

    getSoundFileName = () => {
        return this.state.soundFileName;
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
                type: 'image'
              }
            );
        });
    }

    openImagePicker = () => {
        console.log('Image Picker', ImagePicker);

        ImagePicker.openPicker({
            multiple: true
            }).then(images => {
                const media = {};
                for (let i = 0; i < images.length; i++) {
                    console.log(images[i]);
                    media.uri = images[i].sourceURL;
                    media.fileName = images[i].filename;
                    if (images[i].mime === 'image/jpeg') {
                        media.type = 'image';
                    } else {
                        media.type = 'video';
                    }
                    this.props.loadMedia(media);
                }
            });
    }

    render() {
        return (
            <CollageFadeTransition style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <Header />

                    <RadialGradient
                        style={{ flex: 1, alignSelf: 'stretch' }}
                        colors={['#01305b', '#000']}
                        stops={[0.3, 1]}
                        radius={win.width}
                    >

                        <View style={styles.container}>
                            <View style={styles.instructionsContainer}>
                                <Text style={styles.instructions}>
                                    Don't miss this chance to adorn your work with
                                    images and sounds from your immediate surroundings
                                    and memory.
                                </Text>
                            </View>

                            <LinearGradient
                                colors={['#4167db', '#3b5998', '#01305b']}
                                style={{
                                    borderRadius: 5,
                                    borderColor: '#01305b',
                                    borderWidth: 2
                                }}
                            >


                                <TouchableOpacity
                                    style={styles.button}
                                    //onPress={() => this.props.switchPage('camera')}
                                    onPress={this.takePhoto}
                                >
                                    <Text style={styles.buttonText}>Capture Images</Text>
                                </TouchableOpacity>

                            </LinearGradient>

                            <LinearGradient
                                colors={['#4167db', '#3b5998', '#01305b']}
                                style={{
                                    borderRadius: 5,
                                    borderColor: '#01305b',
                                    borderWidth: 2,
                                    marginTop: 20
                                }}
                            >

                                <TouchableOpacity
                                    style={{ ...styles.button }}
                                    onPress={() => this.props.switchPage('soundrecording')}
                                >
                                    <Text style={styles.buttonText}>Record Sound</Text>
                                </TouchableOpacity>
                            </LinearGradient>

                            <LinearGradient
                                colors={['#4167db', '#3b5998', '#01305b']}
                                style={{
                                    borderRadius: 5,
                                    borderColor: '#01305b',
                                    borderWidth: 2,
                                    marginTop: 20
                                }}
                            >

                                <TouchableOpacity
                                    style={{ ...styles.button }}
                                    onPress={this.openImagePicker}
                                >
                                    <Text style={styles.buttonText}>Use Memories</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </RadialGradient>

                    <View style={styles.navContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.switchPage('videocam')}
                        >
                            <Text style={styles.navText}> &lt; More video </Text>
                        </ TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.props.switchPage('finalize')}
                            style={styles.navText}
                        >
                            <Text style={styles.navText}> Finalize &gt; </Text>
                        </ TouchableOpacity>

                    </View>
                </View>
            </CollageFadeTransition>
        );
    }
}

const win = Dimensions.get('window');

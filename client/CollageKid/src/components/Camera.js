import React, { Component } from 'react';
import { Text, TouchableOpacity, View, Dimensions, StatusBar } from 'react-native';
import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/FontAwesome';

import { styles } from './CollageStyles';
import CollageFadeTransition from './CollageFadeTransition';

class Camera extends Component {
    state = { back: true };

    takePicture = async () => {
          if (this.camera) {
              const options = {
                  orientation: 'portrait',
                  forceUpOrientation: true,
                  base64: false
              };
              const data = await this.camera.takePictureAsync(options);

              const fileNameIndex = data.uri.lastIndexOf('/') + 1;
              const fileName = data.uri.substr(fileNameIndex);

              this.props.loadMedia({
                  uri: data.uri,
                  fileName,
                  type: 'image'
              });
          }
      };

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
                        type={this.state.back ? RNCamera.Constants.Type.back
                            : RNCamera.Constants.Type.front}
                        flashMode={RNCamera.Constants.FlashMode.off}
                        permissionDialogTitle={'Permission to use camera'}
                        permissionDialogMessage={'We need your permission to use your camera phone'}
                    />
                    <View
                        style={{
                            flex: 0,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center' }}
                    >
                        <TouchableOpacity
                            onPress={() => this.props.switchPage('imagessounds')}
                            style={{ ...styles.utilButton, width: 50 }}
                        >
                         <Icon name="chevron-left" size={20} color="#f2fffc" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.takePicture} style={styles.utilButton}>
                            <Text style={{ ...styles.buttonText, fontSize: 14 }}>
                                Take Picture
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.setState({ back: !this.state.back })}
                            style={{ ...styles.utilButton, width: 50 }}
                        >
                          <Icon name="retweet" size={20} color='#f2fffc' />
                        </TouchableOpacity>
                    </View>
                </View>
            </CollageFadeTransition>
        );
      }
}

const win = Dimensions.get('window');

export default Camera;

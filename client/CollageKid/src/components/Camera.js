import React, { Component } from 'react';
import { Text, TouchableOpacity, View, Dimensions, StatusBar, Image} from 'react-native';
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
                  thumb: data.uri,
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
                    />
                    <View
                        style={{
                            flex: 0,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignSelf: 'stretch',
                            alignItems: 'center',
                            paddingRight: 25,
                            paddingTop: 20,
                            paddingBottom: 20
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => this.setState({ back: !this.state.back })}
                            style={{ ...styles.iconHolder }}
                        >
                            <Image
                                source={require('../img/icon_flipcamera.png')}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.takePicture}
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
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 25,
                                    backgroundColor: '#fff'
                                }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.props.switchPage('gather')}
                            style={{ marginTop: 10 }}
                        >
                            <Text
                                style={{ color: '#f2fffc', fontSize: 18 }}
                            >Done</Text>
                         </TouchableOpacity>

                    </View>
                </View>
            </CollageFadeTransition>
        );
      }
}

const win = Dimensions.get('window');

export default Camera;

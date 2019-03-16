import React, { Component } from 'react';
import {
    Text,
    TouchableOpacity,
    TouchableHighlight,
    Image,
    View,
    Dimensions,
    StatusBar,
    CameraRoll,
    ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { styles } from './CollageStyles';
import CollageFadeTransition from './CollageFadeTransition';
import { convertToHMS } from '../utils/math';

class CameraRollViewer extends Component {
    state = { photos: [], selectedPhotos: [] }


    componentDidMount() {
        CameraRoll.getPhotos({
            first: 1000,
            assetType: 'All'
        })
        .then(result => {
            console.log('image info', result);
            this.setState({ photos: result.edges });
        });
    }

    selectPhoto = (index) => {
        if (this.state.selectedPhotos.includes(index)) {
            this.setState({
                selectedPhotos: this.state.selectedPhotos.filter(photos => photos !== index) });
        } else {
            this.setState({ selectedPhotos: [...this.state.selectedPhotos, index] });
        }
    }

    render() {
        return (
            <CollageFadeTransition style={{ flex: 1 }}>
                <View style={styles.utilContainer}>
                    <View>
                        <StatusBar hidden />
                    </View>

                    <ScrollView
                        contentContainerStyle={{
                            flexWrap: 'wrap',
                            flexDirection: 'row'
                        }}
                    >
                        {this.state.photos.map((photo, index) => {
                        return (
                            <TouchableHighlight
                                style={{ opacity: this.state.selectedPhotos.includes(index) ? 0.5 : 1,
                                padding: 5 }}
                                key={index}
                                underlayColor='transparent'
                                onPress={() => this.selectPhoto(index)}
                            >
                                <View>
                                {photo.node.image.playableDuration
                                    ? <Text
                                        style={{
                                            color: '#fff',
                                            position: 'absolute',
                                            bottom: 5,
                                            right: 5,
                                            zIndex: 1 }}
                                    >
                                        {convertToHMS(photo.node.image.playableDuration)}
                                    </Text>
                                    : null }
                                <Image
                                    style={{
                                      width: (win.width / 3) - 10,
                                      height: (win.width / 3) - 10
                                    }}
                                    source={{ uri: photo.node.image.uri }}
                                /></View>
                            </TouchableHighlight>
                      );
                        })
                      }
                    </ScrollView>


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

export default CameraRollViewer;

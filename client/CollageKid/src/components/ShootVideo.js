import React, { Component } from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Platform} from 'react-native';
import ImagePicker  from 'react-native-image-picker';

import MediaMeta from 'react-native-media-meta';

import { styles } from './CollageStyles';

class ShootVideo extends Component {
    handleTakeVideo = () => {
        console.log('starting at:', Date());
        const options = {
            nodata: true,
            mediaType: 'video',
            videoQuality: 'low',
            storageOptions: {
                skipBackup: true,
                cameraRoll: true,
                waitUntilSaved:true
            }
        };

        ImagePicker.launchCamera(options, (response) => {
            if(response.uri) {
                console.log('launch camera response', response);

                var path = Platform.OS === "android" ? response.uri: response.uri.replace("file://", "");

                MediaMeta.get(path)
                        .then(metadata => {
                            console.log(metadata);
                            this.props.loadCurrVideoLength(metadata.duration/60000);
                        })
                        .catch(err => console.error(err));
                        
                this.props.loadMedia({
                        uri: response.uri,
                        fileName: response.fileName,
                        type: 'video' 
                    }
                )
            }
        });
          
    }

    render() {
        return (
            <TouchableOpacity 
                style={styles.button} 
                onPress={this.handleTakeVideo}><Text style={styles.buttonText}>Shoot Video</Text>
            </ TouchableOpacity>    
        );
    }
} 

export default ShootVideo;
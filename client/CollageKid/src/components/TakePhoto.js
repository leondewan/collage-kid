import React, { Component } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import ImagePicker  from 'react-native-image-picker';


import { styles } from './CollageStyles';

class TakePhoto extends Component {
    handleTakePhoto = () => {
        const options = {
            nodata: true,
            storageOptions: {
                skipBackup: true,
                cameraRoll: true,
                waitUntilSaved:true
            }
        };

        ImagePicker.launchCamera(options, (response) => {
            if(response.uri) {
                console.log('launch camera response', response);
                this.props.loadMedia({
                    uri: response.uri,
                    fileName: response.fileName,
                    type: 'image'
                }
            );
            }
        });
            
    }
            
    render() {
        return (
            <TouchableOpacity 
                style={styles.button} 
                onPress={this.handleTakePhoto}><Text style={styles.buttonText}>Take Photo</Text>
            </ TouchableOpacity>  
        );
    }
    
}

export default TakePhoto;
import React,{ Component } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar, Image, Platform, Button } from 'react-native';
import firebase from 'firebase';

import CollageFadeTransition from './CollageFadeTransition';
import { styles } from './CollageStyles';

export default class Finalize extends Component {

    state = {latitude: null, longitude: null};

    componentDidMount() {
        navigator.geolocation.getCurrentPosition((result) => {
            console.log('geo results', result);
            const { latitude, longitude } = result.coords;
            this.setState({latitude, longitude})
        });
        this.email = this.props.user.email;
        this.userId = this.props.uid;
    }

    handleUploadMedia = () => {
        console.log('media', this.props.media)
        console.log('lat', this.state.latitude);
        var createFormData = null;
        
        Promise.all (
            this.props.media.map((mediaItem) => {
                createFormData = (mediaItem) =>  {
                    const data = new FormData();

                    data.append("media", {
                        name: mediaItem.fileName,
                        uri: Platform.OS === "android" ? mediaItem.uri: mediaItem.uri.replace("file://", "")
                    });

                    return data;
                }
                const body = createFormData(mediaItem);
                console.log('body', body);

                const fetchURL = "http://192.168.1.3:3001/api/upload";
                console.log('fetch url', fetchURL);

                fetch(fetchURL, {
                    method: "POST",
                    headers: {
                        mediatype: mediaItem.type,
                        userid: this.userId,
                        email: this.email,
                        latitude: this.state.latitude,
                        longitude: this.state.longitude,
                        starttime: this.props.startTime
                    },
                    body: body
                }).then(response => {
                    console.log('response:', response);
                    return response.json();
                    
                })
                .then(() => {
                    console.log('upload success');
                    //this.setState({media: null});
                }).catch(error => {
                    console.log("upload error", error);
                });
            })
        )
    }

    signOut = () => {
        firebase.auth().signOut().then(() => {
            console.log('signed out');
        })
    }
    
    render() {
        return (
            <CollageFadeTransition style={{flex: 1}}>
                <View>
                    <StatusBar backgroundColor="blue" barStyle="light-content" />
                </View>
                <View  style={{
                    backgroundColor: '#37029A',
                    width: win.width,
                    height: win.width*0.26}}
                >
                    <Image  
                    source={require('../img/collageart7.png')}
                    style={styles.headerImage}
                    />
                </View>
                
                <View style={styles.container}>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={this.handleUploadMedia}><Text style={styles.buttonText}>Upload Media</Text>
                    </TouchableOpacity>
                </View>
                <Button title="Sign out" onPress={this.signOut} />
            </CollageFadeTransition> 
        );
    }
}

const win = Dimensions.get('window');
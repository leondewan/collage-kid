import React, { Component } from 'react';
import { Text, View, TouchableOpacity,  StatusBar, Image, Dimensions, Button } from 'react-native';

import TakePhoto from './TakePhoto';
import SoundRecording from './SoundRecording';
import CollageFadeTransition from './CollageFadeTransition';

import { styles } from './CollageStyles';

export default class ImagesSounds extends Component {
    state = {
        soundFileName: '',
        recording: false
    };

    componentWillMount() {
        this.setState({userName: 'leon'})
    }

    setSoundFileName = (soundFileName) => {
        this.setState({ soundFileName });
        console.log('set sound file to', soundFileName);
    }

    getSoundFileName = () => {
        console.log('got sound file', this.state.soundFileName);
        return this.state.soundFileName;
    }

    switchMode = (recording) => {
        this.setState({ recording });
    }    

    renderMode = (recording) => {    
        console.log('switch mode', recording);
        if(recording) {
            return <SoundRecording switchMode={this.switchMode} 
                getSoundFileName={this.getSoundFileName}
                loadMedia={this.props.loadMedia}/>;
                
        }   else {
            return (
                <View style={{flex: 1}}>
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
                        <TakePhoto loadMedia={this.props.loadMedia} />
                        <TouchableOpacity 
                            style ={styles.button}
                            onPress={() => this.props.switchPage('soundrecording')}>
                            <Text style={styles.buttonText}>Record Sound</Text>
                        </TouchableOpacity>   
                    </View>
                    <Button onPress={() => this.props.switchPage('finalize')}
                        title = "Next >>" />
                </View>
            )
        }

    }

    render() {
        return (
            <CollageFadeTransition style={{flex: 1}}>
                {this.renderMode(this.state.recording)
             }</CollageFadeTransition>
        );
    }
}

const win = Dimensions.get('window');


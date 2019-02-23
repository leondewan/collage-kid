import React, { Component } from 'react';
import { View, Text, TextInput, ActivityIndicator, StatusBar, TouchableOpacity, 
    ImageBackground, TouchableWithoutFeedback, Keyboard} from  'react-native';
import firebase from 'firebase';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {styles} from './CollageStyles';

class Login extends Component {
    state = { email: '', password: '', error: '', keyboardToggle: false, loading: false};

    componentDidMount() {
        console.log('firebase test', firebase);
    }

    onLoginPress = () => {
        const { email, password } = this.state;
        this.setState({ error: '', loading: true});

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => this.onLoginSuccess)
            .catch(() => {
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then(() => this.onLoginSuccess())
                    .catch(() => this.onLoginFail());
            });
    }

    onLoginSuccess = () => {
        this.setState({
            email: '',
            password: '',
            loading: false,
            error: ''
        })
        this.props.setLogin(true);
    }

    onLoginFail () {
        this.setState({ error: 'Authentication Failed', loading: false})
    }

    displayLoginButton = () => {
        if(this.state.loading) {
            return <ActivityIndicator size='large'/>
        }
        return (
            <TouchableOpacity  onPress={this.onLoginPress}
                style={{...styles.button, width: 75}}>
                <Text style={styles.buttonText}>Go</Text>
            </TouchableOpacity>
        )
    }

    onKeyboardToggle = (toggle) => {
        this.setState({keyboardToggle: toggle})
    }

    loginFormStyle = () => {
        loginFormStyle = {
            flex: 0.5,  
            justifyContent: 'center', 
            alignItems: 'center',
            borderRadius: 10,
            marginBottom: 5,
            paddingLeft: 40,
            paddingRight: 40
        }

        if(this.state.keyboardToggle) {
            loginFormStyle = {...loginFormStyle, backgroundColor: '#37029A'}
        }
        return loginFormStyle;
    }

    render () {
        return (
            <ImageBackground source={require('../img/collageart.png')}
                style={{width: '100%', height: '100%'}}>
                <View>
                    <StatusBar backgroundColor="blue" barStyle="light-content"/>
                </View>
                <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
                    <View style={this.loginFormStyle()}>
                        <Text style={{fontSize: 20, color: '#fee2b2'}}>Sign up/Sign in</Text>
                        <TextInput style={{...styles.textInput, marginTop:20, color: '#fee2b2'}}
                            placeholderTextColor='#996'
                            placeholder="me@gmail.com"
                            label="Email"
                            value={this.state.email}
                            autoCapitalize = 'none'
                            onChangeText={email =>this.setState({ email })}
                        />
                        
                        <TextInput style={{...styles.textInput,  color: '#fee2b2'}}
                            placeholderTextColor='#996'  
                            placeholder="password"
                            label="Password"
                            secureTextEntry = {true}
                            value={this.state.password}
                            autoCapitalize = 'none'
                            onChangeText={password => this.setState({ password })}
                        /> 
                        {/* <Text style={styles.errorText}>
                            {this.state.error}
                        </Text> */}
                        {this.displayLoginButton()}
                    </View>
                </View>
                <KeyboardSpacer onToggle={this.onKeyboardToggle}/>
            </ImageBackground>
        );
    }
}

export default Login;
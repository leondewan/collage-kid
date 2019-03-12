import React, { Component } from 'react';
import { View, Text, TextInput, Image, ActivityIndicator, StatusBar, TouchableOpacity,
    Dimensions, Linking } from 'react-native';
import firebase from 'firebase';
import LinearGradient from 'react-native-linear-gradient';
import RadialGradient from 'react-native-radial-gradient';
import { styles } from './CollageStyles';

class Login extends Component {
    state = { email: '', password: '', error: '', loading: false, preSignin: true };

    componentDidMount() {
        this.props.reset();
    }

    onLoginSuccess = () => {
        this.setState({
            email: '',
            password: '',
            loading: false,
            error: ''
        });
        this.props.setLogin(true);
    }

    onLoginFail = () => {
        this.setState({ error: 'Please try again', loading: false });
    }

    login = () => {
        const { email, password } = this.state;
        this.setState({ error: '', loading: true });

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => this.onLoginSuccess)
            .catch(() => {
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then(() => this.onLoginSuccess())
                    .catch(() => this.onLoginFail());
            });
    }


    displayLoginButton = () => {
        if (this.state.loading) {
            return <ActivityIndicator size='large' />;
        }
        return (
            <LinearGradient
                colors={['#4167db', '#3b5998', '#01305b']}
                style={{
                    marginTop: 150,
                    borderRadius: 5,
                    borderColor: '#3b5998',
                    borderWidth: 1
                }}
            >
                <TouchableOpacity
                    onPress={() => this.setState({ preSignin: false })}
                    style={{ ...styles.button }}
                >
                    <Text style={styles.buttonText}>Sign up/Sign in</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    render() {
        return (
            <View
                style={{
                    flex: 1,
                    alignSelf: 'stretch',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Image
                    source={require('../img/collageart_splash4.jpg')}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        resizeMode: 'stretch',
                        flex: 1
                    }}
                />

                <View>
                       <StatusBar backgroundColor="blue" barStyle="light-content" />
                </View>
                    <View
                        style={{ flex: 1,
                           justifyContent: 'center',
                           alignItems: 'center',
                           alignSelf: 'stretch' }}
                    >
                       { this.state.preSignin ? this.displayLoginButton() : (
                            <RadialGradient
                                style={{
                                       flex: 1,
                                       borderRadius: 40,
                                       alignSelf: 'stretch',
                                       justifyContent: 'center',
                                       alignItems: 'center' }}
                                colors={['#01305b', '#000']}
                                stops={[0.3, 1]}
                                radius={win.width}
                            >
                               <View style={styles.loginForm}>
                                    <Text
                                        style={{ ...styles.instructions, fontWeight: 'bold' }}
                                    >Sign up/Sign in</Text>
                                        <TextInput
                                            style={{ ...styles.textInput, marginTop: 40 }}
                                            placeholderTextColor='#3b5998'
                                            placeholder="me@mail.com"
                                            label="Email"
                                            value={this.state.email}
                                            autoCapitalize='none'
                                            onChangeText={email => this.setState({ email })}
                                        />

                                       <TextInput
                                           style={styles.textInput}
                                           placeholderTextColor='#3b5998'
                                           placeholder="password"
                                           label="Password"
                                           secureTextEntry
                                           value={this.state.password}
                                           autoCapitalize='none'
                                           onChangeText={password => this.setState({ password })}
                                       />
                                       <Text style={styles.errorText}>
                                           {this.state.error}
                                       </Text>
                                       <LinearGradient
                                           colors={['#4167db', '#3b5998', '#01305b']}
                                           style={{
                                               borderRadius: 5,
                                               borderColor: '#01305b',
                                               borderWidth: 2,
                                               marginTop: 30
                                           }}
                                       >
                                            <TouchableOpacity
                                                onPress={this.login}
                                                style={{ ...styles.button, width: 75, height: 40 }}
                                            >
                                                <Text style={styles.buttonText}>Go</Text>
                                            </TouchableOpacity>
                                        </LinearGradient>

                                        <TouchableOpacity
                                            onPress={() => Linking.openURL('https://termsfeed.com/privacy-policy/2195d8227da6e30dda7a0804b4bb4f92')}
                                            style={{ alignSelf: 'stretch',
                                            height: 40,
                                            paddingTop: 20 }}
                                        >
                                            <Text
                                                style={{
                                                    alignSelf: 'stretch',
                                                    height: 40,
                                                    color: '#fff',
                                                    fontSize: 14,
                                                    textAlign: 'center' }}
                                            >View our Privacy Policy</Text>
                                       </TouchableOpacity>

                                   </View>
                               </RadialGradient>
                           )
                       }

                   </View>
            </View>

        );
    }
}

const win = Dimensions.get('window');

export default Login;

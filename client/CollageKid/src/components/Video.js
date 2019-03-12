import React, { Component } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

import RadialGradient from 'react-native-radial-gradient';
import LinearGradient from 'react-native-linear-gradient';

import CollageFadeTransition from './CollageFadeTransition';
import Header from './Header';
import { styles } from './CollageStyles';

class Video extends Component {
    state = { currVideoLength: this.props.currVideoLength || 0 }

    componentDidUpdate(oldProps) {
        const newProps = this.props;
        if (oldProps.currVideoLength !== newProps.currVideoLength) {
            this.loadCurrVideoLength(newProps.currVideoLength);
        }
        if (oldProps.navigationHistory !== newProps.navigationHistory) {
            this.props.navigationHistory = newProps.navigationHistory;
        }
    }

    loadCurrVideoLength = (currVideoLength) => {
        this.setState({
            currVideoLength
        });
    }

    renderBottomNav = () => {
        const navHistory = this.props.navigationHistory;
        if (!navHistory.every((val) => val === 'video' || val === 'videocam')) {
            return (
                <View style={styles.navContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.switchPage('imagessounds')}
                    >
                        <Text style={styles.navText}> &lt; More Images/Sounds </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => this.props.switchPage('finalize')}
                    >
                        <Text style={styles.navText}> Finalize &gt; </Text>
                    </TouchableOpacity>
                </View>
            );
        } else if (navHistory.length > 1 || navHistory.lenth === 0) {
            return (
                <View style={{ ...styles.navContainer, justifyContent: 'center' }}>
                    <TouchableOpacity
                        onPress={() => this.props.switchPage('imagessounds')}
                    >
                        <Text style={styles.navText}> Proceed &gt; </Text>
                    </ TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={{ ...styles.navContainer, justifyContent: 'center' }}>
                <TouchableOpacity
                    onPress={this.props.signOut}
                    disabled={this.state.finalizing}
                    style={{ width: 125 }}
                >
                    <Text
                        style={styles.navText}
                    >
                        &lt;&lt; Sign out
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <CollageFadeTransition style={{ flex: 1 }}>
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
                                Take this opportunity to document what you're thinking about
                                and what is happening around you.
                            </Text>
                            <Text
                                style={{ ...styles.instructions,
                                    fontSize: 16,
                                    paddingTop: 30,
                                    paddingLeft: 50,
                                    paddingRight: 50
                                }}
                            >
                                Please note the maximum total video length
                                of 6 minutes per submission.
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
                                onPress={() => this.props.switchPage('videocam')}
                            >
                                <Text style={styles.buttonText}>Capture Video</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </RadialGradient>
                { this.renderBottomNav() }
            </CollageFadeTransition>
        );
   }
}

const win = Dimensions.get('window');
export default Video;

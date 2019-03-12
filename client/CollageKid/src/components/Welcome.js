import React, { Component } from 'react';
import { Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';

import RadialGradient from 'react-native-radial-gradient';

import Header from './Header';
import CollageFadeTransition from './CollageFadeTransition';
import { styles } from './CollageStyles';

export default class Welcome extends Component {
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
                    <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                        <Text
                            style={{ ...styles.instructions,
                                fontWeight: 'bold',
                                marginTop: 20,
                                paddingLeft: 15,
                                paddingRight: 15 }}
                        >
                        Welcome
                        </Text>
                        <Text style={styles.welcomeInstructions}>
                            You have installed a program on your device
                            that will help you make short video collage pieces ranging from
                            30 seconds to 3 minutes long.
                        </Text>
                        <Text style={styles.welcomeInstructions}>
                            You will be instructed to capture footage
                            from your immediate surroundings and, if you wish, add to
                            what you have harvested with images and sounds you discover around you.
                        </Text>
                        <Text style={styles.welcomeInstructions}>
                            Once your submissions have uploaded, our service will prepare an
                            edited version of your submitted media.
                            Edits will be based on information from
                            your extended environment: weather and stock market data, the
                            precise position of the sun, earth's moon,
                            and the seven classical planets with respect to you.
                            Custom math will shape your video piece accordingly.
                        </Text>
                        <Text style={styles.welcomeInstructions}>
                            This program will allow you to exploit
                            the butterfly-effect interconnectedness
                            of everything for the entertainment and philosophical enrichment
                            of yourself and those around you.
                        </Text>
                        <Text style={styles.welcomeInstructions}>
                            Within 3 minutes of uploading your media, our service will send you an
                            email with a link to your work.
                        </Text>
                        <TouchableOpacity
                            onPress={() => this.props.switchPage('video')}
                            style={{
                                ...styles.button,
                                marginTop: 30,
                                marginBottom: 30,
                                width: 100,
                                height: 40,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                style={{ ...styles.welcomeInstructions,
                                    fontSize: 16,
                                    paddingTop: 0,
                                    textAlign: 'center'
                                }}
                            >Begin</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </RadialGradient>
            </CollageFadeTransition>
        );
    }
}

const win = Dimensions.get('window');

import React, { Component } from 'react';
import { Image, StatusBar, View, Platform } from 'react-native';

import { styles } from './CollageStyles';

class Header extends Component {
    render() {
        return (
            <View>
                <View>
                    <StatusBar backgroundColor="blue" barStyle="light-content" />
                </View>
                <View
                    style={Platform.OS === 'android'
                    ? styles.headerAlt
                    : styles.header}
                >
                    <Image
                        source={require('../img/collageart12.jpg')}
                        style={styles.headerImage}
                    />
                </View>
            </View>
        );
    }
}

export default Header;

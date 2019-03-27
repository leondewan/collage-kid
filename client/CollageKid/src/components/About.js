import React, { Component } from 'react';
import { ScrollView, View, Text } from 'react-native';

import { styles } from './CollageStyles';

export default class About extends Component {
    render() {
        const { terrestrial, heavenly, nearestStormDistance } = this.props.videoInfo;
        return (
            <ScrollView
                contentContainerStyle={{ paddingTop: 20,
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingBottom: 60 }}
            >
                    <Text style={{ ...styles.navText, fontSize: 18 }}>
                        {`At the moment you finalized this piece, the local temperature was ${(terrestrial[0] + 273.15).toFixed(2)} ˚ Kelvin, the ${nearestStormDistance
                            ? 'nearest storm was ' + terrestrial[1]
                                + ' km away'
                            : 'barometric pressure was '
                                + terrestrial[1].toFixed(2)
                                + ' millibars'}, the Dow and Nasdaq were at ${terrestrial[3].toFixed(2)} and ${terrestrial[2].toFixed(2)} respectively.`}
                    </Text>
                    <Text style={{ ...styles.navText, paddingTop: 10 }}>
                        Here are the values of the terrestrial and
                        heavenly entities that also shaped your piece:
                    </Text>

                    <Text
                        style={{ ...styles.navText,
                            fontWeight: 'bold',
                            paddingTop: 20 }}
                    >Terrestrial values (USD)</Text>

                    <View style={{ flexDirection: 'row', flex: 1, paddingTop: 5 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>Google stock price</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>
                            {`$${terrestrial[4].toFixed(2)}`}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>Facebook stock price</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>
                            {`$${terrestrial[5].toFixed(2)}`}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>Amazon stock price</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>
                            {`$${terrestrial[6].toFixed(2)}`}</Text>
                        </View>
                    </View>

                    <Text
                        style={{ ...styles.navText,
                            fontWeight: 'bold',
                            paddingTop: 20 }}
                    >Heavenly values (with respect to true north)</Text>

                    <View style={{ flexDirection: 'row', flex: 1, paddingTop: 5 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>Sun</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>
                            {`${heavenly[6].toFixed(2)}˚`}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>Moon</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>
                            {`${heavenly[0].toFixed(2)}˚`}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>Mercury</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>
                            {`${heavenly[4].toFixed(2)}˚`}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>Venus</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>
                            {`${heavenly[2].toFixed(2)}˚`}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>Mars</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>
                            {`${heavenly[1].toFixed(2)}˚`}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>Jupiter</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>
                            {`${heavenly[3].toFixed(2)}˚`}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>Saturn</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.navText}>
                            {`${heavenly[5].toFixed(2)}˚`}</Text>
                        </View>
                    </View>
            </ScrollView>
        );
    }
}

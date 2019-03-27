import React, { Component } from 'react';
import { Animated } from 'react-native';

class CollageFadeTransition extends Component {
    state = { fadeAnimation: new Animated.Value(0) }

    componentDidMount() {
        Animated.timing(
            this.state.fadeAnimation,
            {
                toValue: 1,
                duration: 600
            }
        ).start();
    }

    render() {
        const { fadeAnimation } = this.state;
        return (
            <Animated.View
                style={{
                    ...this.props.style,
                    opacity: fadeAnimation,
                    alignSelf: 'stretch',
                    flex: 1
                }}
            >
                {this.props.children}
            </Animated.View>
        );
    }

}

export default CollageFadeTransition;

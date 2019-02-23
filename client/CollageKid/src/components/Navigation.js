
import React, { Component } from 'react';
import { createStackNavigator, createSwitchNavigator, createAppContainer} from 'react-navigation';
import {Image, Dimensions, View} from 'react-native';

import { styles } from './CollageStyles';
import Video from './Video';
import SoundRecording from './SoundRecording';
import ImagesSounds from './ImagesSounds';
import Finalize from './Finalize';

const win = Dimensions.get('window');

class CollageHeader extends Component {
    render() {
        return(
            <View  style={{
                backgroundColor: '#37029A',
                width: win.width,
                height: win.width*0.26}}
            >
                <Image  
                source={require('../img/collageart7.png')}
                style={styles.image}
                />
            </View>
        )
    }
}


const CollageNavigator = createSwitchNavigator (
    {
        VideoRoute: {
            screen: Video
        },
        ImagesSoundsRoute: {
           screen: ImagesSounds
       },
       FinalizeRoute: {
        screen: Finalize
        }
    },
    {
        initialRouteName: 'VideoRoute',
        navigationOptions: {
            header: <CollageHeader />,
            headerBackTitle: false,
            headerTransparent: true
        }
    }
)

const RootNavigator = createSwitchNavigator ({
    CollageNavigatorRoute: {
        screen: CollageNavigator
    },

    SoundRecordingRoute: {
        screen: SoundRecording
    }
}, 
{
    mode: 'modal'
    
});

const AppContainer = createAppContainer(RootNavigator);

// class AppNavigation extends Component {

//     state = {
//     media: [],
//     userName: null
// };

// componentWillMount() {
//     this.setState({userName: 'leon'})
// }

// loadMedia = (mediaFile) => {
//     this.setState({media: [...this.state.media, mediaFile]})
// }


//     };

//     render() {
//         return(
//             <AppContainer screenProps={this.props} />
//         )
//     }
// }

export default AppContainer;
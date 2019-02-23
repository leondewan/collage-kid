import React from 'react';
import {StyleSheet, Dimensions } from 'react-native';


const win = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: win.width,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#f2fffc',
        paddingBottom:60
    },

    instructionsContainer: {
        flex:1, 
        justifyContent: 'center', 
        alignItems: 'center',
    },

    instructions: {
        color: '#333',
        fontSize: 22,
        paddingLeft: 40,
        paddingRight: 40,
        textAlign: 'center'
    },
    imageBG: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    button: {
        width: 200,
        height: 50,
        margin:5,
        backgroundColor: '#4167db',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 20,
        color: '#fee2b2'
    },
    textInput: {
        fontSize: 20,
        width: 250,
        height:40,
        marginBottom:15,
        borderColor:'#976',
        borderWidth:2,
        borderRadius: 5,
        paddingLeft: 5
    },
    errorText: {
        fontSize: 20,
        color: '#900'
    },

    fullCenteredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    header: {
        backgroundColor: '#37029A',
        width: win.width,
        height: win.width*0.26
    },

    headerImage: {
        flex: 1,
        alignSelf: 'stretch',
        width: win.width,
        height: win.width*0.26,
        resizeMode: 'contain'
    }

});
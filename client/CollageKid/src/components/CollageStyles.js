
import { StyleSheet, Dimensions } from 'react-native';

const win = Dimensions.get('window');

export const styles = StyleSheet.create({
    button: {
        width: 200,
        height: 50,
        borderWidth: 1,
        borderColor: '#054783',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        fontSize: 20,
        fontFamily: 'PT Sans',
        color: '#fff'
    },

    container: {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 3,
        paddingBottom: 30
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
        backgroundColor: '#0d1e33',
        paddingTop: 22,
        paddingBottom: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: win.width,
        height: win.width * 0.26
    },

    headerAlt: {
        backgroundColor: '#011222',
        paddingBottom: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: win.width,
        height: win.width * 0.26
    },

    headerImage: {
        flex: 1,
        alignSelf: 'stretch',
        width: win.width,
        height: win.width * 0.25,
        resizeMode: 'contain'
    },

    iconHolder: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80

    },

    icon: {
        width: 30,
        height: 30
    },

    imageBG: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },

    instructionsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    instructions: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'PT Sans',
        paddingLeft: 40,
        paddingRight: 40,
        textAlign: 'center'
    },

    loginForm: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        paddingLeft: 40,
        paddingRight: 40,
        paddingBottom: 20,
        paddingTop: 20,
        marginTop: 40,
        marginBottom: 40
    },

    navContainer: {
        // borderTopColor: '#011222',
        // borderTopWidth: 3,
        // borderBottomColor: '#011222',
        // borderBottomWidth: 3,
        borderColor: '#0d1e33',
        borderWidth: 5,
        //backgroundColor: '#011a21',
        backgroundColor: '#1a2f65',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 80,
        alignSelf: 'stretch'
    },

    navText: {
        fontSize: 14,
        fontFamily: 'PT Sans',
        color: '#fff',
        paddingTop: 5
    },

    navTextDisabled: {
        fontSize: 18,
        fontFamily: 'PT Sans',
        color: '#333'
    },

    previewIcons: {
        width: ((win.width - 40) / 3) - 10,
        height: ((win.width - 40) / 3) - 10,
        margin: 5
    },

    previewIconHolders: {
        width: ((win.width - 40) / 3),
        height: ((win.width - 40) / 3)
    },

    textInput: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'PT Sans',
        width: 250,
        height: 40,
        marginTop: 20,
        borderColor: '#3b5998',
        borderWidth: 2,
        borderRadius: 5,
        paddingLeft: 5
    },

    utilButton: {
        width: 150,
        height: 50,
        margin: 15,
        borderWidth: 1,
        borderColor: '#f2fffc',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },

    utilButtonText: {
        fontSize: 16,
        fontFamily: 'PT Sans',
        color: '#fff'
    },

    utilContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        alignSelf: 'stretch',
        backgroundColor: '#000'
    },

    welcomeInstructions: {
        fontSize: 16,
        fontFamily: 'PT Sans',
        paddingTop: 15,
        color: '#fff',
        paddingLeft: 15,
        paddingRight: 15,
        alignSelf: 'stretch'

    }

});


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
        color: '#dbeeff'
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
        backgroundColor: '#011222',
        paddingTop: 22,
        paddingBottom: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: win.width,
        height: win.width * 0.31
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
        height: win.width * 0.26,
        resizeMode: 'contain'
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
        color: '#cfe7fd',
        fontSize: 22,
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
        borderTopColor: '#000',
        borderTopWidth: 1,
        backgroundColor: '#011222',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 15,
        paddingRight: 15,
        height: 45,
        alignSelf: 'stretch'
    },

    navText: {
        fontSize: 18,
        fontFamily: 'PT Sans',
        color: '#cfe7fd'
    },

    navTextDisabled: {
        fontSize: 18,
        fontFamily: 'PT Sans',
        color: '#333'
    },

    textInput: {
        color: '#cfe7fd',
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
        color: '#f2fffc'
    },

    utilContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        alignSelf: 'stretch',
        backgroundColor: '#000'
    },

    welcomeInstructions: {
        fontSize: 16,
        fontFamily: 'PT Sans',
        paddingTop: 15,
        color: '#cfe7fd',
        paddingLeft: 15,
        paddingRight: 15,
        alignSelf: 'stretch'

    }

});

import React, { useState, useEffect } from 'react';
import { 
  TextInput, 
  View, 
  Alert, 
  StyleSheet, 
  Pressable, 
  Text, 
  Image, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
    const { setIsConnected } = React.useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                setIsConnected(true);
            }
        };

        checkToken();
    }, [navigation]);

    const register = () => {
        if (!username || !email || !password || password !== confirmPassword) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs et vous assurer que les mots de passe correspondent.');
            return;
        }

        axios({
            method: 'post',
            url: 'http://159.89.109.88:8000/api/register',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                name: username,
                email: email,
                password: password,
            },
        })
        .then((response) => {
            if (response.data.status_code === 200) {
                Alert.alert('Inscription réussie', response.data.status_message, [
                    { text: 'OK', onPress: () => navigation.navigate('Connexion') }
                ]);
            } else {
                if (response.data.errorsList) {
                    const errorsList = response.data.errorsList;
                    let errorMessages = '';
                    Object.keys(errorsList).forEach(key => {
                        errorMessages += `${errorsList[key].join(', ')}\n`.replace(/non fourni/g, "requis");
                    });
                    Alert.alert('Erreur', errorMessages);
                }
            }
        })
        .catch((error) => {
            console.error('Erreur:', error);
        });
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <Image source={require('../assets/graphic-assets/Pokeball.png')} style={styles.logo} />
            <View style={styles.innerContainer}>
                <Text style={styles.heading}>Attrapez-les tous !</Text>
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder='Nom d’utilisateur'
                        placeholderTextColor='#FFFFFF'
                    />
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder='Email'
                        placeholderTextColor='#FFFFFF'
                    />
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder='Mot de passe'
                        placeholderTextColor='#FFFFFF'
                    />
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholder='Confirmez votre mot de passe'
                        placeholderTextColor='#FFFFFF'
                    />
                    <Pressable style={styles.button} onPress={register}>
                        <Text style={styles.buttonText}>S'inscrire</Text>
                    </Pressable>
                    <View style={styles.signInContainer}>
                        <Text style={styles.signInText}>Déjà un compte ? </Text>
                        <Pressable onPress={() => navigation.navigate('Connexion')}>
                            <Text style={styles.signInLink}>Connectez-vous</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFCB05',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0046BE',
        marginBottom: 20,
    },
    formContainer: {
        width: '80%',
        alignSelf: 'center',
    },
    input: {
        backgroundColor: '#0046BE',
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        borderRadius: 5,
        padding: 10,
        color: '#FFFFFF',
    },
    button: {
        backgroundColor: '#FF0000',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    signInText: {
        color: '#0046BE',
        fontSize: 16,
    },
    signInLink: {
        color: '#FF0000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

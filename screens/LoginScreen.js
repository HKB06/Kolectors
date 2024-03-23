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
import UserContext from '../contexts/UserContext';

export default function LoginScreen({ navigation }) {
    const { setIsConnected } = React.useContext(AuthContext);
    const { setUser } = React.useContext(UserContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const bootstrapAsync = async () => {
            let userToken;
            try {
                userToken = await AsyncStorage.getItem('token');
            } catch (e) {
                // Restoring token failed
            }
            // After restoring token, we may need to validate it
            setIsConnected(!!userToken);
        };
        bootstrapAsync();
    }, []);

    const login = () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        // Remplacez l'URL par celle de votre API de connexion
        axios.post('http://159.89.109.88:8000/api/login', {
            email: email,
            password: password,
        })
        .then(async (response) => {
            const { token, user } = response.data;
            try {
                await AsyncStorage.setItem('token', token);
                await AsyncStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                setIsConnected(true);
                navigation.navigate('Accueil');
            } catch (e) {
                console.log(e);
            }
        })
        .catch((error) => {
            Alert.alert('Erreur de connexion', "Les informations d'identification ne correspondent pas");
        });
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <Image source={require('../assets/graphic-assets/Pokeball.png')} style={styles.logo} />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder='Email'
                    placeholderTextColor="#666"
                    autoCapitalize='none'
                />
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder='Mot de passe'
                    placeholderTextColor="#666"
                    secureTextEntry
                />
            </View>
            <Pressable style={styles.button} onPress={login}>
                <Text style={styles.buttonText}>Se connecter</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Inscription')}>
                <Text style={styles.signInLink}>Inscrivez-vous</Text>
            </Pressable>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFCB05', // Couleur de fond Pokémon
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    inputContainer: {
        width: '80%',
    },
    input: {
        height: 50,
        backgroundColor: '#0046BE', // Couleur de fond de champ Pokémon
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#FFFFFF', // Couleur de bordure de champ Pokémon
        borderRadius: 5,
        padding: 10,
        color: '#FFFFFF', // Couleur du texte de champ Pokémon
    },
    button: {
        width: '80%',
        backgroundColor: '#FF0000', // Couleur de fond du bouton Pokémon
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF', // Couleur du texte du bouton Pokémon
        fontSize: 18,
    },
    signInLink: {
        color: '#FF0000', // Couleur du texte du lien d'inscription Pokémon
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
    },
});

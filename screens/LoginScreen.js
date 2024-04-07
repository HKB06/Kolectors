import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Animated,
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';

export default function LoginScreen({ navigation }) {
  const { setIsConnected } = useContext(AuthContext);
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const rotateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      rotateAnimation.setValue(0);
    });
  }, []);

  const rotation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    async function bootstrapAsync() {
      let userToken;
      try {
        userToken = await AsyncStorage.getItem('token');
      } catch (e) {
        setError('Erreur lors de la récupération du token');
      }
      setIsConnected(!!userToken);
    }

    bootstrapAsync();
  }, []);

  const login = async () => {
    setError('');
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await axios.post('http://159.89.109.88:8000/api/login', {
        email: email,
        password: password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const { token, user } = response.data;
      if (token && user) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsConnected(true);
        navigation.navigate('Home'); // Assuming 'Home' is the screen to navigate after login
      } else {
        setError("Les informations d'identification ne correspondent pas");
      }
    } catch (error) {
      setError('Erreur de connexion');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <LinearGradient
        colors={['#171925', '#e73343']}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="items-center justify-center flex-1">
            {/* Déplacer le logo plus près du haut de l'écran */}
            <View className="absolute top-20 w-full items-center">
              <Image 
                source={require('../assets/graphic-assets/KolectorsB.png')}
                className="w-4/5 h-40 resize-contain" // Hauteur ajustée pour correspondre à l'image
              />
            </View>
            {/* Les champs de saisie restent centrés dans la vue */}
            <View className="w-4/5 flex-row items-center mb-2 mt-48">
              <Animated.Image 
                source={require('../assets/graphic-assets/Pokeball.png')}
                className="w-6 h-6 resize-contain mr-2"
                style={{ transform: [{ rotate: rotation }] }}
              />
              <TextInput
                className="flex-1 h-12 bg-white border border-gray-300 rounded-md pl-2"
                value={email}
                onChangeText={setEmail}
                placeholder='Email'
                placeholderTextColor="#666"
                autoCapitalize='none'
              />
              <Animated.Image 
                source={require('../assets/graphic-assets/Pokeball.png')}
                className="w-6 h-6 resize-contain ml-2"
                style={{ transform: [{ rotate: rotation }] }}
              />
            </View>
            {error && <Text className="text-white text-center w-4/5">{error}</Text>}
            <View className="w-4/5 flex-row items-center mb-4 mt-4">
              <Animated.Image 
                source={require('../assets/graphic-assets/Pokeball.png')}
                className="w-6 h-6 resize-contain mr-2"
                style={{ transform: [{ rotate: rotation }] }}
              />
              <View className="flex-1 flex-row items-center border border-gray-300 bg-white rounded-md">
                <TextInput
                  className="flex-1 pl-2 pr-2 h-12" // Ajuster le padding pour les pokeballs
                  value={password}
                  onChangeText={setPassword}
                  placeholder='Mot de passe'
                  placeholderTextColor="#666"
                  secureTextEntry={!passwordVisible}
                />
                <TouchableOpacity
                  className="absolute right-2"
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <MaterialCommunityIcons 
                    name={passwordVisible ? 'eye-off' : 'eye'} 
                    size={24} 
                    color="grey"
                  />
                </TouchableOpacity>
              </View>
              <Animated.Image 
                source={require('../assets/graphic-assets/Pokeball.png')}
                className="w-6 h-6 resize-contain ml-2"
                style={{ transform: [{ rotate: rotation }] }}
              />
            </View>
            <TouchableOpacity 
              className="w-4/5 bg-red-500 rounded-lg py-1 items-center mb-4"
              onPress={login}
            >
              <Text className="text-white font-bold text-lg">Se connecter</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-4/5 bg-blue-500 rounded-lg py-1 items-center"
              onPress={() => navigation.navigate('Inscription')}
            >
              <Text className="text-white font-bold text-lg">Inscrivez-vous</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

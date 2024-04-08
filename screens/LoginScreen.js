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
        navigation.navigate('Accueil');
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
            <View className="absolute top-20 w-full items-center">
              <Image 
                source={require('../assets/graphic-assets/KolectorsB.png')}
                className="w-4/5 h-40 resize-contain"
              />
            </View>
            {error && <Text className="text-white text-center w-4/5 my-4">{error}</Text>}
            <View className="w-4/5 mt-64">
              <TextInput
                className="bg-white h-12 my-2 border border-gray-300 rounded-md px-4"
                value={email}
                onChangeText={setEmail}
                placeholder='Email'
                placeholderTextColor="#666"
                autoCapitalize='none'
                keyboardType='email-address'
              />
              <View className="flex-row items-center border border-gray-300 bg-white rounded-md px-2 h-12 my-2">
                <TextInput
                  className="flex-1"
                  value={password}
                  onChangeText={setPassword}
                  placeholder='Mot de passe'
                  placeholderTextColor="#666"
                  secureTextEntry={!passwordVisible}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                  <MaterialCommunityIcons 
                    name={passwordVisible ? 'eye-off' : 'eye'} 
                    size={24} 
                    color="grey"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                className="bg-red-500 rounded-lg py-3 my-2 items-center"
                onPress={login}
              >
                <Text className="text-white font-bold text-lg">Se connecter</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-center mt-4">
              <Text className="text-white">Pas de compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
                <Text className="text-red-500 font-bold">Inscrivez-vous</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

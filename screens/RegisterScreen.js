import React, { useState, useEffect, useContext } from 'react';
import {
  TextInput,
  View,
  Alert,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { setIsConnected } = useContext(AuthContext);
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
  }, []);

  const register = async () => {
    if (!username || !email || !password || password !== confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs et vous assurer que les mots de passe correspondent.');
      return;
    }
    axios({
      method: 'post',
      url: 'http://159.89.109.88:8000/api/register',
      data: {
        name: username,
        email: email,
        password: password,
      },
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
      if (response.data.token) {
        AsyncStorage.setItem('token', response.data.token);
        setIsConnected(true);
        navigation.navigate('Home');
      } else {
        Alert.alert('Erreur d\'inscription', response.data.message);
      }
    })
    .catch(error => {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Un problème est survenu lors de l\'inscription.');
    });
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
            <Image 
              source={require('../assets/graphic-assets/KolectorsB.png')}
              className="w-4/5 h-40 resize-contain mt-6"
            />
            <TextInput
              className="bg-white w-4/5 h-12 my-2 border border-gray-300 rounded-md px-4"
              value={username}
              onChangeText={setUsername}
              placeholder='Nom d’utilisateur'
              placeholderTextColor="#666"
              autoCapitalize='none'
            />
            <TextInput
              className="bg-white w-4/5 h-12 my-2 border border-gray-300 rounded-md px-4"
              value={email}
              onChangeText={setEmail}
              placeholder='Email'
              placeholderTextColor="#666"
              autoCapitalize='none'
            />
            <TextInput
              className="bg-white w-4/5 h-12 my-2 border border-gray-300 rounded-md px-4"
              value={password}
              onChangeText={setPassword}
              placeholder='Mot de passe'
              placeholderTextColor="#666"
              secureTextEntry={true}
            />
            <TextInput
              className="bg-white w-4/5 h-12 my-2 border border-gray-300 rounded-md px-4"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder='Confirmez le mot de passe'
              placeholderTextColor="#666"
              secureTextEntry={true}
            />
            <TouchableOpacity 
              className="bg-red-500 w-4/5 rounded-lg py-3 my-2 items-center"
              onPress={register}
            >
              <Text className="text-white font-bold text-lg">S'inscrire</Text>
            </TouchableOpacity>
            <View className="flex-row justify-center mt-4">
              <Text className="text-white">Déjà un compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Connexion')}>
                <Text className="text-red-500 font-bold">Connectez-vous</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

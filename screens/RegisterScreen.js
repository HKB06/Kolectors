import React, { useState, useContext } from 'react';
import {
  TextInput,
  View,
  Alert,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { setIsConnected } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const register = async () => {
    setError('');
    if (!username || !email || !password || password !== confirmPassword) {
      setError('Veuillez remplir tous les champs et vous assurer que les mots de passe correspondent.');
      return;
    }
    axios({
      method: 'post',
      url: 'https://api.kolectors.live/api/register',
      data: {
        name: username,
        email: email,
        password: password,
      },
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
      if (response.data.status_code === 201) {
        Alert.alert('Succès', response.data.status_message || 'Inscription réussie !', [
          { text: 'OK', onPress: () => navigation.navigate('Connexion') }
        ]);
      } else {
        let message = response.data.status_message;
        if(response.data.errorsList) {
          message += ": " + Object.values(response.data.errorsList).map(error => error.join(', ')).join('. ');
        }
        setError(message);
      }
    })
    .catch(error => {
      let message = error.response?.data?.status_message || 'Un problème est survenu lors de l\'inscription.';
      if(error.response?.data?.errorsList) {
        message += ": " + Object.values(error.response.data.errorsList).map(error => error.join(', ')).join('. ');
      }
      setError(message);
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior="padding"
      className="flex-1"
    >
      <LinearGradient
        colors={['#171925', '#e73343']}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
          <View className="items-center w-full pt-20">
            <Image 
              source={require('../assets/graphic-assets/KolectorsB.png')}
              className="w-4/5 h-40 resize-contain"
            />
            {error !== '' && (
              <Text className="text-white text-center px-4 py-2">
                {error}
              </Text>
            )}
            <View className="w-4/5 my-8">
              <TextInput
                className="bg-white h-12 my-2 border border-gray-300 rounded-md px-4"
                value={username}
                onChangeText={setUsername}
                placeholder='Nom d’utilisateur'
                placeholderTextColor="#666"
                autoCapitalize='none'
              />
              <TextInput
                className="bg-white h-12 my-2 border border-gray-300 rounded-md px-4"
                value={email}
                onChangeText={setEmail}
                placeholder='Email'
                placeholderTextColor="#666"
                keyboardType='email-address'
                autoCapitalize='none'
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
              <View className="flex-row items-center border border-gray-300 bg-white rounded-md px-2 h-12 my-2">
                <TextInput
                  className="flex-1"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder='Confirmez le mot de passe'
                  placeholderTextColor="#666"
                  secureTextEntry={!confirmPasswordVisible}
                />
                <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                  <MaterialCommunityIcons 
                    name={confirmPasswordVisible ? 'eye-off' : 'eye'} 
                    size={24} 
                    color="grey"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                className="bg-red-500 rounded-lg py-3 my-2 items-center"
                onPress={register}
              >
                <Text className="text-white font-bold text-lg">S'inscrire</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-center mt-4 mb-4">
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

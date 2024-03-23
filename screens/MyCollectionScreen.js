// Importations des dépendances
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../contexts/AuthContext'; 

// Composant MyCollectionScreen
export default function MyCollectionScreen({ route, navigation }) {
  // Utilisation du contexte d'authentification
  const { setIsConnected } = React.useContext(AuthContext);

  // États pour les données du formulaire
  const [pokemonName, setPokemonName] = useState('');
  const [pokemonLevel, setPokemonLevel] = useState('');

  // Fonction pour envoyer les données du formulaire
  const addPokemonToCollection = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      // Envoi des données du formulaire au backend
      const response = await axios.post('http://159.89.109.88:8000/api/user/add-pokemon', {
        name: pokemonName,
        level: pokemonLevel,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      // Traitement de la réponse du backend
      if (response.data.success) {
        Alert.alert('Succès', 'Pokémon ajouté à votre collection avec succès.');
      } else {
        Alert.alert('Erreur', 'Erreur lors de l\'ajout du Pokémon à votre collection.');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Affichage du formulaire d'ajout de Pokémon */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          value={pokemonName}
          onChangeText={setPokemonName}
          placeholder="Nom du Pokémon"
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          value={pokemonLevel}
          onChangeText={setPokemonLevel}
          placeholder="Extention du Pokémon"
          placeholderTextColor="#666"
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={addPokemonToCollection}>
          <Text style={styles.buttonText}>Ajouter à la collection</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    paddingTop: 20,
  },
  formContainer: {
    width: '80%',
  },
  input: {
    height: 50,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  button: {
    width: '100%',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

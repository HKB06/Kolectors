import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../contexts/AuthContext'; // Assurez-vous que le chemin est correct
import { set } from 'react-hook-form';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';


export default function ExtentionScreen({ route, navigation }) {
    const [songs, setSongs] = useState([]);
    const { setIsConnected } = React.useContext(AuthContext);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          console.log(token);
  
          const response = await axios({
            method: 'get',
            url: 'http://64.226.74.198:8000/api/songs/',
            headers: {
              'Authorization': `Bearer ${token}`
            },
          });
  
          if (response.data.success === true) {
            setSongs(response.data.songs);
            console.log(response.data.songs);
          } else {
            if (response.data.errorsList) {
              const errorsList = response.data.errorsList;
              let errorMessages = '';
              Object.keys(errorsList).forEach(key => {
                errorMessages += `${errorsList[key].join(', ')}\n`.replace(/non fourni/g, "requis");
              });
              console.log(errorMessages);
              errorMessages = errorMessages.trim();
              Alert.alert('Erreur', errorMessages);
            }
          }
        } catch (error) {
          Alert.alert('Erreur');
          console.log(error);
        }
      };
  
      fetchData();
    }, []);

return (
    <View style={styles.container}>
        <Text style={styles.title}>Mes Beats </Text>
        {songs.map((song, index) => (
            <View style={styles.song}key={index}>
                <Text>{song.title}</Text>
                <Text>{song.artist_name}</Text>
            </View>
        ))}
    </View>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    song: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 8,
        width: '20%',
    },
});
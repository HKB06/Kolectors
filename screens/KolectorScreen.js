import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const KolectorScreen = ({ navigation }) => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await axios.get('https://api.pokemontcg.io/v2/sets', {
          headers: {
            'X-Api-Key': '5ee2f93b-faca-4e9d-a5c7-0c485097454e'
          }
        });
        setSets(response.data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des sets: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  const renderSet = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SetDetails', { setId: item.id })}
    >
      <Image style={styles.setImage} source={{ uri: item.images.logo }} />
      <Text style={styles.setText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <LinearGradient
      colors={['#171925', '#e73343']}
      style={styles.container}
    >
      <FlatList
        data={sets}
        renderItem={renderSet}
        keyExtractor={item => item.id}
        numColumns={2}
        style={styles.list}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    marginVertical: 20,
  },
  card: {
    flex: 1,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#171925', // Vous pouvez ajuster cette couleur comme vous le souhaitez
    borderRadius: 10,
    overflow: 'hidden'
  },
  setImage: {
    width: 150, // Ajustez la taille comme vous le souhaitez
    height: 100,
    resizeMode: 'contain'
  },
  setText: {
    color: 'white',
    marginTop: 8,
    textAlign: 'center'
  },
  // Ajoutez ici tous les styles supplémentaires que vous pourriez avoir
});

export default KolectorScreen;

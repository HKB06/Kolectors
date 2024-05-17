import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import CardModal from './CardModal';
import LoadingIndicator from './LoadingIndicator';

const SearchCardsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchCollectedCards = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('https://api.kolectors.live/api/collections', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setCollectedCards(response.data.map(card => card.pokemon_card_id));
        } catch (error) {
          console.error('Error fetching collected cards:', error);
        }
      }
    };
    fetchCollectedCards();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://api.pokemontcg.io/v2/cards', {
        params: { q: `name:${searchQuery}` }
      });
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Error searching for cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item) => {
    setSelectedCard(item);
    setModalVisible(true);
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openModal(item)}
    >
      <Image source={{ uri: item.images.small }} style={styles.cardImage} />
      <Text style={styles.cardName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#171925', '#e73343']}
      style={styles.container}
    >
      <TextInput
        style={styles.input}
        placeholder="Search Pokémon card..."
        placeholderTextColor="#ccc"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
      {loading ? (
        <LoadingIndicator isLoading={loading} />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
        />
      )}
      {selectedCard && (
        <CardModal
          isVisible={modalVisible}
          card={selectedCard}
          onClose={() => setModalVisible(false)}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#171925',
  },
  input: {
    height: 40,
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#e73343',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  card: {
    margin: 2,
    backgroundColor: 'transparent',
    borderRadius: 0,
    overflow: 'visible',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 160,
    aspectRatio: 63 / 88,
    resizeMode: 'contain',
  },
  cardName: {
    textAlign: 'center',
    fontSize: 12,
    color: 'white',
    marginTop: 4,
  },
});

export default SearchCardsScreen;

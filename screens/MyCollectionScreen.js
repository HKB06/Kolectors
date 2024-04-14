import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';

const SearchCardsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://api.pokemontcg.io/v2/cards', {
        params: {
          q: `name:${searchQuery}`
        }
      });
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Error searching for cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image
        source={{ uri: item.images.small }}
        style={styles.cardImage}
      />
      <Text style={styles.cardName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search Pokémon card..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title="Search" onPress={handleSearch} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: 120,
    aspectRatio: 63 / 88,
    resizeMode: 'contain',
  },
  cardName: {
    marginTop: 5,
    textAlign: 'center',
    fontFamily: 'PoppinsBold',
    fontSize: 12,
  },
});

export default SearchCardsScreen;

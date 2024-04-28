import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, Modal, Alert } from 'react-native';
import axios from 'axios';
import AnimatedPokeball from './AnimatedPokeball'; // Import du composant d'animation

const SearchCardsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

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

  const openModal = (item) => {
    setSelectedCard(item);
    setModalVisible(true);
  };

  const addToCollection = async (cardId) => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            Alert.alert("Erreur", "Aucun token d'authentification trouvé.");
            return;
        }

        const response = await axios.post(`https://api.kolectors.live/api/user/add-card/${cardId}`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.status_code === 200) {
            Alert.alert("Succès", "Carte ajoutée à votre collection !");
        } else {
            Alert.alert("Erreur", response.data.message);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la carte à la collection:', error);
        Alert.alert("Erreur", "Problème lors de l'ajout de la carte à la collection.");
    }
};



  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openModal(item)}
    >
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
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
      {loading ? (
        <AnimatedPokeball />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Image
              style={styles.modalImage}
              source={{ uri: selectedCard?.images.large }}
            />
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => addToCollection(selectedCard)}
            >
              <Text style={styles.textStyle}>Add to Collection</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ffcb05',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#2a75bb',
    fontSize: 16,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
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
    fontSize: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalImage: {
    width: 200,
    height: 280,
    resizeMode: 'contain'
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
});

export default SearchCardsScreen;

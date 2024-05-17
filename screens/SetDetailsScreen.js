import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import LoadingIndicator from '../screens/LoadingIndicator';
import CardModal from './CardModal'; // Import the CardModal component

const SetDetailsScreen = ({ route }) => {
  const { setId } = route.params;
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`, {
          headers: {
            'X-Api-Key': 'YOUR_API_KEY'
          }
        });
        setCards(response.data.data);
      } catch (error) {
        console.error('Error while fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [setId]);

  const openModal = (card) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  if (loading) {
    return <LoadingIndicator isLoading={loading} />;
  }

  const renderCard = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)} style={styles.card}>
      <Image
        style={styles.cardImage}
        source={{ uri: item.images.small }}
      />
      <Text style={styles.cardName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
      />
      {selectedCard && (
        <CardModal
          isVisible={modalVisible}
          card={selectedCard}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  card: {
    flex: 1,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: undefined,
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

export default SetDetailsScreen;

import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Alert, Dimensions } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const CardModal = ({ isVisible, card, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [collectedCards, setCollectedCards] = useState([]);
  const [userCardIdMap, setUserCardIdMap] = useState({});

  useEffect(() => {
    if (isVisible) {
      fetchCollectedCards();
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0); // Reset animation value
    }
  }, [isVisible]);

  const fetchCollectedCards = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('https://api.kolectors.live/api/collections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const cardIdMap = {};
        response.data.forEach(card => {
          cardIdMap[card.pokemon_card_id] = card.id;
        });
        setCollectedCards(response.data.map(card => card.pokemon_card_id));
        setUserCardIdMap(cardIdMap);
      } catch (error) {
        console.error('Error fetching collected cards:', error);
      }
    }
  };

  const addToCollection = async (card) => {
    const cardId = card.id;

    if (collectedCards.includes(cardId)) {
      Alert.alert("Erreur", "Cette carte est déjà dans votre collection.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Erreur", "Aucun token d'authentification trouvé.");
        return;
      }

      const response = await axios.post('https://api.kolectors.live/api/collections/add', {
        pokemon_card_id: cardId
      }, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Succès", "Carte ajoutée à votre collection !");
        const newCardId = response.data.id;
        setCollectedCards([...collectedCards, cardId]);
        setUserCardIdMap({ ...userCardIdMap, [cardId]: newCardId });
        onClose(); // Close modal after adding to collection
      } else {
        Alert.alert("Erreur", `Un problème est survenu : ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur lors de l’ajout de la carte à la collection:', error);
      Alert.alert("Erreur", `Problème lors de l'ajout de la carte à la collection: ${error.message}`);
    }
  };

  const deleteFromCollection = async (card) => {
    const cardId = card.id;
    const userCardId = userCardIdMap[cardId];

    if (!collectedCards.includes(cardId)) {
      Alert.alert("Erreur", "Cette carte n'est pas dans votre collection.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Erreur", "Aucun token d'authentification trouvé.");
        return;
      }

      const response = await axios.delete(`https://api.kolectors.live/api/collections/${userCardId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.status === 204) {
        Alert.alert("Succès", "Carte supprimée de votre collection !");
        setCollectedCards(collectedCards.filter(id => id !== cardId));
        const newCardIdMap = { ...userCardIdMap };
        delete newCardIdMap[cardId];
        setUserCardIdMap(newCardIdMap);
        onClose(); // Close modal after deleting from collection
      } else {
        Alert.alert("Erreur", `Un problème est survenu : ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la carte de la collection:', error);
      Alert.alert("Erreur", `Problème lors de la suppression de la carte de la collection: ${error.message}`);
    }
  };

  if (!card) return null;

  const imageUrl = card.images && card.images.large ? card.images.large : null;

  if (!imageUrl) {
    console.error('Image URL est non définie');
    return null;
  }

  const prices = card.tcgplayer && card.tcgplayer.prices ? card.tcgplayer.prices.holofoil : null;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.imageContainer}>
              <ImageViewer
                imageUrls={[{ url: imageUrl }]}
                enableSwipeDown={true}
                onSwipeDown={onClose}
                renderIndicator={() => null} // Removes the "1/1" text
                backgroundColor="white" // Sets background color to white
                style={styles.imageViewer}
              />
            </View>
            <ScrollView style={styles.scrollView}>
              <Text style={styles.cardTitle}>{card.name}</Text>
              <Text style={styles.set}>{card.set.name}</Text>
              <Text style={styles.rarity}>Rareté: {card.rarity}</Text>
              <Text style={styles.artist}>Artiste: {card.artist}</Text>
              {prices && (
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>Bas: ${prices.low}</Text>
                  <Text style={styles.price}>Mid: ${prices.mid}</Text>
                  <Text style={styles.price}>Haut: ${prices.high}</Text>
                  <Text style={styles.price}>Marché: ${prices.market}</Text>
                </View>
              )}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.addButton]} onPress={() => addToCollection(card)}>
                  <Text style={styles.buttonText}>Ajouter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => deleteFromCollection(card)}>
                  <Text style={styles.buttonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.9, // Dynamic width for consistent scrolling
    maxHeight: height * 0.85, // Increased maxHeight to ensure all content fits
    position: 'relative',
    marginHorizontal: width * 0.05,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e73343',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: 400, // Increased height to fit more content
    marginBottom: 20,
  },
  imageViewer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  set: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  rarity: {
    fontSize: 16,
    color: '#888',
    marginBottom: 5,
    textAlign: 'center',
  },
  artist: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
  priceContainer: {
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButton: {
    top: -10,
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    top: -10,
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CardModal;

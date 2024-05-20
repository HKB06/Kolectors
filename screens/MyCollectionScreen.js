import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ActivityIndicator, Dimensions, Alert, FlatList, Animated, Easing } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import AuthContext from '../contexts/AuthContext';
import { calculateTotalValue } from './CalculCard';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const profileImages = [
  require('../assets/graphic-assets/avatar1.png'),
  require('../assets/graphic-assets/avatar2.png'),
  require('../assets/graphic-assets/avatar3.png'),
  require('../assets/graphic-assets/avatar4.png'),
  require('../assets/graphic-assets/avatar5.png'),
  require('../assets/graphic-assets/avatar6.png'),
];

const FilterModal = ({ visible, onClose, selectedValue, items, onValueChange, title }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          <Picker.Item label={`Sélectionnez ${title.toLowerCase()}`} value="" />
          {items.map(item => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function MyCollectionScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [collection, setCollection] = useState([]);
  const [filteredCollection, setFilteredCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sets, setSets] = useState([]);
  const [extensions, setExtensions] = useState([]);
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedExtension, setSelectedExtension] = useState('');
  const [isSetPickerVisible, setSetPickerVisible] = useState(false);
  const [isExtensionPickerVisible, setExtensionPickerVisible] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const fetchData = async () => {
    const token = await AsyncStorage.getItem('token');
    const savedImageIndex = await AsyncStorage.getItem('profileImageIndex');
    if (savedImageIndex !== null) {
      setProfileImage(profileImages[parseInt(savedImageIndex)]);
    }
    if (token) {
      fetchCollectionData(token);
    } else {
      setLoading(false);
      setError('No token found. Please log in again.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();

    return () => {
      fadeAnim.setValue(0); // Reset animation value when screen loses focus
    };
  }, [fadeAnim]);

  const fetchCollectionData = async (token) => {
    try {
      const response = await axios.get('https://api.kolectors.live/api/collections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const detailedCards = await Promise.all(response.data.map(async (card) => {
        await new Promise(resolve => setTimeout(resolve, 200)); // Delay to avoid 429
        const cardResponse = await axios.get(`https://api.pokemontcg.io/v2/cards/${card.pokemon_card_id}`);
        const cardData = cardResponse.data.data;
        return { ...card, details: cardData };
      }));

      setCollection(detailedCards);
      setFilteredCollection(detailedCards);
      extractSetsAndExtensions(detailedCards);
      const total = calculateTotalValue(detailedCards);
      setTotalValue(total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching collection data:', error);
      setLoading(false);
      setError('Failed to fetch collection data. Please try again.');
    }
  };

  const extractSetsAndExtensions = (cards) => {
    const sets = [...new Set(cards.map(card => card.details.set.name))];
    const extensions = [...new Set(cards.map(card => card.details.set.series))];
    setSets(sets);
    setExtensions(extensions);
  };

  const deleteCard = async (userCardId) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette carte de votre collection ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                console.error('No token found');
                return;
              }

              const response = await axios.delete(`https://api.kolectors.live/api/collections/${userCardId}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
              });

              if (response.status === 204) {
                Alert.alert("Succès", "Carte supprimée de votre collection !");
                fetchData();
              }
            } catch (error) {
              console.error('Error deleting card:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la carte. Veuillez réessayer.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const filterBySet = (set) => {
    if (set) {
      const filtered = collection.filter(card => card.details.set && card.details.set.name === set);
      setFilteredCollection(filtered);
    } else {
      setFilteredCollection(collection);
    }
    setSelectedSet(set);
  };

  const filterByExtension = (extension) => {
    if (extension) {
      const filtered = collection.filter(card => card.details.set && card.details.set.series === extension);
      setFilteredCollection(filtered);
    } else {
      setFilteredCollection(collection);
    }
    setSelectedExtension(extension);
  };

  const openModal = (imageUrl) => {
    setSelectedImage([{ url: imageUrl }]);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  const renderCard = ({ item }) => (
    <Animated.View style={styles.cardWrapper}>
      <TouchableOpacity onPress={() => openModal(item.details.images.large)}>
        <View style={styles.cardContainer}>
          {item.details.images && item.details.images.large ? (
            <Image source={{ uri: item.details.images.large }} style={styles.cardImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Image non disponible</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteCard(item.id)}>
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFCB05" />
        <Text style={styles.loadingText}>Chargement de la collection...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#171925', '#e73343']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ma Collection</Text>
        {profileImage && (
          <Image source={profileImage} style={styles.profileIcon} />
        )}
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setSetPickerVisible(true)} style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Filtrer par Set</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setExtensionPickerVisible(true)} style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Filtrer par Extension</Text>
        </TouchableOpacity>
      </View>
      <Animated.View style={[styles.userInfoContainer, { opacity: fadeAnim }]}>
        <View style={styles.userInfoRow}>
          <Text style={styles.label}>Valeur totale :</Text>
          <Text style={styles.value}>${totalValue.toFixed(2)}</Text>
        </View>
        <View style={styles.userInfoRow}>
          <Text style={styles.label}>Cartes :</Text>
          <Text style={styles.value}>{collection.length}</Text>
        </View>
      </Animated.View>

      <FilterModal
        visible={isSetPickerVisible}
        onClose={() => setSetPickerVisible(false)}
        selectedValue={selectedSet}
        items={sets}
        onValueChange={filterBySet}
        title="Set"
      />

      <FilterModal
        visible={isExtensionPickerVisible}
        onClose={() => setExtensionPickerVisible(false)}
        selectedValue={selectedExtension}
        items={extensions}
        onValueChange={filterByExtension}
        title="Extension"
      />

      <FlatList
        data={filteredCollection}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.collectionContainer}
      />

      {selectedImage && (
        <Modal visible={isModalVisible} transparent={true} onRequestClose={closeModal}>
          <ImageViewer imageUrls={selectedImage} onSwipeDown={closeModal} enableSwipeDown />
        </Modal>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFCB05',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
  },
  filterButton: {
    backgroundColor: '#FFCB05',
    padding: 10,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#171925',
    fontWeight: 'bold',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFCB05',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  collectionContainer: {
    alignItems: 'center',
  },
  cardWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardContainer: {
    margin: 10,
    alignItems: 'center',
    width: (width / 3) - 20,
  },
  cardImage: {
    width: '100%',
    height: 160,
    resizeMode: 'contain',
  },
  placeholderImage: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#666',
    textAlign: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#e74c3c',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFCB05',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    width: 200,
    height: 150,
  },
  closeButton: {
    backgroundColor: '#FFCB05',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#171925',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

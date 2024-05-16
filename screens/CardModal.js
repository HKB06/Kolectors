import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

const CardModal = ({ isVisible, card, onClose, onAddToCollection, onDeleteFromCollection }) => {
  if (!card) return null;

  const imageUrl = card.images && card.images.large ? card.images.large : null;

  if (!imageUrl) {
    console.error('Image URL is not defined');
    return null;
  }

  const images = [
    {
      url: imageUrl,
    },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalContent}>
          <View style={styles.imageContainer}>
            <ImageViewer
              imageUrls={images}
              enableSwipeDown={true}
              onSwipeDown={onClose}
              renderIndicator={() => null} // Removes the "1/1" text
              backgroundColor="white" // Sets background color to white
            />
          </View>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.cardTitle}>{card.name}</Text>
            <Text style={styles.set}>{card.set.name}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={() => onAddToCollection(card)}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => onDeleteFromCollection(card)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
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
    width: '90%',
    maxHeight: '80%',
  },
  imageContainer: {
    width: 300,
    height: 300,
  },
  scrollView: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  set: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonClose: {
    marginTop: 10,
  },
});

export default CardModal;

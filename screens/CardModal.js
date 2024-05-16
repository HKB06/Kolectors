import React, { useState } from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

const CardModal = ({ isVisible, card, onClose, onAddToCollection, onDeleteFromCollection }) => {
  const [isImageZoomVisible, setIsImageZoomVisible] = useState(false);

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

  const openImageZoom = () => {
    console.log('Opening image zoom');
    setIsImageZoomVisible(true);
  };

  const closeImageZoom = () => {
    console.log('Closing image zoom');
    setIsImageZoomVisible(false);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={openImageZoom}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.cardImage}
              />
            </TouchableOpacity>
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

      <Modal
        visible={isImageZoomVisible}
        transparent={true}
        onRequestClose={closeImageZoom}
      >
        <View style={styles.zoomContainer}>
          <ImageViewer
            imageUrls={images}
            enableSwipeDown={true}
            onSwipeDown={closeImageZoom}
            onCancel={closeImageZoom}
          />
          <TouchableOpacity style={styles.closeImageZoomButton} onPress={closeImageZoom}>
            <Text style={styles.closeButtonText}>Close Image</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
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
  cardImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
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
  zoomContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeImageZoomButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CardModal;

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import LoadingIndicator from '../screens/LoadingIndicator';

const FilterModal = ({ visible, onClose, selectedYear, years, onValueChange }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Picker
          selectedValue={selectedYear}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          {years.map(year => (
            <Picker.Item key={year} label={year} value={year} />
          ))}
        </Picker>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const KolectorScreen = ({ navigation }) => {
  const [sets, setSets] = useState([]);
  const [selectedYear, setSelectedYear] = useState('Toutes');
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);
  const [isPickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await axios.get('https://api.pokemontcg.io/v2/sets', {
          headers: {
            'X-Api-Key': ''
          }
        });
        const setsData = response.data.data;
        setSets(setsData.reverse());
        const yearsExtracted = [...new Set(setsData.map(set => set.releaseDate.split('-')[0]))].sort().reverse();
        setYears(['Toutes', ...yearsExtracted]);
      } catch (error) {
        console.error('Error while fetching sets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  if (loading) {
    return <LoadingIndicator isLoading={loading} />;
  }

  const filteredSets = selectedYear === 'Toutes'
    ? sets
    : sets.filter(set => set.releaseDate.split('-')[0] === selectedYear);

  const renderSet = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SetDetails', { setId: item.id })}
    >
      <Image
        style={styles.setImage}
        source={{ uri: item.images.logo }}
      />
      <Text style={styles.setText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#171925', '#e73343']}
      style={styles.container}
    >
      <TouchableOpacity onPress={() => setPickerVisible(true)} style={styles.filterButton}>
        <Text style={styles.filterText}>Filtrer par année</Text>
      </TouchableOpacity>

      <FilterModal
        visible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        selectedYear={selectedYear}
        years={years}
        onValueChange={(itemValue) => setSelectedYear(itemValue)}
      />

      <FlatList
        data={filteredSets}
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
    backgroundColor: '#060d38', // Couleur de fond de la carte
    borderRadius: 10,
    overflow: 'hidden',
  },
  setImage: {
    width: 150,
    height: 100,
    resizeMode: 'contain',
  },
  setText: {
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
  flatList: {
    marginTop: 5,
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 5,
    margin: 10,
    padding: 10,
    alignItems: 'center',
  },
  filterText: {
    color: 'black',
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
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  picker: {
    width: 250,
    height: 150,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    marginTop: 70,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default KolectorScreen;

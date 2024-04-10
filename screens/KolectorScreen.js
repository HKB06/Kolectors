import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const KolectorScreen = ({ navigation }) => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('all');
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
        setSets(setsData);
      } catch (error) {
        console.error('Error while fetching sets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  const handleYearFilterPress = () => {
    setPickerVisible(true);
  };

  const handlePickerSelect = (itemValue) => {
    setYearFilter(itemValue);
    setPickerVisible(false);
  };

  const filteredSets = sets.filter(set => {
    const matchYear = yearFilter === 'all' || new Date(set.releaseDate).getFullYear().toString() === yearFilter;
    return matchYear;
  });

  const renderSet = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SetDetails', { setId: item.id })}>
      <Image style={styles.setImage} source={{ uri: item.images.logo }} />
      <Text style={styles.setText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#ffffff" style={styles.centered} />;
  }

  return (
    <LinearGradient colors={['#171925', '#e73343']} style={styles.container}>
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterButton} onPress={handleYearFilterPress}>
          <Text style={styles.filterText}>Par année</Text>
        </TouchableOpacity>
        {/* Placeholder for other filters */}
      </View>
      {isPickerVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={isPickerVisible}
          onRequestClose={() => setPickerVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Picker
                selectedValue={yearFilter}
                onValueChange={handlePickerSelect}
                style={styles.picker}
              >
                {/* Add Picker.Item components for each year */}
                <Picker.Item label="Toutes" value="all" />
                {/* Map through years if they are dynamic */}
              </Picker>
            </View>
          </View>
        </Modal>
      )}
      <FlatList
        data={filteredSets}
        renderItem={renderSet}
        keyExtractor={item => item.id}
        numColumns={2}
        style={styles.flatList}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 2,
    borderRadius: 15,
    marginRight: 10,
  },
  filterText: {
    color: '#fff',
  },
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: 'black',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  setText: {
    marginTop: 8,
    color: 'white',
  },
  flatList: {
    marginTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 100,
    height: 160,
  },
});

export default KolectorScreen;

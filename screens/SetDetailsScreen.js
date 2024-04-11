import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const SetDetailsScreen = ({ route }) => {
  const { setId } = route.params;
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`, {
          headers: {
            'X-Api-Key': 'YOUR_API_KEY' // Replace with your actual API key
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

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <Image
        style={styles.cardImage}
        source={{ uri: item.images.small }}
      />
      <Text style={styles.cardName}>{item.name}</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    
    <FlatList
      data={cards}
      renderItem={renderCard}
      keyExtractor={item => item.id}
      numColumns={3} // Changed to display three items per row
      columnWrapperStyle={styles.row}
    />
  );
};

const styles = StyleSheet.create({
  row: {
    justifyContent: 'space-between', // This makes sure space between items is consistent
    paddingHorizontal: 10, // Adjust as per your design requirements
  },
  card: {
    flex: 1,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Assuming cards have a white background
    borderRadius: 10,
    overflow: 'hidden',
    // Add shadow to elevate the card look, adjust according to your design
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
    width: '100%', // Images take full width of the card
    height: undefined,
    aspectRatio: 63 / 88, // The aspect ratio for standard cards; adjust if needed
    resizeMode: 'contain', // Ensures image is not zoomed/stretched
  },
  cardName: {
    padding: 10, // Spacing around text
    textAlign: 'center', // Center text horizontally
    fontFamily: 'Poppins', // Use your preferred font
    fontSize: 12, // Adjust font size as needed
  },
  // Add other styles if needed
});

export default SetDetailsScreen;

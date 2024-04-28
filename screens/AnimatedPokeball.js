// AnimatedPokeball.js
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image } from 'react-native';

const AnimatedPokeball = () => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.loadingContainer}>
      <Animated.Image
        source={require('../assets/graphic-assets/Pokeball.png')} // Assurez-vous que le chemin vers l'image est correct
        style={[styles.pokeball, { transform: [{ rotate: spin }] }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200, // Ajustez selon vos besoins
  },
  pokeball: {
    width: 100,
    height: 100,
  }
});

export default AnimatedPokeball;

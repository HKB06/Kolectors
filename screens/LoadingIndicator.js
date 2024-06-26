import React, { useEffect,useRef, useState } from 'react';
import { Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const messages = ['Accrochez-vous, presque prêt...', 'Chargement de votre collection...', 'Récupération de vos données...'];

const LoadingIndicator = ({ isLoading }) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true
      })
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    );

    spinAnimation.start();
    scaleAnimation.start();

    return () => {
      spinAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((currentMessageIndex) => (currentMessageIndex + 1) % messages.length);
    }, 3000); // Change le message toutes les 3 secondes
    return () => clearInterval(interval);
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  if (!isLoading) return null;

  return (
    <LinearGradient
      colors={['#171925', '#e73343']}
      style={styles.loadingContainer}
    >
      <Animated.Image
        source={require('../assets/graphic-assets/Pokeball.png')}
        style={[styles.pokeball, { transform: [{ rotate: spin }, { scale }] }]}
      />
      <Text style={styles.loadingText}>{messages[messageIndex]}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  pokeball: {
    width: 100,
    height: 100,
    marginBottom: 20
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10
  }
});

export default LoadingIndicator;

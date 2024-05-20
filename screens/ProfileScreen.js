import React, { useState, useEffect, useContext } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Animated, Easing, Modal, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { calculateTotalValue } from './CalculCard';  // Importez la fonction utilitaire

const profileImages = [
 require('../assets/graphic-assets/avatar1.png'),
 require('../assets/graphic-assets/avatar2.png'),
 require('../assets/graphic-assets/avatar3.png'),
 require('../assets/graphic-assets/avatar4.png'),
 require('../assets/graphic-assets/avatar5.png'),
 require('../assets/graphic-assets/avatar6.png'),
];

export default function ProfileScreen({ route, navigation }) {
    const { logout } = useContext(AuthContext);
    const [isConnected, setIsConnected] = useState(AuthContext);
    const [user, setUser] = useState(UserContext);
    const [cardCount, setCardCount] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const [profileImage, setProfileImage] = useState(profileImages[0]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        const checkTokenAndUser = async () => {
            const token = await AsyncStorage.getItem('token');
            const user = JSON.parse(await AsyncStorage.getItem('user'));
            const savedImageIndex = await AsyncStorage.getItem('profileImageIndex');
            if (savedImageIndex !== null) {
                setProfileImage(profileImages[parseInt(savedImageIndex)]);
            }
            setIsConnected(!!token);
            setUser(user);

            if (token) {
                fetchCollectionData(token);
            }
        };
        checkTokenAndUser();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
                easing: Easing.ease,
            }).start();

            return () => {
                fadeAnim.setValue(0); 
            };
        }, [fadeAnim])
    );

    const fetchCollectionData = async (token) => {
        try {
            const response = await axios.get('https://api.kolectors.live/api/collections', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const cards = response.data;

            setCardCount(cards.length);

            const detailedCards = await Promise.all(cards.map(async (card) => {
                const cardResponse = await axios.get(`https://api.pokemontcg.io/v2/cards/${card.pokemon_card_id}`);
                const cardData = cardResponse.data.data;
                return { ...card, details: cardData };
            }));

            const total = calculateTotalValue(detailedCards);  // Utilisez la fonction utilitaire
            setTotalValue(total);
        } catch (error) {
            console.error('Error fetching collection data:', error);
        }
    };

    const handleImageSelection = async (index) => {
        setProfileImage(profileImages[index]);
        await AsyncStorage.setItem('profileImageIndex', index.toString());
        setIsModalVisible(false);
    };

    const refreshData = async () => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            const user = JSON.parse(await AsyncStorage.getItem('user'));
            setUser(user);
            await fetchCollectionData(token);
        }
    };

    if (route.params && route.params.user) {
        const userData = route.params.user;
        setUser(Object.fromEntries(userData));
    }

    return (
        <LinearGradient
            colors={['#171925', '#e73343']}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Animated.View style={[styles.profileContainer, { opacity: fadeAnim }]}>
                    <Image 
                        source={require('../assets/graphic-assets/KolectorsB.png')}
                        style={styles.logo}
                    />
                    <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.avatarContainer}>
                        <Image source={profileImage} style={styles.avatar} />
                        <Icon name="camera" size={30} color="#FFCB05" style={styles.cameraIcon} />
                    </TouchableOpacity>
                    <Text style={styles.name}>{user.name}</Text>
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.label}>Email :</Text>
                        <Text style={styles.value}>{user.email}</Text>
                    </View>
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.label}>Inscription :</Text>
                        <Text style={styles.value}>
                            {`Depuis le ${new Date(user.created_at).toLocaleDateString('fr-FR')}`}
                        </Text>
                    </View>
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.label}>Nombre de cartes :</Text>
                        <Text style={styles.value}>{cardCount}</Text>
                    </View>
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.label}>Valeur totale de la collection :</Text>
                        <Text style={styles.value}>${totalValue.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
                        <Icon name="refresh" size={24} color="#FFF" />
                        <Text style={styles.refreshButtonText}>Rafraîchir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.logoutText}>Déconnexion</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Choisir une photo de profil</Text>
                        <FlatList
                            data={profileImages}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity onPress={() => handleImageSelection(index)}>
                                    <Image source={item} style={styles.modalImage} />
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.modalList}
                        />
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsModalVisible(false)}>
                            <Text style={styles.modalCloseButtonText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    profileContainer: {
        alignItems: 'center',
        backgroundColor: '#232D41',
        borderRadius: 20,
        padding: 30,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    logo: {
        width: '80%',
        height: 100,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: -10, // Adjusted to move the icon lower
        right: 0,
        backgroundColor: '#232D41',
        borderRadius: 15,
        padding: 5,
    },
    name: {
        fontFamily: 'PoppinsBold',
        fontSize: 24,
        color: '#FFCB05',
        marginBottom: 10,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    label: {
        fontFamily: 'PoppinsBold',
        color: '#FFCB05',
        marginRight: 10,
        flex: 1,
    },
    value: {
        fontFamily: 'PoppinsBold',
        color: '#FFF',
        flex: 2,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFCB05',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    refreshButtonText: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#232D41',
        marginLeft: 10,
    },
    logoutButton: {
        backgroundColor: '#FF0000',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    logoutText: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#FFF',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontFamily: 'PoppinsBold',
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
    },
    modalImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginHorizontal: 10,
    },
    modalList: {
        alignItems: 'center',
    },
    modalCloseButton: {
        marginTop: 20,
        backgroundColor: '#e73343',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    modalCloseButtonText: {
        color: '#FFF',
        fontFamily: 'PoppinsBold',
        fontSize: 16,
    },
});

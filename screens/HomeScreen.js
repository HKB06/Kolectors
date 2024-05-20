import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

const profileImages = [
    require('../assets/graphic-assets/avatar1.png'),
    require('../assets/graphic-assets/avatar2.png'),
    require('../assets/graphic-assets/avatar3.png'),
    require('../assets/graphic-assets/avatar4.png'),
    require('../assets/graphic-assets/avatar5.png'),
    require('../assets/graphic-assets/avatar6.png'),
];

export default function HomeScreen({ navigation }) {
    const [userData, setUserData] = useState(null);
    const [avatar, setAvatar] = useState(profileImages[0]);
    const [pieData, setPieData] = useState([]);
    const [lineData, setLineData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchUserData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [])
    );

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const savedImageIndex = await AsyncStorage.getItem('profileImageIndex');

            if (savedImageIndex !== null) {
                setAvatar(profileImages[parseInt(savedImageIndex)]);
            }

            if (!token) {
                console.error('No token found');
                setError('No token found. Please log in again.');
                setLoading(false);
                return;
            }

            const response = await axios.get('https://api.kolectors.live/api/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = response.data;
            setUserData(data);

            const collectionsResponse = await axios.get('https://api.kolectors.live/api/collections', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const collections = collectionsResponse.data;
            updateChartData(collections);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error.response && error.response.status === 401) {
                setError('Unauthorized. Please log in again.');
                await AsyncStorage.removeItem('token');
            } else {
                setError('Failed to fetch user data. Please try again later.');
            }
            setLoading(false);
        }
    };

    const updateChartData = (collections) => {
        const cardsBySeries = collections.reduce((acc, card) => {
            const series = card.set_series; // Utiliser la série de la carte
            if (!acc[series]) {
                acc[series] = 0;
            }
            acc[series]++;
            return acc;
        }, {});

        const totalMoneyOverTime = collections.reduce((acc, card) => {
            const date = card.created_at.split('T')[0];
            const amount = parseFloat(card.price_market);
            if (!isNaN(amount)) {
                if (!acc[date]) {
                    acc[date] = 0;
                }
                acc[date] += amount;
            }
            return acc;
        }, {});

        // Vérifiez et nettoyez les données
        const fetchedPieData = Object.keys(cardsBySeries).map(series => ({
            value: cardsBySeries[series],
            color: getRandomColor(),
            text: series
        }));

        // Trier les dates dans l'ordre chronologique
        const sortedDates = Object.keys(totalMoneyOverTime).sort((a, b) => new Date(a) - new Date(b));
        const fetchedLineData = sortedDates.map(date => ({
            value: totalMoneyOverTime[date],
            label: formatDate(date)
        }));

        setPieData(fetchedPieData);
        setLineData(fetchedLineData);
    };

    const handleRefresh = () => {
        startSpinAnimation();
        fetchUserData();
    };

    const startSpinAnimation = () => {
        rotation.setValue(0);
        Animated.timing(rotation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const renderLegendComponent = () => {
        return (
            <View style={styles.legendContainer}>
                {pieData.map((item, index) => (
                    <View key={index} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                        <Text style={styles.legendText}>{item.text}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFCB05" />
                <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
        );
    }

    return (
        <LinearGradient colors={['#171925', '#e73343']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.profileSection}>
                    <View style={styles.profileInfo}>
                        <Image source={avatar} style={styles.avatar} />
                        {userData && (
                            <Text style={styles.userName}>{userData.name}</Text>
                        )}
                    </View>
                </View>
                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Nombre de cartes par série</Text>
                    <PieChart
                        data={pieData}
                        donut
                        showGradient
                        sectionAutoFocus
                        radius={90}
                        innerRadius={60}
                        innerCircleColor={'#232D41'}
                        isAnimated
                    />
                    {renderLegendComponent()}
                </View>
                <View style={styles.chartContainer}>
                    <Text style={[styles.chartTitle, styles.lineChartTitle]}>Budget journalier de votre collection</Text>
                    <View style={styles.lineChartWrapper}>
                        <LineChart
                            data={lineData}
                            width={260} // Ajustez cette largeur pour s'assurer que le graphique reste dans le cadre
                            height={250}
                            xAxisColor="#6D4C41"
                            yAxisColor="#6D4C41"
                            color="#FFCB05"
                            yAxisTextStyle={{ color: '#6D4C41' }}
                            xAxisTextStyle={{ color: '#6D4C41' }}
                            initialSpacing={10}
                            spacing={40}
                            noOfSections={10}
                            maxValue={Math.max(...lineData.map(d => d.value), 10)}
                            hideDataPoints={false}
                            dataPointsColor="#FFCB05"
                            dataPointsRadius={4}
                            thickness={2}
                            isAnimated
                            animationDuration={1000}
                        />
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingTop: 30,
    },
    profileSection: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 20,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    userName: {
        fontFamily: 'PoppinsBold',
        fontSize: 30,
        color: '#FFCB05',
        marginLeft: 50,
    },
    chartContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        marginBottom: 20,
        padding: 20,
        width: '90%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    chartTitle: {
        color: '#6D4C41',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    lineChartTitle: {
        color: '#6D4C41',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    lineChartWrapper: {
        width: '100%',
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        alignItems: 'center',
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        marginBottom: 10,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    legendText: {
        color: '#6D4C41',
        fontSize: 14,
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
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { BarChart, PieChart } from "react-native-gifted-charts";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
    const [barData, setBarData] = useState([]);
    const [pieData, setPieData] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = await AsyncStorage.getItem('token');
            const savedImageIndex = await AsyncStorage.getItem('profileImageIndex');
            if (savedImageIndex !== null) {
                setAvatar(profileImages[parseInt(savedImageIndex)]);
            }
            if (token) {
                try {
                    const response = await axios.get('https://api.kolectors.live/api/user', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setUserData(response.data);

                    // Update barData and pieData with dynamic values
                    const fetchedBarData = [
                        { value: response.data.wildPokemon || 0, label: 'Pokémon sauvages' },
                        { value: response.data.capturedPokemon || 0, label: 'Pokémon capturés' },
                        { value: response.data.badgesObtained || 0, label: 'Badges obtenus' },
                        { value: response.data.pokedollars || 0, label: 'Pokédollars' },
                        { value: response.data.pokeballs || 0, label: 'Pokéballs' },
                    ];

                    const fetchedPieData = [
                        { value: response.data.wildPokemon || 0, color: '#FFCB05' },
                        { value: response.data.capturedPokemon || 0, color: '#FF0000' },
                        { value: response.data.badgesObtained || 0, color: '#0046BE' },
                    ];

                    setBarData(fetchedBarData);
                    setPieData(fetchedPieData);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, []);

    const renderLegendComponent = () => {
        return (
            <View style={styles.legendContainer}>
                <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#FFCB05' }]} />
                    <Text style={styles.legendText}>Pokémon sauvages</Text>
                </View>
                <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF0000' }]} />
                    <Text style={styles.legendText}>Pokémon capturés</Text>
                </View>
                <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#0046BE' }]} />
                    <Text style={styles.legendText}>Badges obtenus</Text>
                </View>
            </View>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.profileSection}>
                <Image source={avatar} style={styles.avatar} />
                {userData && (
                    <Text style={styles.userName}>{userData.name}</Text>
                )}
            </View>
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Statistiques Pokémon</Text>
                <BarChart
                    data={barData}
                    barWidth={20}
                    spacing={24}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: 'gray' }}
                    noOfSections={3}
                    maxValue={100}
                    isAnimated
                />
            </View>
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Répartition des types</Text>
                <PieChart
                    data={pieData}
                    donut
                    showGradient
                    sectionAutoFocus
                    radius={90}
                    innerRadius={60}
                    innerCircleColor={'#232D41'}
                />
                {renderLegendComponent()}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#0A1931',
        alignItems: 'center',
        paddingTop: 30,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    userName: {
        fontFamily: 'PoppinsBold',
        fontSize: 20,
        color: '#FFCB05',
    },
    chartContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        marginBottom: 20,
        padding: 20,
        width: '90%',
        alignItems: 'center',
    },
    chartTitle: {
        color: '#6D4C41',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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
});

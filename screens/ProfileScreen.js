import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, Pressable } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';
import { Ionicons as Icon } from '@expo/vector-icons';

export default function ProfileScreen({ route, navigation }) {
    const [isConnected, setIsConnected] = React.useState(AuthContext);
    const [user, setUser] = React.useState(UserContext);

    useEffect(() => {
        const checkTokenAndUser = async () => {
            const token = await AsyncStorage.getItem('token');
            const user = JSON.parse(await AsyncStorage.getItem('user'));
            setIsConnected(!!token);
            setUser(user);
        };
        checkTokenAndUser();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.navigate('Connexion');
            }
        });

        return unsubscribe;
    }, [navigation]);

    const { logout } = React.useContext(AuthContext);

    if (route.params && route.params.user) {
        const userData = route.params.user;
        user = Object.fromEntries(userData);
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.profileContainer}>
                <View style={styles.avatarContainer}>
                    {/* Modifier l'icône ici */}
                    <Icon name="person-circle-outline" size={100} color="#FFCB05" />
                </View>
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
                <Pressable style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1931',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    profileContainer: {
        alignItems: 'center',
        backgroundColor: '#232D41',
        borderRadius: 10,
        padding: 20,
    },
    avatarContainer: {
        marginBottom: 20,
    },
    name: {
        fontFamily: 'NeueMachinaUltrabold',
        fontSize: 24,
        color: '#FFCB05',
        marginBottom: 10,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontFamily: 'BricolageGrotesqueLight',
        color: '#FFCB05',
        marginRight: 10,
    },
    value: {
        fontFamily: 'BricolageGrotesqueLight',
        color: '#FFF',
    },
    logoutButton: {
        backgroundColor: '#FF0000',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 20,
    },
    logoutText: {
        fontFamily: 'BricolageGrotesqueLight',
        fontSize: 16,
        color: '#FFF',
    },
});

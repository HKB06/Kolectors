import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from "expo-font";
import { Text } from 'react-native';
import AuthContext from './contexts/AuthContext';
import UserContext from './contexts/UserContext';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import MyCollectionScreen from './screens/MyCollectionScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [loaded] = useFonts({
    "BricolageGrotesque": require("./assets/fonts/BricolageGrotesque.ttf"),
    "BricolageGrotesqueLight": require("./assets/fonts/BricolageGrotesqueLight.ttf"),
    "NeueMachinaLight": require("./assets/fonts/NeueMachinaLight.otf"),
    "NeueMachinaRegular": require("./assets/fonts/NeueMachinaRegular.otf"),
    "NeueMachinaUltrabold": require("./assets/fonts/NeueMachinaUltrabold.otf"),
  });

  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkTokenAndUser = async () => {
      const token = await AsyncStorage.getItem('token');
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      setIsConnected(!!token);
      setUser(user);
    };
    checkTokenAndUser();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setIsConnected(false);
  };

  if (!loaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <AuthContext.Provider value={{ isConnected, setIsConnected, logout }}>
      <UserContext.Provider value={{ user, setUser }}>
        <NavigationContainer>
          {isConnected ? (
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                  let iconName;

                  if (route.name === 'Accueil') {
                    iconName = 'home-outline';
                  } else if (route.name === 'Collection') {
                    iconName = 'albums-outline';
                  } else if (route.name === 'Mon Profil') {
                    iconName = 'person-outline';
                  }
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarStyle: {
                  backgroundColor: '#FFCB05',
                  height: 90,
                  paddingHorizontal: 5,
                  paddingTop: 10,
                  borderTopWidth: 1,
                },
                tabBarActiveTintColor: '#001D95',
                tabBarInactiveTintColor: 'lightgray',
              })}
            >
              <Tab.Screen 
                name="Accueil" 
                component={HomeScreen}
                options={{
                  headerStyle: { backgroundColor: '#FFCB05' },
                  headerTitleStyle: { color: '#fff', fontFamily: 'NeueMachinaUltrabold' },
                  contentStyle: { backgroundColor: '#FFCB05' }
                }} 
              />
              <Tab.Screen 
                name="Collection" 
                component={MyCollectionScreen}
                options={{
                  headerStyle: { backgroundColor: '#FFCB05' },
                  headerTitleStyle: { color: '#fff', fontFamily: 'NeueMachinaUltrabold' },
                }}  
              />
              <Tab.Screen 
                name="Mon Profil" 
                component={ProfileScreen}
                options={{
                  headerStyle: { backgroundColor: '#FFCB05'},
                  headerTitleStyle: { color: '#fff', fontFamily: 'NeueMachinaUltrabold' },
                }}  
              />
            </Tab.Navigator>
          ) : (
            <Stack.Navigator initialRouteName="Connexion">
              <Stack.Screen
                name="Connexion"
                component={LoginScreen}
                options={{
                  headerStyle: { backgroundColor: '#FFCB05' },
                  headerTitleStyle: { color: '#fff', fontFamily: 'NeueMachinaUltrabold' },
                  contentStyle: { backgroundColor: '#F70305' }
                }}
              />
              <Stack.Screen
                name="Inscription"
                component={RegisterScreen}
                options={{
                  headerStyle: { backgroundColor: '#FFCB05' },
                  headerTintColor:  '#9D775D',
                  headerTitleStyle: { color: '#fff', fontFamily: 'NeueMachinaUltrabold' },
                  contentStyle: { backgroundColor: '#2E3B52' }
                }}
              />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </UserContext.Provider>
    </AuthContext.Provider>
  );
}

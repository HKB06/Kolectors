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
import KolectorScreen from './screens/KolectorScreen';
import SetDetailsScreen from './screens/SetDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function KolectorStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="KolectorScreen" component={KolectorScreen} options={{ headerShown: true, headerStyle: { backgroundColor: '#171925' },headerTitleStyle: { color: '#fff', fontFamily: 'PoppinsBold' },contentStyle: { backgroundColor: '#F70305' } }} />
      <Stack.Screen name="SetDetails" component={SetDetailsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [loaded] = useFonts({
    "Poppins": require("./assets/fonts/Poppins-Regular.ttf"),
    "PoppinsBold": require("./assets/fonts/Poppins-Bold.ttf"),
    "PoppinsMeduim": require("./assets/fonts/Poppins-Medium.ttf"),
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
                  } else if (route.name === 'Kolectors') {
                    iconName = 'book-outline';
                  }
                  
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarStyle: {
                  backgroundColor: '#171925',
                  height: 90,
                  paddingHorizontal: 5,
                  paddingTop: 10,
                  borderTopWidth: 1,
                },
                tabBarActiveTintColor: 'red',
                tabBarInactiveTintColor: 'lightgray',
              })}
            >
              <Tab.Screen 
                name="Accueil" 
                component={HomeScreen}
                options={{
                  headerStyle: { backgroundColor: '#FFCB05' },
                  headerTitleStyle: { color: '#fff', fontFamily: 'PoppinsBold' },
                  contentStyle: { backgroundColor: '#FFCB05' }
                }} 
              />
              <Tab.Screen 
                name="Kolectors" 
                component={KolectorStack}
                options={{
                  headerShown: false,
                  tabBarLabel: 'Kolectors'
                  
                }} 
              />
              <Tab.Screen 
                name="Collection" 
                component={MyCollectionScreen}
                options={{
                  headerStyle: { backgroundColor: '#FFCB05' },
                  headerTitleStyle: { color: '#fff', fontFamily: 'PoppinsBold' },
                }}  
              />
              <Tab.Screen 
                name="Mon Profil" 
                component={ProfileScreen}
                options={{
                  headerStyle: { backgroundColor: '#FFCB05'},
                  headerTitleStyle: { color: '#fff', fontFamily: 'PoppinsBold' },
                }}  
              />
            </Tab.Navigator>
          ) : (
            <Stack.Navigator initialRouteName="Connexion">
              <Stack.Screen
                name="Connexion"
                component={LoginScreen}
                options={{
                  headerStyle: { backgroundColor: '#171925' },
                  headerTitleStyle: { color: '#fff', fontFamily: 'PoppinsBold' },
                  contentStyle: { backgroundColor: '#F70305' }
                }}
              />
              <Stack.Screen
                name="Inscription"
                component={RegisterScreen}
                options={{
                  headerStyle: { backgroundColor: '#171925' },
                  headerTintColor:  '#171925',
                  headerTitleStyle: { color: '#fff', fontFamily: 'PoppinsBold' },
                  contentStyle: { backgroundColor: '#fff' }
                }}
              />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </UserContext.Provider>
    </AuthContext.Provider>
  );
}

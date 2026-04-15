import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TabIcon from '../components/TabIcon/TabIcon';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => (
        <TabIcon
          name={getTabIconName(route.name)}
          focused={focused}
          color={color}
          size={size}
        />
      ),
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E5E7EB',
      },
    })}
  >
    <Tab.Screen
      name="HomeStack"
      component={HomeStack}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon name="home" focused={focused} color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="ProfileStack"
      component={ProfileStack}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon name="user" focused={focused} color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

const getTabIconName = (routeName: string): string => {
  switch (routeName) {
    case 'HomeStack':
      return 'home';
    case 'ProfileStack':
      return 'user';
    default:
      return 'home';
  }
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <AuthStack />
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;

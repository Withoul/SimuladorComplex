import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TemarioTabScreen from '../screens/TemarioTabScreen';
import RachaInfinitaScreen from '../screens/RachaInfinitaScreen';
import RachaTiempoScreen from '../screens/RachaTiempoScreen';
import ModoAleatorioScreen from '../screens/ModoAleatorioScreen';
import ModoRepasoSetupScreen from '../screens/ModoRepasoSetupScreen';
import ModoRepasoStudyScreen from '../screens/ModoRepasoStudyScreen';
import ModoFijoSetupScreen from '../screens/ModoFijoSetupScreen';
import ResultsScreen from '../screens/ResultsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen
        name="RachaInfinita"
        component={RachaInfinitaScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="RachaTiempo"
        component={RachaTiempoScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="ModoAleatorio"
        component={ModoAleatorioScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="ModoRepasoSetup"
        component={ModoRepasoSetupScreen}
      />
      <Stack.Screen
        name="ModoRepasoStudy"
        component={ModoRepasoStudyScreen}
      />
      <Stack.Screen
        name="ModoFijoSetup"
        component={ModoFijoSetupScreen}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Temario') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.surfaceContainerHigh,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Temario" component={TemarioTabScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

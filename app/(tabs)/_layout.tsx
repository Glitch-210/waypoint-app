// TODO: Restore after Google sign-in is verified
// import React from 'react';
// import { Tabs } from 'expo-router';
// import { MaterialIcons } from '@expo/vector-icons';
// import { colors } from '../../constants/colors';
//
// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: colors.rausch,
//         tabBarInactiveTintColor: colors.muted,
//         tabBarStyle: {
//           backgroundColor: colors.canvas,
//           borderTopColor: colors.hairline,
//           height: 60,
//           paddingBottom: 8,
//           paddingTop: 8,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="lists"
//         options={{
//           title: 'My Lists',
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="format-list-bulleted" size={size || 24} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="map"
//         options={{
//           title: 'Map',
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="map" size={size || 24} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="person" size={size || 24} color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

// --- STUB: Sign-in focus mode ---
import React from 'react';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="lists" options={{ title: 'Lists' }} />
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

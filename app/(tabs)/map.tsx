// TODO: Restore after Google sign-in is verified
// import React from 'react';
// import { StyleSheet, View, Text, SafeAreaView, Platform } from 'react-native';
// import { colors } from '../../constants/colors';
//
// const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAPTILER_API_KEY;
//
// // Default location: San Francisco [Longitude, Latitude]
// const DEFAULT_CENTER: [number, number] = [-122.4194, 37.7749];
// const DEFAULT_ZOOM = 12;
//
// export default function MapScreen() {
//   if (Platform.OS === 'web') {
//     return (
//       <SafeAreaView style={styles.errorContainer}>
//         <View style={styles.errorCard}>
//           <Text style={styles.errorTitle}>Native Map (Mobile Only)</Text>
//           <Text style={styles.errorMessage}>
//             MapLibre vector maps require native Android or iOS code.
//           </Text>
//           <Text style={styles.errorMessage}>
//             Run <Text style={styles.codeText}>npx expo run:android</Text> on an Android emulator or device to view the map.
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }
//
//   // Dynamically require native components on Android and iOS only
//   const { Map, Camera, Marker } = require('@maplibre/maplibre-react-native');
//
//   const styleUrl = MAPTILER_API_KEY
//     ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`
//     : null;
//
//   if (!styleUrl) {
//     return (
//       <SafeAreaView style={styles.errorContainer}>
//         <View style={styles.errorCard}>
//           <Text style={styles.errorTitle}>MapTiler API Key Missing</Text>
//           <Text style={styles.errorMessage}>
//             Please add your MapTiler API key to the <Text style={styles.codeText}>.env</Text> file as:
//           </Text>
//           <View style={styles.codeBlock}>
//             <Text style={styles.codeText}>EXPO_PUBLIC_MAPTILER_API_KEY=your_key_here</Text>
//           </View>
//         </View>
//       </SafeAreaView>
//     );
//   }
//
//   return (
//     <View style={styles.container}>
//       <Map style={styles.map} mapStyle={styleUrl}>
//         <Camera initialViewState={{ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM }} />
//         <Marker lngLat={DEFAULT_CENTER}>
//           <View style={styles.markerContainer}>
//             <View style={styles.markerPin} />
//           </View>
//         </Marker>
//       </Map>
//     </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 },
//   markerContainer: { alignItems: 'center', justifyContent: 'center' },
//   markerPin: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.rausch || '#FF5A5F', borderWidth: 3, borderColor: '#FFFFFF', shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
//   errorContainer: { flex: 1, backgroundColor: colors.canvas || '#F7F7F7', justifyContent: 'center', alignItems: 'center', padding: 20 },
//   errorCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
//   errorTitle: { fontSize: 20, fontWeight: '700', color: '#D93900', marginBottom: 12 },
//   errorMessage: { fontSize: 15, color: '#484848', marginBottom: 12, lineHeight: 22 },
//   codeBlock: { backgroundColor: '#F0F0F0', borderRadius: 6, padding: 12, marginTop: 8 },
//   codeText: { fontFamily: 'monospace', fontSize: 13, color: '#222222' },
// });

// --- STUB: Sign-in focus mode ---
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map — stub (sign-in focus mode)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f7f7' },
  text: { fontSize: 16, color: '#888' },
});

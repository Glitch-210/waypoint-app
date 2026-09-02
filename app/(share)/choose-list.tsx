<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { List } from '../../types';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { MaterialIcons } from '@expo/vector-icons';

export default function ChooseListScreen() {
  const { sharedUrl } = useLocalSearchParams<{ sharedUrl: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [lists, setLists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadLists();
    }
  }, [user?.id]);

  const loadLists = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/lists?clerkId=${encodeURIComponent(user!.id)}`);
      if (!res.ok) throw new Error('Failed to fetch lists');
      const data = await res.json();
      setLists(data.lists || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load lists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectList = (listId: string) => {
    // Navigate to the add screen with the shared URL
    router.replace({
      pathname: '/(tabs)/lists/[id]/add',
      params: { id: listId, sharedUrl: sharedUrl || '' }
    });
  };

=======
// TODO: Restore after Google sign-in is verified
// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useAuth } from '../../context/AuthContext';
// import { authFetch } from '../../lib/session';
// import { colors } from '../../constants/colors';
// import { typography } from '../../constants/typography';
// import { MaterialIcons } from '@expo/vector-icons';
//
// export default function ChooseListScreen() {
//   const { sharedUrl } = useLocalSearchParams<{ sharedUrl: string }>();
//   const router = useRouter();
//   const { user } = useAuth();
//   const [lists, setLists] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//
//   useEffect(() => {
//     if (user?.id) { loadLists(); }
//   }, [user?.id]);
//
//   const loadLists = async () => {
//     try {
//       setIsLoading(true);
//       const res = await authFetch('/api/lists');
//       if (res.ok) {
//         const data = await res.json();
//         setLists(data.lists || []);
//       }
//     } catch (err) {
//       console.error(err);
//       alert('Failed to load lists');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const handleSelectList = (listId: string) => {
//     router.replace({
//       pathname: '/(tabs)/lists/[id]/add',
//       params: { id: listId, sharedUrl: sharedUrl || '' },
//     });
//   };
//
//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.replace('/(tabs)/lists')} style={styles.backButton}>
//           <MaterialIcons name="close" size={24} color={colors.ink} />
//         </TouchableOpacity>
//         <Text style={styles.title}>Save to List</Text>
//         <View style={{ width: 40 }} />
//       </View>
//
//       {isLoading ? (
//         <ActivityIndicator style={{ marginTop: 40 }} color={colors.rausch} />
//       ) : (
//         <FlatList
//           data={lists}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={styles.listContainer}
//           renderItem={({ item }: { item: any }) => (
//             <TouchableOpacity style={styles.listCard} onPress={() => handleSelectList(item.id)}>
//               <View style={styles.listIcon}>
//                 <Text style={{ fontSize: 24 }}>📍</Text>
//               </View>
//               <View style={styles.listInfo}>
//                 <Text style={styles.listTitle}>{item.name}</Text>
//                 <Text style={styles.listSubtitle}>{item._count?.places || 0} places</Text>
//               </View>
//               <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
//             </TouchableOpacity>
//           )}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>You don't have any lists yet.</Text>
//           }
//         />
//       )}
//     </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: colors.canvas },
//   header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.hairline },
//   backButton: { width: 40 },
//   title: { fontSize: 18, fontFamily: typography.bold, color: colors.ink },
//   listContainer: { padding: 16 },
//   listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSoft, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.hairline },
//   listIcon: { width: 48, height: 48, borderRadius: 8, backgroundColor: colors.canvas, justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: colors.hairline },
//   listInfo: { flex: 1 },
//   listTitle: { fontSize: 16, fontFamily: typography.semibold, color: colors.ink, marginBottom: 4 },
//   listSubtitle: { fontSize: 13, fontFamily: typography.regular, color: colors.muted },
//   emptyText: { textAlign: 'center', color: colors.muted, fontFamily: typography.regular, marginTop: 40 },
// });

// --- STUB: Sign-in focus mode ---
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChooseListScreen() {
>>>>>>> 483d6d7439c8a34e2b9f5f4c269d2b6e5f7996fc
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Choose List — stub (sign-in focus mode)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f7f7' },
  text: { fontSize: 16, color: '#888' },
});

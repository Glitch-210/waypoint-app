import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { useListStore } from '../../../store/useListStore';
import { PlaylistCard } from '../../../components/lists/PlaylistCard';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { MaterialIcons } from '@expo/vector-icons';

export default function PlaylistsScreen() {
  const { lists, setLists, addList } = useListStore();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLists() {
      if (!isLoaded || !user?.id) return;
      try {
        setIsLoading(true);
        const res = await fetch(`/api/lists?userId=${encodeURIComponent(user.id)}`);
        if (res.ok) {
          const data = await res.json();
          setLists(data.lists || []);
        }
      } catch (err) {
        console.error('Failed to load lists:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadLists();
  }, [isLoaded, user?.id]);

  const handleCreateList = async () => {
    if (!newListName.trim() || !user?.id) return;
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newListName.trim(),
          ownerId: user.id,
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          displayName: user.fullName || user.username || '',
          avatarUrl: user.imageUrl || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.list) {
          addList(data.list);
        }
      }
      setNewListName('');
      setModalVisible(false);
    } catch (err) {
      console.error('Failed to create list:', err);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Lists</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="add" size={22} color={colors.canvas} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.rausch} />
        </View>
      ) : lists.length === 0 ? (
        /* Branded empty state */
        <View style={styles.emptyContainer}>
          <MaterialIcons name="map" size={72} color={colors.hairline} />
          <Text style={styles.emptyTitle}>Your travel playlists live here</Text>
          <Text style={styles.emptySubtitle}>
            Save places from Instagram, TikTok, Maps and more — all in one list.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setModalVisible(true)}>
            <MaterialIcons name="add" size={18} color={colors.canvas} />
            <Text style={styles.emptyButtonText}>Create your first list</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlaylistCard
              id={item.id}
              name={item.name}
              coverImageUrl={item.coverImageUrl}
              placeCount={(item as any)._count?.places ?? 0}
              onPress={() => router.push(`/lists/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* New List Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>New List</Text>
            <TextInput
              placeholder="e.g. Goa Weekend Spots"
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
              style={styles.input}
              placeholderTextColor={colors.muted}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => { setModalVisible(false); setNewListName(''); }} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateList} style={styles.createBtn}>
                <Text style={styles.createBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: typography.bold,
    color: colors.ink,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.rausch,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: typography.bold,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: typography.regular,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: colors.rausch,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: colors.canvas,
    fontFamily: typography.bold,
    fontSize: 15,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: colors.canvas,
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: typography.bold,
    color: colors.ink,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    fontFamily: typography.regular,
    color: colors.ink,
    marginBottom: 20,
    backgroundColor: colors.surfaceSoft,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: colors.muted,
    fontFamily: typography.medium,
    fontSize: 15,
  },
  createBtn: {
    backgroundColor: colors.rausch,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createBtnText: {
    color: colors.canvas,
    fontFamily: typography.bold,
    fontSize: 15,
  },
});

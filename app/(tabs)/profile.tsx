import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Linking, Alert } from 'react-native';
import { useUser, useAuth } from '@clerk/expo';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const handleFeedback = () => {
    Linking.openURL(
      'mailto:hello@waypoint.app?subject=Waypoint%20Feedback&body=Hi%20Waypoint%20team%2C'
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Avatar + Name */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <MaterialIcons name="person" size={44} color={colors.muted} />
            </View>
          )}
        </View>
        <Text style={styles.displayName}>{user?.fullName || user?.username || 'Traveller'}</Text>
        <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress || ''}</Text>
      </View>

      {/* Menu sections */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <TouchableOpacity style={styles.row} onPress={handleFeedback}>
          <MaterialIcons name="feedback" size={20} color={colors.ink} style={styles.rowIcon} />
          <Text style={styles.rowText}>Give Feedback</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <TouchableOpacity style={styles.row} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={20} color={colors.primary} style={styles.rowIcon} />
          <Text style={[styles.rowText, { color: colors.primary }]}>Sign Out</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>

      {/* App version footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Waypoint v{APP_VERSION}</Text>
        <Text style={styles.footerText}>Made with ❤️ for travellers</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
  },
  header: {
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.canvas,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: colors.rausch,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceSoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  displayName: {
    fontSize: 22,
    fontFamily: typography.bold,
    color: colors.ink,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: typography.regular,
    color: colors.muted,
  },
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: typography.bold,
    color: colors.muted,
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.canvas,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.hairline,
  },
  rowIcon: {
    marginRight: 14,
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.medium,
    color: colors.ink,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontFamily: typography.regular,
    color: colors.muted,
  },
});

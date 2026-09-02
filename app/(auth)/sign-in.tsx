import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { useAuth } from '../../context/AuthContext';

export default function SignInScreen() {
  const router = useRouter();
  const { setUser } = useAuth();

  const { signIn, isLoading, error } = useGoogleAuth((user) => {
    setUser(user);
    router.replace('/(tabs)/lists');
  });

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <MaterialIcons name="explore" size={44} color={colors.rausch} />
        </View>

        <Text style={styles.title}>Welcome to Waypoint</Text>
        <Text style={styles.subtitle}>
          Spotify playlists, but for travel places.{'\n'}Save, route, and go.
        </Text>

        {/* Error banner */}
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Google Sign-In Button */}
        <TouchableOpacity
          id="btn-google-sign-in"
          style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
          onPress={signIn}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.muted} style={{ marginRight: 10 }} />
          ) : (
            <FontAwesome name="google" size={18} color="#4285F4" style={styles.googleIcon} />
          )}
          <Text style={styles.googleButtonText}>
            {isLoading ? 'Signing in…' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.canvas,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.hairline,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  title: {
    fontSize: 26,
    fontFamily: typography.bold,
    color: colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: typography.regular,
    color: colors.muted,
    lineHeight: 21,
    marginBottom: 28,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F2',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    flex: 1,
    color: colors.primary,
    fontSize: 13,
    fontFamily: typography.medium,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: typography.semibold,
    color: colors.ink,
  },
  legal: {
    marginTop: 20,
    fontSize: 11,
    fontFamily: typography.regular,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 16,
  },
});

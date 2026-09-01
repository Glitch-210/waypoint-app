import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSignIn, useSignUp, useOAuth } from '@clerk/expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

export function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      void WebBrowser.warmUpAsync();
      return () => {
        void WebBrowser.coolDownAsync();
      };
    }
  }, []);
}

export default function SignInScreen() {
  useWarmUpBrowser();

  const { signIn, setActive, isLoaded } = (useSignIn as any)();
  const { signUp, setActive: setSignUpActive } = (useSignUp as any)();
  const { startOAuthFlow } = (useOAuth as any)({ strategy: 'oauth_google' });

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Google OAuth Sign In
  const onGoogleSignInPress = useCallback(async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const redirectUrl = Linking.createURL('/(tabs)/lists', { scheme: 'waypoint' });
      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow({
        redirectUrl,
      });

      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
      }
    } catch (err: any) {
      console.error('Google OAuth Error:', err);
      const msg = err.errors?.[0]?.message || 'Failed to sign in with Google. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [startOAuthFlow]);

  // Handle Email/Password Sign In or Sign Up
  const handleSubmit = async () => {
    if (!isLoaded || !email || !password || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (mode === 'signIn') {
        const result = await signIn.create({
          identifier: email,
          password,
        });
        if (result && result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
        } else {
          setErrorMessage('Could not complete sign in. Please check your credentials.');
        }
      } else {
        // Sign Up flow
        const result = await signUp.create({
          emailAddress: email,
          password,
          firstName: name.split(' ')[0] || name,
          lastName: name.split(' ').slice(1).join(' ') || '',
        });
        if (result && result.status === 'complete') {
          await setSignUpActive({ session: result.createdSessionId });
        } else {
          setErrorMessage('Verification required or account created. Please sign in.');
          setMode('signIn');
        }
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.errors?.[0]?.message || 'Authentication error. Please check your details and try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="explore" size={44} color={colors.rausch} />
          </View>

          <Text style={styles.title}>Welcome to Waypoint</Text>
          <Text style={styles.subtitle}>
            Spotify playlists, but for travel places. Save, route, and go.
          </Text>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Google OAuth Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={onGoogleSignInPress}
            disabled={isSubmitting}
          >
            <FontAwesome name="google" size={18} color="#4285F4" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Name Field (Sign Up Mode) */}
          {mode === 'signUp' && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            </>
          )}

          {/* Email Field */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          {/* Password Field */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!email || !password || isSubmitting}
            style={[
              styles.button,
              (!email || !password || isSubmitting) && styles.buttonDisabled,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.canvas} />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'signIn' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Sign In / Sign Up mode */}
          <TouchableOpacity
            onPress={() => {
              setMode(mode === 'signIn' ? 'signUp' : 'signIn');
              setErrorMessage('');
            }}
            style={styles.toggleContainer}
          >
            <Text style={styles.toggleText}>
              {mode === 'signIn'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <Text style={styles.toggleHighlight}>
                {mode === 'signIn' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
  },
  scrollContent: {
    flexGrow: 1,
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
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: colors.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: typography.regular,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#FDF2F2',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: typography.medium,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 10,
    paddingVertical: 13,
    marginBottom: 16,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontFamily: typography.semibold,
    color: colors.ink,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.hairline,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontFamily: typography.bold,
    color: colors.muted,
  },
  label: {
    fontSize: 13,
    fontFamily: typography.semibold,
    color: colors.ink,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    fontFamily: typography.regular,
    color: colors.ink,
    backgroundColor: colors.surfaceSoft,
    marginBottom: 14,
  },
  button: {
    backgroundColor: colors.rausch,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    backgroundColor: colors.rauschDisabled,
  },
  buttonText: {
    color: colors.canvas,
    fontFamily: typography.bold,
    fontSize: 16,
  },
  toggleContainer: {
    marginTop: 18,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: typography.regular,
    color: colors.muted,
  },
  toggleHighlight: {
    color: colors.rausch,
    fontFamily: typography.bold,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { addCollaborator } from '../../../../lib/services/listService';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';

export default function InviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function processInvite() {
      if (!isLoaded) return;
      
      if (!isSignedIn || !user?.id) {
        setStatus('error');
        setErrorMessage('You need to sign in to join this list.');
        return;
      }

      if (!id) {
        setStatus('error');
        setErrorMessage('Invalid invite link.');
        return;
      }

      try {
        await addCollaborator(id, user.id, 'editor');
        setStatus('success');
        
        // Wait a brief moment to show success, then redirect to list
        setTimeout(() => {
          router.replace(`/lists/${id}`);
        }, 1500);
      } catch (err) {
        console.error(err);
        setStatus('error');
        setErrorMessage('Failed to join the list. You might already be a member or the link is invalid.');
      }
    }

    processInvite();
  }, [id, user?.id, isLoaded, isSignedIn]);

  return (
    <View style={styles.container}>
      {status === 'loading' && (
        <>
          <ActivityIndicator size="large" color={colors.rausch} />
          <Text style={styles.text}>Joining list...</Text>
        </>
      )}

      {status === 'success' && (
        <>
          <Text style={styles.successText}>🎉 Successfully joined!</Text>
          <Text style={styles.text}>Taking you to the list...</Text>
        </>
      )}

      {status === 'error' && (
        <>
          <Text style={styles.errorText}>Oops!</Text>
          <Text style={styles.text}>{errorMessage}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.replace('/lists')}
          >
            <Text style={styles.buttonText}>Go to My Lists</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    padding: 24,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: typography.medium,
    color: colors.ink,
    textAlign: 'center',
  },
  successText: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: colors.rausch,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: colors.primary,
    marginBottom: 8,
  },
  button: {
    marginTop: 32,
    backgroundColor: colors.ink,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.canvas,
    fontFamily: typography.bold,
    fontSize: 16,
  }
});

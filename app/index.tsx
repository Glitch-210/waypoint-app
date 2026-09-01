import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { colors } from '../constants/colors';

export default function Index() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.canvas, height: '100%' }}>
        <ActivityIndicator size="large" color={colors.rausch} />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)/lists" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}

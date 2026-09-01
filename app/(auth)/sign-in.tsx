import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useSignIn } from '@clerk/expo';
import { colors } from '../../constants/colors';

export default function SignInScreen() {
  // @ts-ignore
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSignInPress = async () => {
    if (!isLoaded) return;
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      // @ts-ignore
      if (result.status === 'complete') {
        // @ts-ignore
        await setActive({ session: result.createdSessionId });
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.ink, marginBottom: 8 }}>
        Welcome to Waypoint
      </Text>
      <Text style={{ fontSize: 15, color: colors.muted, marginBottom: 32 }}>
        Playlists for travel places. Save, route, and go.
      </Text>

      <TextInput
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: colors.hairline,
          borderRadius: 8,
          padding: 14,
          fontSize: 15,
          color: colors.ink,
          backgroundColor: colors.surfaceSoft,
          marginBottom: 16,
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: colors.hairline,
          borderRadius: 8,
          padding: 14,
          fontSize: 15,
          color: colors.ink,
          backgroundColor: colors.surfaceSoft,
          marginBottom: 24,
        }}
      />

      <TouchableOpacity
        onPress={onSignInPress}
        style={{
          backgroundColor: colors.rausch,
          borderRadius: 8,
          padding: 16,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

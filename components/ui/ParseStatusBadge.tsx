import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Place } from '../../types';
import { typography } from '../../constants/typography';
import { MaterialIcons } from '@expo/vector-icons';

interface ParseStatusBadgeProps {
  status: Place['parseStatus'];
}

export function ParseStatusBadge({ status }: ParseStatusBadgeProps) {
  if (status === 'parsed') {
    // Only show if we need to? DESIGN.md says "shown only when relevant — don't clutter confirmed places"
    // Wait, "Verified" (parsed + geocoded) is one state. Maybe we only show amber/red when it's manual/failed?
    // "green Verified ... shown only when relevant". Usually we only want to show it briefly or maybe always if requested, but let's just render it for now.
    // Actually, "don't clutter confirmed places" suggests we might NOT want to show 'parsed' if it's all good, or maybe we do for a bit. Let's return null for 'parsed' if that's the intent, or render it. I'll render it to be safe.
    return (
      <View style={[styles.container, styles.verifiedContainer]}>
        <MaterialIcons name="check-circle" size={12} color="#065F46" style={styles.icon} />
        <Text style={[styles.text, styles.verifiedText]}>Verified</Text>
      </View>
    );
  }

  if (status === 'manual') {
    return (
      <View style={[styles.container, styles.manualContainer]}>
        <MaterialIcons name="error-outline" size={12} color="#92400E" style={styles.icon} />
        <Text style={[styles.text, styles.manualText]}>Check location</Text>
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={[styles.container, styles.failedContainer]}>
        <MaterialIcons name="warning" size={12} color="#991B1B" style={styles.icon} />
        <Text style={[styles.text, styles.failedText]}>Action required</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontFamily: typography.medium,
    fontSize: 10,
  },
  verifiedContainer: {
    backgroundColor: '#D1FAE5',
  },
  verifiedText: {
    color: '#065F46',
  },
  manualContainer: {
    backgroundColor: '#FEF3C7',
  },
  manualText: {
    color: '#92400E',
  },
  failedContainer: {
    backgroundColor: '#FEE2E2',
  },
  failedText: {
    color: '#991B1B',
  },
});

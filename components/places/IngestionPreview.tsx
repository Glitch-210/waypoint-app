import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ParsedPlaceCandidate } from '../../lib/services/parseService';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

interface IngestionPreviewProps {
  candidate: ParsedPlaceCandidate;
  onSave: (placeData: { name: string; address: string; notes?: string; sourceUrl: string; sourceType: string; locationInfo: any }) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function IngestionPreview({ candidate, onSave, onCancel, isSaving }: IngestionPreviewProps) {
  const [name, setName] = useState(candidate.location?.name || candidate.ogTitle || '');
  const [address, setAddress] = useState(candidate.location?.address || '');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave({
      name,
      address,
      notes,
      sourceUrl: candidate.url,
      sourceType: candidate.sourceType,
      locationInfo: candidate.location, // In a real app we'd attach lat/lng here
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {candidate.ogImage ? (
          <Image source={{ uri: candidate.ogImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Image Found</Text>
          </View>
        )}
        
        <View style={styles.content}>
          <Text style={styles.ogTitle} numberOfLines={2}>
            {candidate.ogTitle || 'Untitled Page'}
          </Text>
          <Text style={styles.sourceText}>Source: {candidate.sourceType}</Text>
          
          <View style={styles.form}>
            <Text style={styles.label}>Location Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="E.g., Gateway of India"
            />

            <Text style={styles.label}>Address (Optional)</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Search or enter address"
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Why save this?"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={isSaving}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving || !name.trim()}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save to List</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surfaceStrong,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.muted,
    fontFamily: typography.regular,
  },
  content: {
    padding: 16,
  },
  ogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    fontFamily: typography.bold,
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 13,
    color: colors.rausch,
    fontFamily: typography.semibold,
    marginBottom: 16,
  },
  form: {
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    fontFamily: typography.semibold,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.ink,
    fontFamily: typography.regular,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.rausch,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  }
});

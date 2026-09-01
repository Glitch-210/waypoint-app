import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, TouchableOpacity } from 'react-native';
import { Place } from '../../types';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { MaterialIcons } from '@expo/vector-icons';
import { ParseStatusBadge } from '../ui/ParseStatusBadge';

interface PlaceCardProps {
  place: Place;
  onPress?: () => void;
  onToggleRoute?: () => void;
  canEdit?: boolean;
}

export function PlaceCard({ place, onPress, onToggleRoute, canEdit = true }: PlaceCardProps) {
  const getSourceIcon = () => {
    switch (place.sourceType) {
      case 'instagram':
        return 'photo-camera';
      case 'tiktok':
        return 'music-video';
      case 'youtube':
        return 'play-circle-outline';
      case 'maps':
        return 'map';
      case 'manual':
      default:
        return 'edit';
    }
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {onToggleRoute && (
        <TouchableOpacity 
          onPress={onToggleRoute} 
          style={[styles.checkbox, place.inRoute && styles.checkboxActive, !canEdit && styles.checkboxDisabled]}
          disabled={!canEdit}
        >
          {place.inRoute && <MaterialIcons name="check" size={16} color={colors.canvas} />}
        </TouchableOpacity>
      )}
      <View style={styles.imageContainer}>
        {place.photoUrl ? (
          <Image source={{ uri: place.photoUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="place" size={32} color={colors.muted} />
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {place.name}
          </Text>
          <MaterialIcons name={getSourceIcon()} size={16} color={colors.muted} style={styles.sourceIcon} />
        </View>

        {place.address ? (
          <Text style={styles.address} numberOfLines={2}>
            {place.address}
          </Text>
        ) : null}

        <View style={styles.footerRow}>
          <ParseStatusBadge status={place.parseStatus} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.canvas,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 12,
  },
  checkboxActive: {
    backgroundColor: colors.rausch,
    borderColor: colors.rausch,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.surfaceSoft,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontFamily: typography.semibold,
    fontSize: 16,
    color: colors.ink,
    marginRight: 8,
  },
  sourceIcon: {
    opacity: 0.7,
  },
  address: {
    fontFamily: typography.regular,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { MapPin, Users } from 'lucide-react-native';

interface PlaylistCardProps {
  id: string;
  name: string;
  coverImageUrl?: string | null;
  placeCount: number;
  collaboratorCount?: number;
  onPress: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  name,
  coverImageUrl,
  placeCount,
  collaboratorCount = 1,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: colors.surfaceSoft,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.hairline,
        marginBottom: 16,
      }}
    >
      {/* Cover Image */}
      <View style={{ height: 140, backgroundColor: colors.surfaceStrong, width: '100%' }}>
        {coverImageUrl ? (
          <Image
            source={{ uri: coverImageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surfaceStrong,
            }}
          >
            <MapPin size={32} color={colors.muted} />
          </View>
        )}
      </View>

      {/* Meta Content */}
      <View style={{ padding: 14 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.ink,
            marginBottom: 4,
          }}
          numberOfLines={1}
        >
          {name}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MapPin size={14} color={colors.muted} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 13, color: colors.muted }}>
              {placeCount} {placeCount === 1 ? 'place' : 'places'}
            </Text>
          </View>

          {collaboratorCount > 1 && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Users size={14} color={colors.muted} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 13, color: colors.muted }}>
                {collaboratorCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

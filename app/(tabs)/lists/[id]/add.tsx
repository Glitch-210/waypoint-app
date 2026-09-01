import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { MaterialIcons } from '@expo/vector-icons';
import { searchPlaces, MapboxFeature } from '../../../../lib/utils/mapbox';
import { createPlace } from '../../../../lib/services/placeService';
import { usePlaceStore } from '../../../../store/usePlaceStore';
import { parseUrl, ParsedPlaceCandidate } from '../../../../lib/services/parseService';
import { IngestionPreview } from '../../../../components/places/IngestionPreview';

export default function AddPlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { addPlace } = usePlaceStore();

  // Link Ingestion State
  const [linkUrl, setLinkUrl] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedCandidate, setParsedCandidate] = useState<ParsedPlaceCandidate | null>(null);

  // Manual Entry State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<MapboxFeature | null>(null);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Parse Link Effect
  useEffect(() => {
    if (linkUrl.trim() && (linkUrl.startsWith('http://') || linkUrl.startsWith('https://'))) {
      // Debounce parse
      const delay = setTimeout(async () => {
        try {
          setIsParsing(true);
          const candidate = await parseUrl(linkUrl.trim());
          setParsedCandidate(candidate);
        } catch (e) {
          console.error(e);
          alert('Could not parse link. You can enter the place manually below.');
        } finally {
          setIsParsing(false);
        }
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [linkUrl]);

  // Search Places Effect
  useEffect(() => {
    if (!query || selectedFeature) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const data = await searchPlaces(query);
      setResults(data);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedFeature]);

  const handleSelectPlace = (feature: MapboxFeature) => {
    setSelectedFeature(feature);
    setName(feature.text);
    setQuery(feature.place_name);
    setResults([]);
  };

  const handleClearSelection = () => {
    setSelectedFeature(null);
    setQuery('');
    setName('');
  };

  const handleSaveParsedPlace = async (placeData: any) => {
    if (!id || !user?.id) return;
    try {
      setIsSaving(true);
      const newPlace = await createPlace(user.id, {
        listId: id,
        name: placeData.name,
        address: placeData.address,
        lat: placeData.locationInfo?.lat,
        lng: placeData.locationInfo?.lng,
        notes: placeData.notes,
        sourceType: placeData.sourceType,
        parseStatus: (placeData.locationInfo?.lat && placeData.locationInfo?.lat !== 0) ? 'parsed' : 'manual',
      });
      addPlace(newPlace as any);
      router.back();
    } catch (err) {
      console.error('Failed to save parsed place', err);
      alert('Failed to save place. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveManual = async () => {
    if (!name || !id || !user?.id) return;

    try {
      setIsSaving(true);
      const newPlace = await createPlace(user.id, {
        listId: id,
        name,
        address: selectedFeature?.place_name || query,
        lat: selectedFeature?.center[1],
        lng: selectedFeature?.center[0],
        notes,
        sourceType: 'manual',
        parseStatus: selectedFeature ? 'parsed' : 'manual',
      });
      addPlace(newPlace as any);
      router.back();
    } catch (err) {
      console.error('Failed to save place', err);
      alert('Failed to save place. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="close" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Place</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* URL Paster */}
        {!parsedCandidate && (
          <View style={styles.section}>
            <Text style={styles.label}>Paste a Link (Instagram, Maps, etc.)</Text>
            <View style={styles.searchContainer}>
              <MaterialIcons name="link" size={20} color={colors.muted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="https://..."
                value={linkUrl}
                onChangeText={(text) => {
                  setLinkUrl(text);
                  if (parsedCandidate) setParsedCandidate(null);
                }}
                autoCapitalize="none"
              />
              {isParsing && (
                <ActivityIndicator size="small" color={colors.rausch} style={{ marginRight: 8 }} />
              )}
              {linkUrl.length > 0 && !isParsing && (
                <TouchableOpacity onPress={() => setLinkUrl('')} style={styles.clearIcon}>
                  <MaterialIcons name="cancel" size={20} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* If we have a parsed candidate, show the preview instead of manual entry */}
        {parsedCandidate ? (
          <IngestionPreview 
            candidate={parsedCandidate} 
            isSaving={isSaving}
            onSave={handleSaveParsedPlace} 
            onCancel={() => {
              setParsedCandidate(null);
              setLinkUrl('');
            }} 
          />
        ) : (
          <View style={styles.section}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.label}>Search Location</Text>
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a place, cafe, etc."
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                  if (selectedFeature) setSelectedFeature(null);
                }}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={handleClearSelection} style={styles.clearIcon}>
                  <MaterialIcons name="cancel" size={20} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>

            {isSearching && (
              <ActivityIndicator style={{ marginTop: 16 }} color={colors.rausch} />
            )}

            {!selectedFeature && results.length > 0 && (
              <View style={styles.resultsContainer}>
                {results.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.resultItem}
                    onPress={() => handleSelectPlace(item)}
                  >
                    <MaterialIcons name="place" size={20} color={colors.muted} style={styles.resultIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultText}>{item.text}</Text>
                      <Text style={styles.resultSubText} numberOfLines={1}>{item.place_name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedFeature && (
              <View style={styles.formContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Place name"
                />
                
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Why do you want to go here?"
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Manual Save Footer (only if not parsed, because parsed uses IngestionPreview buttons) */}
      {!parsedCandidate && selectedFeature && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveButton, (!name || isSaving) && styles.saveButtonDisabled]} 
            onPress={handleSaveManual}
            disabled={!name || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.canvas} />
            ) : (
              <Text style={styles.saveButtonText}>Save Place</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  backButton: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.bold,
    color: colors.ink,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.hairline,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontFamily: typography.medium,
    color: colors.muted,
  },
  label: {
    fontSize: 14,
    fontFamily: typography.semibold,
    color: colors.ink,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: typography.regular,
    color: colors.ink,
  },
  clearIcon: {
    padding: 8,
  },
  resultsContainer: {
    marginTop: 8,
    backgroundColor: colors.canvas,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceStrong,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultText: {
    fontSize: 15,
    fontFamily: typography.medium,
    color: colors.ink,
  },
  resultSubText: {
    fontSize: 13,
    fontFamily: typography.regular,
    color: colors.muted,
  },
  formContainer: {
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: typography.regular,
    color: colors.ink,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  saveButton: {
    backgroundColor: colors.rausch,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.rauschDisabled,
  },
  saveButtonText: {
    color: colors.canvas,
    fontSize: 16,
    fontFamily: typography.semibold,
  },
});

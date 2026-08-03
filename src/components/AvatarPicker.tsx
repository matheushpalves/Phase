import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type AvatarPickerProps = {
  uri: string | null;
  fallbackLabel: string;
  size?: number;
  loading?: boolean;
  onPress: () => void;
};

export function AvatarPicker({ uri, fallbackLabel, size = 96, loading, onPress }: AvatarPickerProps) {
  return (
    <Pressable onPress={onPress} disabled={loading} style={styles.wrap}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
          !uri && styles.circleFallback,
        ]}
      >
        {uri ? (
          <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />
        ) : (
          <Text style={[styles.fallbackText, { fontSize: size * 0.36 }]}>{fallbackLabel.charAt(0).toUpperCase()}</Text>
        )}
        {loading ? (
          <View style={[styles.overlay, { borderRadius: size / 2 }]}>
            <ActivityIndicator color={colors.white} />
          </View>
        ) : null}
      </View>
      <View style={styles.editBadge}>
        <Text style={styles.editBadgeText}>✎</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleFallback: {
    backgroundColor: colors.primary,
  },
  image: {
    resizeMode: 'cover',
  },
  fallbackText: {
    fontFamily: fonts.heading,
    color: colors.white,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(1, 4, 13, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadgeText: {
    color: colors.white,
    fontSize: 13,
  },
});

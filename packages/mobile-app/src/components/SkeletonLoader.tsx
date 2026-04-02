import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../theme';

export function SkeletonLoader() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <View style={styles.container}>
      {/* Dynamics skeleton */}
      <Animated.View style={[styles.dynamicsCard, { opacity }]}>
        <View style={[styles.line, { width: '60%' }]} />
        <View style={[styles.line, { width: '90%' }]} />
        <View style={[styles.line, { width: '80%' }]} />
        <View style={[styles.line, { width: '70%' }]} />
      </Animated.View>

      {/* Suggestion card skeletons */}
      {[1, 2, 3].map((i) => (
        <Animated.View key={i} style={[styles.suggestionCard, { opacity }]}>
          <View style={[styles.badge, { width: 80 }]} />
          <View style={[styles.textBlock]} />
          <View style={[styles.line, { width: '40%', marginTop: 8 }]} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingTop: 60 },
  dynamicsCard: { backgroundColor: colors.primaryLowest, borderRadius: radii.md, padding: spacing.base, marginBottom: spacing.base },
  line: { height: 14, backgroundColor: colors.primaryMedium, borderRadius: 4, marginBottom: 8 },
  suggestionCard: { backgroundColor: colors.primaryLowest, borderRadius: radii.md, padding: spacing.base, marginBottom: spacing.sm },
  badge: { height: 20, backgroundColor: colors.primaryMedium, borderRadius: 10, marginBottom: 8 },
  textBlock: { height: 50, backgroundColor: colors.primaryMedium, borderRadius: radii.sm },
});

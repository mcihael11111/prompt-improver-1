import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii } from '../theme';

const { width } = Dimensions.get('window');

const slides = [
  { title: 'Text with confidence', subtitle: 'Get AI-powered coaching for any conversation — dating, professional, social, or personal.' },
  { title: 'Understand the dynamics', subtitle: 'See what\'s really happening in your conversations: interest levels, tone, patterns, and subtext.' },
  { title: 'Learn why it works', subtitle: 'Every suggestion comes with reasoning so you become a better communicator over time.' },
];

export function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>💬</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(_, i) => i.toString()}
      />

      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, currentIndex === i && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', justifyContent: 'center' },
  slide: { width, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLowest, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  iconEmoji: { fontSize: 36 },
  title: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.semibold, color: colors.textDark, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: typography.fontSizes.base, color: colors.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing.xl },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryMedium },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  button: { backgroundColor: colors.primary, marginHorizontal: spacing.xl, padding: spacing.base, borderRadius: radii.pill, marginBottom: 40 },
  buttonText: { color: 'white', textAlign: 'center', fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium },
});

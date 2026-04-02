import React from 'react';
import { View } from 'react-native';
import { SkeletonLoader } from '../components/SkeletonLoader';

export function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SkeletonLoader />
    </View>
  );
}

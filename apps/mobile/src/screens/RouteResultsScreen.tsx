import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdProvider } from '../components/ads/AdContext';
import { TradeoffCard } from '../components/trip/TradeoffCard';
import { Colors } from '../constants/colors';
import { TripOption } from '../types/gtfs';
import { PlanStackParamList } from '../navigation/PlanStack';
import { useInterstitialAd } from '../hooks/useInterstitialAd';

type ResultsRoute = RouteProp<PlanStackParamList, 'RouteResults'>;

export function RouteResultsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PlanStackParamList>>();
  const route = useRoute<ResultsRoute>();
  const { options } = route.params;
  const { showAd } = useInterstitialAd();
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const handleSelect = (option: TripOption) => {
    setSelectedLabel(option.label);
    showAd();
    navigation.navigate('RouteDetail', { option });
  };

  return (
    <AdProvider visibility="INTERSTITIAL_ELIGIBLE">
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <FlatList<TripOption>
          data={options}
          keyExtractor={o => o.label}
          renderItem={({ item }) => (
            <TradeoffCard
              option={item}
              onPress={handleSelect}
              selected={item.label === selectedLabel}
            />
          )}
          contentContainerStyle={styles.list}
        />
      </SafeAreaView>
    </AdProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingVertical: 12, paddingBottom: 24 },
});

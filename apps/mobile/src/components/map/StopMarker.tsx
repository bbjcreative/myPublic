import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Text } from 'react-native';
import { Stop } from '../../types/gtfs';
import { Colors } from '../../constants/colors';

interface Props {
  stop: Stop;
  onPress?: () => void;
}

export function StopMarker({ stop, onPress }: Props) {
  return (
    <Marker
      coordinate={{ latitude: stop.lat, longitude: stop.lon }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={styles.dot} />
      <Callout tooltip>
        <View style={styles.callout}>
          <Text style={styles.calloutText}>{stop.stop_name}</Text>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  callout: {
    backgroundColor: Colors.surface,
    padding: 8,
    borderRadius: 8,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  calloutText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
});

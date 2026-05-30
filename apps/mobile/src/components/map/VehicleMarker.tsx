import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { VehiclePosition } from '../../types/gtfs';
import { Colors, getModeColor } from '../../constants/colors';

interface Props {
  vehicle: VehiclePosition;
}

export function VehicleMarker({ vehicle }: Props) {
  const mode = vehicle.route_id.startsWith('KJ') || vehicle.route_id.startsWith('SP') ? 'LRT' : 'BUS';
  const color = getModeColor(mode);

  return (
    <Marker
      coordinate={{ latitude: vehicle.lat, longitude: vehicle.lon }}
      anchor={{ x: 0.5, y: 0.5 }}
      rotation={vehicle.bearing}
      tracksViewChanges={false}
    >
      <View style={[styles.marker, { backgroundColor: color }]}>
        <View style={styles.arrow} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.surface,
    marginTop: -8,
  },
});

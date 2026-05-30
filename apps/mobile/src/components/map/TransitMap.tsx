import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { VehicleMarker } from './VehicleMarker';
import { StopMarker } from './StopMarker';
import { VehiclePosition, Stop } from '../../types/gtfs';

const KL_REGION: Region = {
  latitude: 3.1478,
  longitude: 101.6953,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

interface Props {
  vehicles?: VehiclePosition[];
  stops?: Stop[];
  onStopPress?: (stop: Stop) => void;
  children?: React.ReactNode;
}

export function TransitMap({ vehicles = [], stops = [], onStopPress, children }: Props) {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={KL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        mapType="standard"
      >
        {stops.map(stop => (
          <StopMarker key={stop.stop_id} stop={stop} onPress={() => onStopPress?.(stop)} />
        ))}
        {vehicles.map(v => (
          <VehicleMarker key={v.vehicle_id} vehicle={v} />
        ))}
        {children}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

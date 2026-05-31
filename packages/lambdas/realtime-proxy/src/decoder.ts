import { transit_realtime } from 'gtfs-realtime-bindings';
import { VehiclePosition } from '@my-public/lambda-shared/types';

const OCCUPANCY_MAP: Record<number, VehiclePosition['occupancy']> = {
  0: 'EMPTY',
  1: 'MANY_SEATS_AVAILABLE',
  2: 'MANY_SEATS_AVAILABLE',
  3: 'FEW_SEATS_AVAILABLE',
  4: 'STANDING_ROOM_ONLY',
  5: 'STANDING_ROOM_ONLY',
  6: 'FULL',
};

export function decodeVehiclePositions(buffer: Buffer, agency: string): VehiclePosition[] {
  const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
  const positions: VehiclePosition[] = [];

  for (const entity of feed.entity) {
    const vp = entity.vehicle;
    if (!vp?.position || !vp.vehicle) continue;

    const routeId = vp.trip?.routeId ?? entity.id ?? 'UNKNOWN';
    const vehicleId = vp.vehicle.id ?? entity.id ?? 'UNKNOWN';

    positions.push({
      vehicle_id: `${agency.toUpperCase()}-${vehicleId}`,
      route_id: routeId,
      lat: vp.position.latitude,
      lon: vp.position.longitude,
      bearing: vp.position.bearing ?? 0,
      speed_kmh: vp.position.speed ? Math.round(vp.position.speed * 3.6) : 0,
      occupancy: OCCUPANCY_MAP[vp.occupancyStatus ?? 1] ?? 'MANY_SEATS_AVAILABLE',
      updated_at: Math.floor(Date.now() / 1000),
    });
  }

  return positions;
}

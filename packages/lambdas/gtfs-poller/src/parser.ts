import { parse } from 'csv-parse/sync';
import { Stop, Route, StopSequenceEntry } from '@transit-my/lambda-shared/types';
import { GtfsFeed } from './fetcher';

function encodeGeohash4(lat: number, lon: number): string {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let minLat = -90, maxLat = 90, minLon = -180, maxLon = 180;
  let hash = '';
  let isLon = true;
  let bit = 0;
  let charIdx = 0;

  while (hash.length < 4) {
    if (isLon) {
      const mid = (minLon + maxLon) / 2;
      if (lon >= mid) { charIdx = (charIdx << 1) | 1; minLon = mid; }
      else { charIdx = charIdx << 1; maxLon = mid; }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat >= mid) { charIdx = (charIdx << 1) | 1; minLat = mid; }
      else { charIdx = charIdx << 1; maxLat = mid; }
    }
    isLon = !isLon;
    bit++;
    if (bit === 5) {
      hash += BASE32[charIdx];
      charIdx = 0;
      bit = 0;
    }
  }
  return hash;
}

export interface ParsedFeed {
  stops: Stop[];
  routes: Route[];
}

export function parseFeed(feed: GtfsFeed): ParsedFeed {
  const stops: Stop[] = [];
  const routes: Route[] = [];

  if (feed.files['stops.txt']) {
    const rows = parse(feed.files['stops.txt'], { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    for (const row of rows) {
      const lat = parseFloat(row['stop_lat']);
      const lon = parseFloat(row['stop_lon']);
      if (isNaN(lat) || isNaN(lon)) continue;
      stops.push({
        stop_id: row['stop_id'],
        stop_name: row['stop_name'],
        stop_lat: lat,
        stop_lon: lon,
        agency: feed.agency as Stop['agency'],
        routes: [],
        geohash4: encodeGeohash4(lat, lon),
      });
    }
  }

  const stopTimesByTrip: Record<string, StopSequenceEntry[]> = {};
  if (feed.files['stop_times.txt']) {
    const rows = parse(feed.files['stop_times.txt'], { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    for (const row of rows) {
      const tripId = row['trip_id'];
      if (!stopTimesByTrip[tripId]) stopTimesByTrip[tripId] = [];
      stopTimesByTrip[tripId].push({
        stop_id: row['stop_id'],
        arrival_time: row['arrival_time'],
        departure_time: row['departure_time'],
        stop_sequence: parseInt(row['stop_sequence'], 10),
      });
    }
    for (const seq of Object.values(stopTimesByTrip)) {
      seq.sort((a, b) => a.stop_sequence - b.stop_sequence);
    }
  }

  const routesMeta: Record<string, Record<string, string>> = {};
  if (feed.files['routes.txt']) {
    const rows = parse(feed.files['routes.txt'], { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    for (const row of rows) routesMeta[row['route_id']] = row;
  }

  const tripToRoute: Record<string, string> = {};
  const tripToService: Record<string, string> = {};
  if (feed.files['trips.txt']) {
    const rows = parse(feed.files['trips.txt'], { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    for (const row of rows) {
      tripToRoute[row['trip_id']] = row['route_id'];
      tripToService[row['trip_id']] = row['service_id'];
    }
  }

  for (const [tripId, seq] of Object.entries(stopTimesByTrip)) {
    const routeId = tripToRoute[tripId];
    if (!routeId) continue;
    const meta = routesMeta[routeId];
    if (!meta) continue;

    routes.push({
      route_id: routeId,
      trip_id: tripId,
      service_id: tripToService[tripId] ?? '',
      route_short_name: meta['route_short_name'] ?? '',
      route_long_name: meta['route_long_name'] ?? '',
      agency: feed.agency,
      stop_sequence: seq,
      shape_encoded: '',
    });

    // Back-populate route onto each stop
    for (const entry of seq) {
      const stop = stops.find(s => s.stop_id === entry.stop_id);
      if (stop && !stop.routes.includes(routeId)) stop.routes.push(routeId);
    }
  }

  return { stops, routes };
}

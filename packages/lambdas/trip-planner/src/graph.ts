import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLE_STOPS, TABLE_ROUTES } from '@my-public/lambda-shared/db';
import { Stop, Route } from '@my-public/lambda-shared/types';
import { getDistance } from 'geolib';

export interface TransitNode {
  stop_id: string;
  stop_name: string;
  lat: number;
  lon: number;
  agency: string;
}

export interface TransitEdge {
  from_stop_id: string;
  to_stop_id: string;
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  agency: string;
  mode: string;
  travel_time_min: number;
  fare_myr: number;
  depart_time: string;
  arrive_time: string;
}

export interface TransitGraph {
  nodes: Map<string, TransitNode>;
  edges: Map<string, TransitEdge[]>;
}

function timeToMinutes(time: string): number {
  const parts = time.split(':');
  if (parts.length < 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function modeFromAgency(agency: string): string {
  if (agency === 'ktmb') return 'KTM';
  if (agency === 'prasarana') return 'LRT';
  return 'BUS';
}

function fareFromMode(mode: string, stops: number): number {
  if (mode === 'KTM') return Math.min(1.0 + stops * 0.15, 14.0);
  if (mode === 'LRT' || mode === 'MRT') return Math.min(1.0 + stops * 0.12, 7.0);
  return Math.min(1.0 + stops * 0.05, 5.0);
}

export async function buildTransitGraph(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number
): Promise<TransitGraph> {
  const nodes = new Map<string, TransitNode>();
  const edges = new Map<string, TransitEdge[]>();

  // Fetch all stops (for MVP — production would use geohash bounding box query)
  const stopsResult = await ddb.send(new ScanCommand({
    TableName: TABLE_STOPS,
    FilterExpression: 'SK = :meta',
    ExpressionAttributeValues: { ':meta': 'METADATA' },
    ProjectionExpression: 'stop_id, stop_name, stop_lat, stop_lon, agency',
    Limit: 2000,
  }));

  for (const item of stopsResult.Items ?? []) {
    nodes.set(item.stop_id as string, {
      stop_id: item.stop_id as string,
      stop_name: item.stop_name as string,
      lat: item.stop_lat as number,
      lon: item.stop_lon as number,
      agency: item.agency as string,
    });
  }

  // Fetch routes
  const routesResult = await ddb.send(new ScanCommand({
    TableName: TABLE_ROUTES,
    Limit: 5000,
  }));

  for (const item of routesResult.Items ?? []) {
    const seq = (item.stop_sequence as Array<{ stop_id: string; departure_time: string; arrival_time: string }>) ?? [];
    const mode = modeFromAgency(item.agency as string);

    for (let i = 0; i < seq.length - 1; i++) {
      const from = seq[i];
      const to = seq[i + 1];

      const departMin = timeToMinutes(from.departure_time);
      const arriveMin = timeToMinutes(to.arrival_time);
      const travelTime = Math.max(arriveMin - departMin, 1);
      const fare = fareFromMode(mode, seq.length);

      const edge: TransitEdge = {
        from_stop_id: from.stop_id,
        to_stop_id: to.stop_id,
        route_id: item.route_id as string,
        route_short_name: item.route_short_name as string,
        route_long_name: item.route_long_name as string,
        agency: item.agency as string,
        mode,
        travel_time_min: travelTime,
        fare_myr: fare,
        depart_time: from.departure_time,
        arrive_time: to.arrival_time,
      };

      if (!edges.has(from.stop_id)) edges.set(from.stop_id, []);
      edges.get(from.stop_id)!.push(edge);
    }
  }

  return { nodes, edges };
}

export function findNearestStops(
  nodes: Map<string, TransitNode>,
  lat: number,
  lon: number,
  maxDistanceM = 800
): TransitNode[] {
  const nearby: Array<{ node: TransitNode; dist: number }> = [];
  for (const node of nodes.values()) {
    const dist = getDistance({ lat, lon }, { lat: node.lat, lon: node.lon });
    if (dist <= maxDistanceM) nearby.push({ node, dist });
  }
  return nearby.sort((a, b) => a.dist - b.dist).slice(0, 5).map(x => x.node);
}

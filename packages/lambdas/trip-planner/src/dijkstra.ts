import { TransitGraph, TransitEdge, TransitNode } from './graph';
import { TripLeg } from '@my-public/lambda-shared/types';
import { getDistance } from 'geolib';

const WALK_SPEED_M_PER_MIN = 80;

interface DijkstraState {
  stop_id: string;
  cost: number;
  walk_min: number;
  fare_myr: number;
  path: TripLeg[];
}

function walkLeg(from: TransitNode, to: TransitNode): TripLeg {
  const dist = getDistance({ lat: from.lat, lon: from.lon }, { lat: to.lat, lon: to.lon });
  return {
    mode: 'walk',
    from: from.stop_name,
    to: to.stop_name,
    from_stop_id: from.stop_id,
    to_stop_id: to.stop_id,
    duration_min: Math.ceil(dist / WALK_SPEED_M_PER_MIN),
  };
}

export interface RouteResult {
  legs: TripLeg[];
  duration_min: number;
  walk_min: number;
  fare_myr: number;
}

export function dijkstra(
  graph: TransitGraph,
  originStops: TransitNode[],
  destStops: TransitNode[],
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number,
  costFn: (edge: TransitEdge) => number
): RouteResult | null {
  const dist = new Map<string, number>();
  const visited = new Set<string>();
  const queue: DijkstraState[] = [];

  const destStopIds = new Set(destStops.map(s => s.stop_id));

  for (const stop of originStops) {
    const walkDist = getDistance({ lat: originLat, lon: originLon }, { lat: stop.lat, lon: stop.lon });
    const walkMin = Math.ceil(walkDist / WALK_SPEED_M_PER_MIN);
    const initialCost = costFn({ travel_time_min: walkMin } as TransitEdge);
    const initialLeg: TripLeg = {
      mode: 'walk',
      from: 'Current Location',
      to: stop.stop_name,
      to_stop_id: stop.stop_id,
      duration_min: walkMin,
    };
    queue.push({ stop_id: stop.stop_id, cost: initialCost, walk_min: walkMin, fare_myr: 0, path: [initialLeg] });
    dist.set(stop.stop_id, initialCost);
  }

  queue.sort((a, b) => a.cost - b.cost);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.stop_id)) continue;
    visited.add(current.stop_id);

    if (destStopIds.has(current.stop_id)) {
      const destStop = destStops.find(s => s.stop_id === current.stop_id)!;
      const finalWalkDist = getDistance({ lat: destStop.lat, lon: destStop.lon }, { lat: destLat, lon: destLon });
      const finalWalkMin = Math.ceil(finalWalkDist / WALK_SPEED_M_PER_MIN);
      const finalLeg: TripLeg = {
        mode: 'walk',
        from: destStop.stop_name,
        to: 'Destination',
        from_stop_id: destStop.stop_id,
        duration_min: finalWalkMin,
      };
      const legs = [...current.path, finalLeg];
      const totalDuration = legs.reduce((sum, l) => sum + l.duration_min, 0);
      const totalWalk = current.walk_min + finalWalkMin;
      return { legs, duration_min: totalDuration, walk_min: totalWalk, fare_myr: current.fare_myr };
    }

    const edges = graph.edges.get(current.stop_id) ?? [];
    for (const edge of edges) {
      if (visited.has(edge.to_stop_id)) continue;

      const toNode = graph.nodes.get(edge.to_stop_id);
      if (!toNode) continue;

      const edgeCost = costFn(edge);
      const newCost = current.cost + edgeCost;
      const prevCost = dist.get(edge.to_stop_id) ?? Infinity;

      if (newCost < prevCost) {
        dist.set(edge.to_stop_id, newCost);

        const lastLeg = current.path[current.path.length - 1];
        const isTransfer = lastLeg?.route_id !== edge.route_id;
        let newLegs: TripLeg[];

        if (lastLeg && lastLeg.mode !== 'walk' && !isTransfer) {
          // Extend current transit leg
          const extended: TripLeg = {
            ...lastLeg,
            to: toNode.stop_name,
            to_stop_id: edge.to_stop_id,
            duration_min: lastLeg.duration_min + edge.travel_time_min,
            stops: (lastLeg.stops ?? 0) + 1,
            arrive: edge.arrive_time,
          };
          newLegs = [...current.path.slice(0, -1), extended];
        } else {
          const newLeg: TripLeg = {
            mode: edge.mode as TripLeg['mode'],
            from: graph.nodes.get(edge.from_stop_id)?.stop_name ?? edge.from_stop_id,
            to: toNode.stop_name,
            from_stop_id: edge.from_stop_id,
            to_stop_id: edge.to_stop_id,
            duration_min: edge.travel_time_min,
            line: edge.route_long_name || edge.route_short_name,
            route_id: edge.route_id,
            depart: edge.depart_time,
            arrive: edge.arrive_time,
            stops: 1,
            alert: null,
          };
          newLegs = [...current.path, newLeg];
        }

        queue.push({
          stop_id: edge.to_stop_id,
          cost: newCost,
          walk_min: current.walk_min,
          fare_myr: current.fare_myr + edge.fare_myr,
          path: newLegs,
        });
        queue.sort((a, b) => a.cost - b.cost);
      }
    }
  }

  return null;
}

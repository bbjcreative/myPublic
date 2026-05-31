import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { jsonResponse, errorResponse, ApiError } from '@my-public/lambda-shared/errors';
import { validateLatLon } from '@my-public/lambda-shared/validation';
import { buildTransitGraph, findNearestStops } from './graph';
import { dijkstra } from './dijkstra';
import { formatTripOptions } from './formatter';

interface TripRequest {
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  depart_at?: number;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    if (!event.body) throw new ApiError('MISSING_BODY', 'Request body is required', 400);

    let body: TripRequest;
    try {
      body = JSON.parse(event.body) as TripRequest;
    } catch {
      throw new ApiError('INVALID_JSON', 'Request body must be valid JSON', 400);
    }

    if (!body.origin?.lat || !body.origin?.lon) throw new ApiError('MISSING_ORIGIN', 'origin.lat and origin.lon are required', 400);
    if (!body.destination?.lat || !body.destination?.lon) throw new ApiError('MISSING_DEST', 'destination.lat and destination.lon are required', 400);

    validateLatLon(body.origin.lat, body.origin.lon);
    validateLatLon(body.destination.lat, body.destination.lon);

    const graph = await buildTransitGraph(
      body.origin.lat, body.origin.lon,
      body.destination.lat, body.destination.lon
    );

    const originStops = findNearestStops(graph.nodes, body.origin.lat, body.origin.lon);
    const destStops = findNearestStops(graph.nodes, body.destination.lat, body.destination.lon);

    if (originStops.length === 0) throw new ApiError('NO_STOPS_NEAR_ORIGIN', 'No transit stops found within 800m of origin', 404);
    if (destStops.length === 0) throw new ApiError('NO_STOPS_NEAR_DEST', 'No transit stops found within 800m of destination', 404);

    // Run three Dijkstra variants with different cost functions
    const fastest = dijkstra(graph, originStops, destStops, body.origin.lat, body.origin.lon, body.destination.lat, body.destination.lon,
      edge => edge.travel_time_min
    );
    const leastWalking = dijkstra(graph, originStops, destStops, body.origin.lat, body.origin.lon, body.destination.lat, body.destination.lon,
      edge => edge.travel_time_min + (edge.mode === 'walk' ? 5 : 0)
    );
    const cheapest = dijkstra(graph, originStops, destStops, body.origin.lat, body.origin.lon, body.destination.lat, body.destination.lon,
      edge => edge.fare_myr * 10
    );

    const options = formatTripOptions(fastest, leastWalking, cheapest);

    if (options.length === 0) throw new ApiError('NO_ROUTE_FOUND', 'No route found between origin and destination', 404);

    return jsonResponse({ options });
  } catch (err) {
    return errorResponse(err) as APIGatewayProxyResultV2;
  }
}

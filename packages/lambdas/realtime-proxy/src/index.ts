import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { jsonResponse, errorResponse, ApiError } from '@my-public/lambda-shared/errors';
import { requireQueryParam } from '@my-public/lambda-shared/validation';
import { fetchRealtimeFeed, getSupportedAgencies } from './fetcher';
import { decodeVehiclePositions } from './decoder';

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const params = event.queryStringParameters ?? {};
    const agency = requireQueryParam(params, 'agency');

    if (!getSupportedAgencies().includes(agency)) {
      throw new ApiError(
        'UNSUPPORTED_AGENCY',
        `Agency '${agency}' not supported. Valid: ${getSupportedAgencies().join(', ')}`,
        400
      );
    }

    const buffer = await fetchRealtimeFeed(agency);
    const vehicles = decodeVehiclePositions(buffer, agency);

    // Optional filter by route_id
    const routeId = params['route_id'];
    const filtered = routeId ? vehicles.filter(v => v.route_id === routeId) : vehicles;

    return jsonResponse({ vehicles: filtered, count: filtered.length });
  } catch (err) {
    return errorResponse(err) as APIGatewayProxyResultV2;
  }
}

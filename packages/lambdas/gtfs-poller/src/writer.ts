import { BatchWriteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { ddb, TABLE_STOPS, TABLE_ROUTES } from '@transit-my/lambda-shared/db';
import { Stop, Route } from '@transit-my/lambda-shared/types';

const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'ap-southeast-1' });
const S3_BUCKET = process.env.GTFS_S3_BUCKET ?? '';
const TTL_SECONDS = 8 * 24 * 60 * 60; // 8 days — survives until next weekly poll

function ttlEpoch(): number {
  return Math.floor(Date.now() / 1000) + TTL_SECONDS;
}

async function batchWrite(tableName: string, items: Record<string, unknown>[]): Promise<void> {
  const CHUNK = 25; // DynamoDB batch write max
  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    await ddb.send(new BatchWriteCommand({
      RequestItems: {
        [tableName]: chunk.map(item => ({ PutRequest: { Item: item } })),
      },
    }));
  }
}

export async function writeStops(stops: Stop[]): Promise<void> {
  const ttl = ttlEpoch();
  const items = stops.map(s => ({
    PK: `STOP#${s.stop_id}`,
    SK: 'METADATA',
    stop_id: s.stop_id,
    stop_name: s.stop_name,
    stop_lat: s.stop_lat,
    stop_lon: s.stop_lon,
    agency: s.agency,
    routes: s.routes,
    geohash4: s.geohash4,
    ttl,
  }));
  await batchWrite(TABLE_STOPS, items);
  console.log(`Wrote ${stops.length} stops to DynamoDB`);
}

export async function writeRoutes(routes: Route[]): Promise<void> {
  const ttl = ttlEpoch();
  const items = routes.map(r => ({
    PK: `ROUTE#${r.route_id}`,
    SK: `TRIP#${r.trip_id}#${r.service_id}`,
    route_id: r.route_id,
    trip_id: r.trip_id,
    service_id: r.service_id,
    route_short_name: r.route_short_name,
    route_long_name: r.route_long_name,
    agency: r.agency,
    stop_sequence: r.stop_sequence,
    shape_encoded: r.shape_encoded,
    ttl,
  }));
  await batchWrite(TABLE_ROUTES, items);
  console.log(`Wrote ${routes.length} routes to DynamoDB`);
}

export async function cacheRawToS3(agency: string, filename: string, content: string): Promise<void> {
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: `gtfs/${agency}/${filename}`,
    Body: content,
    ContentType: 'text/csv',
  }));
}

export async function writeLastPollMetadata(agencyCount: number, stopCount: number, routeCount: number): Promise<void> {
  await ddb.send(new PutCommand({
    TableName: TABLE_STOPS,
    Item: {
      PK: 'SYSTEM#GTFS_POLL',
      SK: 'METADATA',
      polled_at: Math.floor(Date.now() / 1000),
      agency_count: agencyCount,
      stop_count: stopCount,
      route_count: routeCount,
    },
  }));
}

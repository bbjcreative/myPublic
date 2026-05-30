import axios from 'axios';

const REALTIME_FEEDS: { agency: string; url: string }[] = [
  {
    agency: 'prasarana',
    url: 'https://api.data.gov.my/gtfs-realtime/vehicle-position/prasarana',
  },
  {
    agency: 'ktmb',
    url: 'https://api.data.gov.my/gtfs-realtime/vehicle-position/ktmb',
  },
];

export async function fetchRealtimeFeed(agency: string): Promise<Buffer> {
  const feed = REALTIME_FEEDS.find(f => f.agency === agency);
  if (!feed) throw new Error(`Unknown agency: ${agency}`);

  const response = await axios.get(feed.url, {
    headers: { Accept: 'application/x-protobuf' },
    responseType: 'arraybuffer',
    timeout: 10_000,
  });

  return Buffer.from(response.data);
}

export function getSupportedAgencies(): string[] {
  return REALTIME_FEEDS.map(f => f.agency);
}

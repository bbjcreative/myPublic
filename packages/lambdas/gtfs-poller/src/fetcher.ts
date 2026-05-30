import axios from 'axios';
import AdmZip from 'adm-zip';

const GTFS_BASE = 'https://api.data.gov.my/gtfs-static';

const AGENCY_FEEDS: { agency: string; path: string }[] = [
  { agency: 'prasarana', path: '/prasarana' },
  { agency: 'ktmb', path: '/ktmb' },
  { agency: 'bas_my', path: '/bas_my' },
];

export interface GtfsFeed {
  agency: string;
  files: Record<string, string>;
}

export async function fetchAllFeeds(): Promise<GtfsFeed[]> {
  const results = await Promise.allSettled(
    AGENCY_FEEDS.map(async ({ agency, path }) => {
      const url = `${GTFS_BASE}${path}`;
      console.log(`Fetching GTFS for ${agency} from ${url}`);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 60_000,
      });

      const zip = new AdmZip(Buffer.from(response.data));
      const files: Record<string, string> = {};

      for (const entry of zip.getEntries()) {
        if (!entry.isDirectory) {
          files[entry.entryName] = entry.getData().toString('utf-8');
        }
      }

      console.log(`Fetched ${agency}: ${Object.keys(files).join(', ')}`);
      return { agency, files } as GtfsFeed;
    })
  );

  const feeds: GtfsFeed[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      feeds.push(result.value);
    } else {
      console.error('Feed fetch failed:', result.reason);
    }
  }

  if (feeds.length === 0) {
    throw new Error('All GTFS feeds failed to fetch');
  }

  return feeds;
}

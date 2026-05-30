import { fetchAllFeeds } from './fetcher';
import { parseFeed } from './parser';
import { writeStops, writeRoutes, cacheRawToS3, writeLastPollMetadata } from './writer';

export async function handler(): Promise<void> {
  console.log('GTFS poller starting');

  const feeds = await fetchAllFeeds();

  let totalStops = 0;
  let totalRoutes = 0;

  for (const feed of feeds) {
    console.log(`Parsing feed: ${feed.agency}`);
    const { stops, routes } = parseFeed(feed);

    await writeStops(stops);
    await writeRoutes(routes);

    for (const [filename, content] of Object.entries(feed.files)) {
      await cacheRawToS3(feed.agency, filename, content);
    }

    totalStops += stops.length;
    totalRoutes += routes.length;
    console.log(`${feed.agency}: ${stops.length} stops, ${routes.length} routes`);
  }

  await writeLastPollMetadata(feeds.length, totalStops, totalRoutes);
  console.log(`GTFS poll complete: ${feeds.length} agencies, ${totalStops} stops, ${totalRoutes} routes`);
}

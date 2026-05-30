import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10_000,
});

//Standardize so we push an array of valid items
const setToSchemaStandard = (item, feedMeta) => {
  const guid = (item.guid || item.link).trim();
  const pubDate = item.pubDate
    ? new Date(item.pubDate)
    : new Date(item.isoDate);
  const link = item.link;
  const title = item.title;
  const sourceName = feedMeta.title;
  const sourceUrl = feedMeta.link;
  return {
    guid,
    pubDate,
    link,
    title,
    sourceName,
    sourceUrl,
  };
};

const parseFeed = async (feedUrl) => {
  let feed;
  try {
    feed = await parser.parseURL(feedUrl);
  } catch (error) {
    // console.error("ERR AT PARSEFEED", error);
    return [];
  }

  const schemaApproved = [];

  for (const item of feed.items) {
    schemaApproved.push(setToSchemaStandard(item, feed));
  }

  return schemaApproved;
};

// const getFeedArray = async (url) => {
//   let rssText;

//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`HTTP error status: ${response.status}`);
//     }
//     rssText = await response.text();
//     // return rssText;
//     console.log(rssText);
//   } catch (error) {
//     console.error("ERROR fetching feed:", error);
//   }

// };

// const rawFeeds = process.env.RAW_FEEDS;
// const rssURLs = rawFeeds.split(",").map((item) => item.trim());

// for (const rssURL of rssURLs) {
//   try {
//     parseFeed(rssURL);
//   } catch (error) {
//     console.error(`Error fetching from ${error} `);
//   }
// }

export { parseFeed };

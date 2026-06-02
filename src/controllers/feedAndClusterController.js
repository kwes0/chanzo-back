import { prisma } from "../config/db.js";
import { assignCluster } from "../utils/clusterEngine.js";
import { deDupeArticle } from "../utils/deDupe.js";
import { parseFeed } from "../utils/getFeedArray.js";

const feedandCluster = async (req, res) => {
  const rawFeeds = process.env.RAW_FEEDS?.split(",")
    .map((url) => url.trim())
    .filter(Boolean); //This removes empty strings if there's a trailing comma

  // const rawFeeds = ["https://www.standardmedia.co.ke/rss/headlines.php"];
  if (rawFeeds < 1 || !rawFeeds) {
    res.status(404).json({
      error: "No raw feeds found",
    });
  }

  try {
    //All feed title collected.
    const allItems = [];

    for (const rawFeed of rawFeeds) {
      const arrayOfFeeds = await parseFeed(rawFeed);
      allItems.push(...arrayOfFeeds);
    }
    if (allItems === 0) {
      res.status(404).json({
        error: "Nothing was fetched from the feeds",
      });
    }
    //Dedupe articles
    const nonDups = [];
    for (const item of allItems) {
      const nonDuped = await deDupeArticle(item);
      nonDups.push(...nonDuped);
    }
    const createdArticles = [];
    for (const article of nonDups) {
      const clusterId = await assignCluster(article.title);

      const createdArticle = await prisma.article.create({
        data: {
          ...article,
          clusterId: clusterId,
        },
      });
      createdArticles.push(createdArticle);
    }

    await prisma.fetchedFeed.create({
      data: {
        feedCount: nonDups.length,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        fetched: allItems.length,
        inserted: createdArticles.length,
      },
    });
  } catch (e) {
    console.error("Feed and cluster error:", e);
    res.status(500).json({
      status: "failed",
      message: "Failed at feed, cluster and save",
    });
  }
};

export { feedandCluster };

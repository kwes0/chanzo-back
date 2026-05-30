import { parseFeed } from "../utils/getFeedArray.js";

const getFeedInArray = async (req, res) => {
  const rawFeeds = process.env.RAW_FEEDS?.split(",")
    .map((url) => url.trim())
    .filter(Boolean); //This removes empty strings if there's a trailing comma

  // const rawFeeds = ["https://www.kenyans.co.ke/feeds/news?_wrapper_format=html","https://nation.africa/kenya/rss.xml","https://www.standardmedia.co.ke/rss/headlines.php"]
  const allItems = [];

  for (const rawFeed of rawFeeds) {
    try {
      const arrayOfFeeds = await parseFeed(rawFeed);
      allItems.push(...arrayOfFeeds);
    } catch (error) {
      console.error("There is an processing the request", error.message);
    }
  }
    if (allItems.length === 0) {
      res.status(404).json({
        status: "error",
        message: "No items were found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        count: allItems.length,
        arrayOfFeeds: allItems,
      },
    });
  
};

export { getFeedInArray };

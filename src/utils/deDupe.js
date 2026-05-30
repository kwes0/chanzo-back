import { prisma } from "../config/db.js";

const articleExistence = async (guid, pubDate) => {
  const count = await prisma.article.count({
    where: {
      guid: guid,
      pubDate: pubDate,
    },
  });
  return count > 0;
};

const deDupeArticle = async (articleItem) => {
  const { guid, pubDate} = articleItem; //We are passing the whole articleItem, however we just need the guid and pubDate to run the check.

  let nonDupes = [];

  try {
    const exists = await articleExistence(guid, pubDate);//Returns a true or false

    if (!exists) {
      nonDupes.push({ ...articleItem });
    }
  } catch (e) {
    console.error("DEDUPE ARTICLE ERR:", e);
  }

  return nonDupes; //This array of items is where we are going to apply the cluster engine
};

export {deDupeArticle}
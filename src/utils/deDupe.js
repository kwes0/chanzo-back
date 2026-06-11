// import { prisma } from "../config/db.js";

// const articleExistence = async (guid) => {
//   const article = await prisma.article.findUnique({ //DB guid is marked as unique
//     where: {
//       guid: guid,
//       // pubDate: pubDate,
//     },
//     select: {
//       id: true,
//     },
//   });
//   return article !== null; //if article is present then we get back true
// };

// const deDupeArticle = async (articleItem) => {
//   const { guid } = articleItem; //We are passing the whole articleItem, however we just need the guid and pubDate to run the check.

//   let nonDupes = [];

//   try {
//     const exists = await articleExistence(guid); //Returns a true or false

//     if (!exists) {
//       nonDupes.push({ ...articleItem });
//     }
//   } catch (e) {
//     console.error("DEDUPE ARTICLE ERR:", e);
//   }

//   return nonDupes; //This array of items is where we are going to apply the cluster engine
// };

// export { deDupeArticle };

import { prisma } from "../config/db.js";
//Batch dedupe and making sure filter is by guid since it is unique in db.
const deDupeArticle = async (articles) => {
  //takes an array of feed articles
  const uniqueByGuid = new Map(); //Non duplicates within the requested batch

  for (const article of articles) {
    if (!article.guid) continue;

    uniqueByGuid.set(article.guid, article);//key has to be unique.
  }

  const uniqueArticles = [...uniqueByGuid.values()];//Create an array of unique articles 

  if (uniqueArticles.length === 0) {
    return [];
  }//exit early if we don't need to check the db.

  const existingArticles = await prisma.article.findMany({
    where: {
      guid: {
        in: uniqueArticles.map((article) => article.guid),
      },
    },
    select: {
      //Define a type that only contains a subset of the scalar fields
      guid: true,
    },
  });
  
  const existingGuids = new Set(
    existingArticles.map((article) => article.guid),
  );

  //return articles filtering out existingArticles
  return uniqueArticles.filter((article) => !existingGuids.has(article.guid));
};

export { deDupeArticle };

import { prisma } from "../config/db.js";

const deDupeArticle = async (articles) => {
  const uniqueByGuid = new Map();

  for (const article of articles) {
    if (!article.guid) continue;

    uniqueByGuid.set(article.guid, article);
  }

  const uniqueArticles = [...uniqueByGuid.values()];

  if (uniqueArticles.length === 0) {
    return [];
  }

  const existingArticles = await prisma.article.findMany({
    where: {
      guid: {
        in: uniqueArticles.map((article) => article.guid),
      },
    },
    select: {
      guid: true,
    },
  });

  const existingGuids = new Set(
    existingArticles.map((article) => article.guid),
  );

  return uniqueArticles.filter((article) => !existingGuids.has(article.guid));
};

export { deDupeArticle };

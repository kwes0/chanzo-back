import { prisma } from "../config/db.js";

const allClustered = async (req, res) => {
  //I want to display the clusters and their responding articles
  //Due to the relationship between the cluster and articles I can just do this
  try {
    const clusters = await prisma.cluster.findMany({
      include: {
        articles: true,
      },
      orderBy: {
        articles: {
          _count: "desc",
        },
      },
    });

    const clusteredForDisplay = clusters.map((cluster) => ({
      title: cluster.title,
      id: cluster.id,
      createdAt: cluster.createdAt,
      updatedAt: cluster.updatedAt,
      articleCount: cluster.articles.length,
      articles: cluster.articles,
    }));

    return res.status(200).json({
      data: clusteredForDisplay,
    });
  } catch (e) {
    console.error(e.message);
    return res.status(404).json({
      status: "error",
      message: "Error data haitaki kukuwa fed",
    });
  }
};

const getWeeksClusters = async (req, res) => {
  // params - singleArticles
};

export { allClustered, getWeeksClusters };

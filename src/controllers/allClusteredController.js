import { prisma } from "../config/db.js";
import { getActiveClusterWindow } from "../utils/activeClusterWindow.js";

const allClustered = async (req, res) => {
  //This is best for search
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

const weeksCluster = () => {
  //This is best for tiered search
  const { start, end } = getActiveClusterWindow();
  console.log(`cluster duration: ${start} - ${end}`);
  //Cluster DB query.
  return prisma.cluster.findMany({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
    include: {
      articles: true,
    },
  });
};

const getWeeksClusters = async (req, res) => {
  try {
    const theClusters = await weeksCluster();
    const thisWeekCluster = theClusters.map((aCluster) => ({
      title: aCluster.title,
      id: aCluster.id,
      createdAt: aCluster.createdAt,
      updatedAt: aCluster.updatedAt,
      articleCount: aCluster.articles.length,
      articles: aCluster.articles,
    }));
    return res.status(200).json({
      status: "success",
      data: thisWeekCluster,
    });
  } catch (e) {
    console.log(e.message);
    res.status(404).json({
      status: "failed",
      message: "Error fetching weeks cluster",
    });
  }
};

export { allClustered, getWeeksClusters };

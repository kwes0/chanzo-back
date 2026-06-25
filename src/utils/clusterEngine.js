import { prisma } from "../config/db.js";
import { getActiveClusterWindow } from "./activeClusterWindow.js";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "after",
  "by",
  "for",
  "from",
  "in",
  "inside",
  "into",
  "is",
  "of",
  "on",
  "over",
  "the",
  "to",
  "with",
  "what",
  "must",
  "do",
  "why",
]);

const tokenise = (str) => {
  return String(str ?? "")
    .toLowerCase()
    .replace(/['’]s\b/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token));
};

const getTokenSet = (str) => {
  return new Set(tokenise(str));
};

const getBigram = (str) => {
  const tokens = tokenise(str);
  const bigrams = new Set();
  if (!tokens) {
    return bigrams;
  }

  if (tokens.length === 1) {
    bigrams.add(tokens[0]);
    return bigrams;
  }

  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.add(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return bigrams;
};

const diceCoefficient = (strA, strT) => {
  if (strA.size === 0 || strT.size === 0) return 0;

  let intersection = 0;
  for (const str of strA) {
    if (strT.has(str)) intersection++;
  }

  return (2 * intersection) / (strA.size + strT.size);
};

const similarityScore = (titleA, titleB) => {
  const tokenScore = diceCoefficient(getTokenSet(titleA), getTokenSet(titleB));
  const bigramScore = diceCoefficient(getBigram(titleA), getBigram(titleB));

  return tokenScore * 0.7 + bigramScore * 0.3;
};

const getActiveClusters = () => {
  const { start, end } = getActiveClusterWindow();
  console.log(`cluster duration: ${start} - ${end}`);

  return prisma.cluster.findMany({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });
};

const assignCluster = async (articleTitle) => {
  const DICE_THRESHOLD = Number(process.env.DICE_THRESHOLD ?? 0.2);
  const activeClusters = await getActiveClusters();

  let bestMatch = null;
  let comparisonScore = 0;

  for (const cluster of activeClusters) {
    const comparison = similarityScore(articleTitle, cluster.title);
    if (comparison > comparisonScore) {
      bestMatch = cluster;
      comparisonScore = comparison;
    }
  }

  if (comparisonScore >= DICE_THRESHOLD && bestMatch) {
    return bestMatch.id;
  }

  const newCluster = await prisma.cluster.create({
    data: {
      title: articleTitle,
    },
  });

  return newCluster.id;
};

const __test__ = {
  tokenise,
  getTokenSet,
  getBigram,
  diceCoefficient,
  similarityScore,
  getActiveClusterWindow,
};

export { assignCluster, __test__ };

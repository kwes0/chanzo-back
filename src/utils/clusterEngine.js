import { prisma } from "../config/db.js";

//Tokenise so that everything is came case, no punctuation, split and filtered to remove  falsy values (such as null, undefined, false, 0, "", and NaN) from an array.
const tokenise = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Replace punctuation with nothing
    .split(/\s+/) //This splits at every sequence of a whitespace character, space, tab or newlines.
    .filter(Boolean);
};

// bigram the tokenised output
const getBigram = (str) => {
  const tokens = tokenise(str);
  const bigrams = new Set(); //The constructor creates a set object that stores unique values of any type. It accepts optional iterable to initialise the set, automatically removing duplicates.

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

//Calculate the SDC getting the title and conparing to the current string.
const diceCoefficient = (strA, strT) => {
  const bigramA = getBigram(strA);
  const bigramT = getBigram(strT);

  if (bigramA.size === 0 || bigramT.size === 0) return 0;
  //We are using size because our bigram are sets and not arrays. Maps and sets do not have a length property.

  //calculate SDC
  let intersection = 0;
  for (const bigram of bigramA) {
    if (bigramT.has(bigram)) intersection++;
    //Use .has() with Map and Set for fast existence checks. Avoid the in operator for objects when you only care about own properties—use hasOwnProperty() instead to avoid checking inherited properties.
  }

  return (2 * intersection) / (bigramA.size + bigramT.size);
};

//getActiveCluster - Get everything by latest date from the cluster to get the clusters of available in my DB
const getTodayWindow = (now = new Date()) => {
  const DAY_IN_MS = 24 * 60 * 60 * 1000; //Full day in ms 86,400,000 ms
  const KENYA_UTC_OFFSET_IN_MINUTES = 3 * 60; //new Date output is utc and Kenya is UTC+3. 180min

  const offsetInMs = KENYA_UTC_OFFSET_IN_MINUTES * 60 * 1000; //180min to ms. 10,800,000 ms
  const kenyaNow = new Date(now.getTime() + offsetInMs); //This gets today's date and changes it to now. The data is stored with kenyan time so that should reflect relative to the utc.
  const startOfTodayUTC =
    Date.UTC(
      kenyaNow.getUTCFullYear(),
      kenyaNow.getUTCMonth(),
      kenyaNow.getUTCDate(),
    ) - offsetInMs;
  //Get the day from the date
  return {
    start: new Date(startOfTodayUTC),
    end: new Date(startOfTodayUTC + DAY_IN_MS),
  };
};

const getActiveClusters = () => {
  //Get today window
  const { start, end } = getTodayWindow();
  //Cluster DB query.
  return prisma.cluster.findMany({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });
  //Review implementation with select:{ id: true, title: true,}
};

//Assigning cluster or create new cluster and output the new clust and assigner the id to the articles in the cluster.

const assignCluster = async (articleTitle) => {
  const DICE_THRESHOLD = Number(process.env.DICE_THRESHOLD ?? 0.55); //env always returns a string and for this comparison we need a number. Number is Cap first letter.
  const activeClusters = await getActiveClusters();

  let bestMatch = null; //We don't return nothing if there is no match
  let comparisonScore = 0; //After SDC calculation.

  for (const cluster of activeClusters) {
    const comparisom = diceCoefficient(articleTitle, cluster.title); //because cluster is an object, and we are comparing strings. cluster is now lowered as well for comparison

    if (comparisom > comparisonScore) {
      bestMatch = cluster; //This is because we return this ids cluster to assign and map it to the fresh articles.
      comparisonScore = comparisom;
    }
  }

  //Did we find a match??
  if (comparisonScore >= DICE_THRESHOLD && bestMatch) {
    return bestMatch.id; //This will be the clusterId of the best matched to article. This is what we will assign when creating the article
  }

  //Hakuna match kwa cluster
  const newCluster = await prisma.cluster.create({
    data: {
      title: articleTitle,
    },
  });

  return newCluster.id; //Currently returning the whole cluster but ideally should just create the new id
};

export { assignCluster };

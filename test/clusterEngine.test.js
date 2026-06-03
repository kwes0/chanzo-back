import assert from "node:assert/strict";
import test from "node:test";
import { prisma } from "../src/config/db.js";
import { __test__ } from "../src/utils/clusterEngine.js";

test.after(async () => {
  await prisma.$disconnect();
});

test("tokenise normalizes titles and tolerates undefined input", () => {
  // What is tested:
  //   The cluster engine tokenizer lowercases text, removes punctuation, removes
  //   stop words, and does not crash when a title is undefined.
  // Why:
  //   RSS data is external. A bad title should not crash the whole cron run.
  // Input:
  //   A punctuated title plus undefined.
  // Expected output:
  //   Meaningful lowercase tokens, and [] for undefined.
  // Recommended fail-safe:
  //   Keep String(str ?? "") in tokenise so malformed feed items fail closed.
  assert.deepEqual(
    __test__.tokenise("Court orders State to reveal U.S. Ebola facility!"),
    ["court", "orders", "state", "reveal", "us", "ebola", "facility"],
  );

  assert.deepEqual(__test__.tokenise(undefined), []);
});

test("getBigram creates adjacent title phrases used for stricter clustering", () => {
  // What is tested:
  //   Bigram generation from normalized tokens.
  // Why:
  //   Bigrams prevent the engine from relying only on loose shared words.
  // Input:
  //   "US Ebola facility".
  // Expected output:
  //   "us_ebola" and "ebola_facility".
  // Recommended fail-safe:
  //   Keep bigram scoring below token scoring weight so wording changes do not
  //   split obviously related articles.
  assert.deepEqual([...__test__.getBigram("US Ebola facility")], [
    "us_ebola",
    "ebola_facility",
  ]);
});

test("similarityScore ranks related Ebola facility titles above unrelated US titles", () => {
  // What is tested:
  //   Token Dice + Bigram Dice produces a higher score for related story titles.
  // Why:
  //   The V1 cluster engine should group related headlines without merging every
  //   article that merely mentions "US" or "Kenya".
  // Input:
  //   One base Ebola facility title, one related Ebola facility title, and one
  //   unrelated US visa title.
  // Expected output:
  //   Related score is greater than unrelated score.
  // Recommended fail-safe:
  //   If future threshold tuning changes this relationship, review the stop-word
  //   list and generic-token handling before lowering thresholds broadly.
  const baseTitle =
    "Court orders state to make public Sh1.7b US Ebola quarantine facility deal";
  const relatedTitle = "Two Killed in Nanyuki Protests Over U.S. Ebola Facility";
  const unrelatedTitle = "U.S Govt to Scrap 30 Visa Processing Embassies in Africa";

  const relatedScore = __test__.similarityScore(baseTitle, relatedTitle);
  const unrelatedScore = __test__.similarityScore(baseTitle, unrelatedTitle);

  assert.ok(relatedScore > unrelatedScore);
});

test("getWindow returns a deterministic Kenya-midnight seven-day range", () => {
  // What is tested:
  //   The active-cluster window starts at Kenya midnight converted to UTC.
  // Why:
  //   Date windows are easy to get wrong when DB values are stored as UTC.
  // Input:
  //   2026-06-03T10:00:00.000Z.
  // Expected output:
  //   Start is 2026-06-02T21:00:00.000Z, which is 2026-06-03 00:00 in Kenya.
  // Recommended fail-safe:
  //   If the intended behavior is "last seven days", change start to
  //   startOfTodayUTC - sevenDays instead of end to startOfTodayUTC + sevenDays.
  const { start, end } = __test__.getWindow(new Date("2026-06-03T10:00:00.000Z"));

  assert.equal(start.toISOString(), "2026-06-02T21:00:00.000Z");
  assert.equal(end.toISOString(), "2026-06-09T21:00:00.000Z");
});

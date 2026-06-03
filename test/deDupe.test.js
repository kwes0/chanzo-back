import assert from "node:assert/strict";
import test from "node:test";
import { prisma } from "../src/config/db.js";
import { deDupeArticle } from "../src/utils/deDupe.js";

const originalFindMany = prisma.article.findMany;

test.afterEach(() => {
  prisma.article.findMany = originalFindMany;
});

test.after(async () => {
  await prisma.$disconnect();
});

test("deDupeArticle removes duplicate guids inside the current feed batch before DB insert", async () => {
  // What is tested:
  //   Two RSS items in the same fetch can contain the same guid.
  // Why:
  //   Article.guid is unique in Prisma, so both reaching prisma.article.create()
  //   would cause a unique constraint failure during clustering.
  // Input:
  //   Three feed items where two share guid "same-guid".
  // Expected output:
  //   Only one "same-guid" item remains, plus the unique item.
  // Recommended fail-safe:
  //   Keep this in-memory dedupe before cluster assignment so duplicates do not
  //   create unnecessary clusters before failing at article insert.
  prisma.article.findMany = async () => [];

  const articles = [
    { guid: "same-guid", title: "First copy" },
    { guid: "same-guid", title: "Second copy" },
    { guid: "unique-guid", title: "Unique article" },
  ];

  const result = await deDupeArticle(articles);

  assert.deepEqual(
    result.map((article) => article.guid),
    ["same-guid", "unique-guid"],
  );
});

test("deDupeArticle removes articles that already exist in the database by guid", async () => {
  // What is tested:
  //   Batch dedupe checks existing DB articles by guid only.
  // Why:
  //   The schema uniqueness rule is guid-only, not guid + pubDate.
  // Input:
  //   Two articles, with "existing-guid" mocked as already stored.
  // Expected output:
  //   Only "new-guid" continues to clustering.
  // Recommended fail-safe:
  //   Do not reintroduce pubDate into this existence check unless the schema
  //   uniqueness rule is changed to match it.
  prisma.article.findMany = async ({ where }) => {
    assert.deepEqual(where.guid.in, ["existing-guid", "new-guid"]);
    return [{ guid: "existing-guid" }];
  };

  const result = await deDupeArticle([
    { guid: "existing-guid", title: "Already stored" },
    { guid: "new-guid", title: "New article" },
  ]);

  assert.deepEqual(result, [{ guid: "new-guid", title: "New article" }]);
});

test("deDupeArticle returns an empty array and skips the DB query when no valid guids exist", async () => {
  // What is tested:
  //   Articles without guid are discarded before the database query.
  // Why:
  //   Invalid RSS items should not produce malformed Prisma queries or inserts.
  // Input:
  //   Items with missing, empty, or null guid.
  // Expected output:
  //   Empty array.
  // Recommended fail-safe:
  //   Treat missing guid as invalid feed data and skip it before clustering.
  let queryWasCalled = false;
  prisma.article.findMany = async () => {
    queryWasCalled = true;
    return [];
  };

  const result = await deDupeArticle([
    { title: "Missing guid" },
    { guid: "", title: "Empty guid" },
    { guid: null, title: "Null guid" },
  ]);

  assert.deepEqual(result, []);
  assert.equal(queryWasCalled, false);
});

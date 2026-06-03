import { strict as assert } from "assert";
import test from "node:test";
import { runFeedAndCluster } from "../src/controllers/feedAndClusterController.js";

test("runFeedAndCluster returns success with overrides", async () => {
  process.env.RAW_FEEDS = "http://example.com/feed";

  const parseFeedOverride = async (url) => [{ title: "t1", link: "l1", content: "c1" }];
  const deDupeOverride = async (items) => items;
  const assignClusterOverride = async (title) => 42;

  const created = [];
  const prismaOverride = {
    article: { create: async ({ data }) => { created.push(data); return { id: 1, ...data }; } },
    fetchedFeed: { create: async ({ data }) => data },
  };

  const result = await runFeedAndCluster({
    prismaOverride,
    assignClusterOverride,
    deDupeOverride,
    parseFeedOverride,
  });

  assert.equal(result.status, "success");
  assert.equal(result.data.inserted, 1);
  assert.equal(created.length, 1);
  assert.equal(created[0].clusterId, 42);
});

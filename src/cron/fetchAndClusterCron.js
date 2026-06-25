import cron from "node-cron";
import axios from "axios";

const BASEURL = process.env.APP_URL || "http://localhost:3003";
const ENDPOINT = "/ropie/cronFeedAndCluster";

const feedAndClusterCron = async () => {


  try {

    const response = await axios.get(`${BASEURL}${ENDPOINT}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CRON_SECRET}`, //Optional however, when dealing with supabase Auth look up something
      },
      timeout: 30_000,
    });
    console.log(`Shughuli imekala na: ${response.status}`, response.data);
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data || error.message;
    console.log("error hapa kwa feed and Cluster cron")
  }
};

cron.schedule("0 * * * *", feedAndClusterCron, {
  scheduled: true,
  timezone: "Africa/Nairobi",
});

export { feedAndClusterCron };

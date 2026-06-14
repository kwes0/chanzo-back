export const cronAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || token !== process.env.CRON_SECRET) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }
  next();
};

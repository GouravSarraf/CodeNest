const { Redis } = require("@upstash/redis");

const redisClient = new Redis({
  url: "https://promoted-jaybird-33267.upstash.io",
  token: "AYHzAAIjcDFjOTdmNjU3YWRjZDg0NmQzYWZmMTg0NmExNmRkMDlkOHAxMA",
});

/**
 * Cache middleware that checks Redis for cached data before executing the callback
 * @param {string} key - The cache key (fileID)
 * @param {Function} callback - The function to execute if cache miss
 * @returns {Promise<any>} - The cached or fresh data
 */
const withCache = async (key, callback) => {
  try {
    // Try to get data from cache
    const cachedData = await redisClient.get(key);
    
    if (cachedData) {
    //   console.log(`Cache hit for key: ${key}`);

      return cachedData;
    }

    // Cache miss - execute callback
    // console.log(`Cache miss for key: ${key}`);
    const freshData = await callback();

    
    
    await redisClient.set(key, JSON.stringify(freshData), { ex: 3600 });

    return freshData;
  } catch (error) {
    console.error("Redis cache error:", error);
    // If Redis fails, execute callback without caching
    return callback();
  }
};

module.exports = {
  redis: redisClient,
  withCache,
};

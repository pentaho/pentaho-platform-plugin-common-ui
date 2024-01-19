const { join } = require("path");

module.exports = {
    // Changes the location where Puppeteer will install Chrome.
    cacheDirectory: join(__dirname, "target"),
};

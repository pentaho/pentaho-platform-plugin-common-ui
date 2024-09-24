const baseConfig = require("./karma.headless.conf");

module.exports = (config) => {
  baseConfig(config);

  config.set({
    browsers: ["ChromeHeadlessNoSandbox"],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ["--no-sandbox", "--disable-setuid-sandbox"],
        displayName: "Chrome Headless - no sandbox"
      }
    }
  });
};

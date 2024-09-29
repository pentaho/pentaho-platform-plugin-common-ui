/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/
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

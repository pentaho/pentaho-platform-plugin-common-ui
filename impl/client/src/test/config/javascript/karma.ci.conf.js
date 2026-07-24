/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
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

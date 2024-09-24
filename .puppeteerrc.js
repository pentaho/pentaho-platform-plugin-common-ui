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
const { join } = require("path");

module.exports = {
    // Changes the location where Puppeteer will install Chrome.
    cacheDirectory: join(__dirname, "target"),
};

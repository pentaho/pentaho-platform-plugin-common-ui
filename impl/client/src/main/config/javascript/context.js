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



var requireCfg = {
  paths: {},
  shim: {},
  map: {
    "*": {}
  },
  bundles: {},
  config: {
    "pentaho/modules": {}
  },
  packages: []
};

// Override common-ui configuration to avoid default basePath
var ENVIRONMENT_CONFIG = {
  paths: {
    "common-ui": "."
  }
};

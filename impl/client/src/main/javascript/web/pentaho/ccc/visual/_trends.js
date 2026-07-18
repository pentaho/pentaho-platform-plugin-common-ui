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



define([
  "cdf/lib/CCC/pvc",
  "pentaho/data/trends"
], function(pvc, trends) {

  // Install pentaho trends on CCC trends.
  trends.types().forEach(function(trendType) {
    if(!pvc.trends.has(trendType)) {
        var trendInfo = trends.get(trendType);

        pvc.trends.define(trendType, trendInfo);
    }
  });
});


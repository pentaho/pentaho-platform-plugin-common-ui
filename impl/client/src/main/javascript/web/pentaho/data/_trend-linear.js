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

define([
  "./_trends"
], function(trends) {

  function parseNum(value) {
    return value != null ? (+value) : NaN;  // to Number works for dates as well
  }

  trends.define("linear", {
    label: "Linear trend",
    model: function(options) {
      var rowsQuery = options.rows;
      var getX = options.x;
      var getY = options.y;
      var i = 0;
      var N = 0;
      var sumX = 0;
      var sumY = 0;
      var sumXY = 0;
      var sumXX = 0;

      while(rowsQuery.next()) {
        var row = rowsQuery.item;
            // Ignore null && NaN values
        var x = getX ? parseNum(getX(row)) : i; // use the index itself for discrete stuff

        if(!isNaN(x)) {
          var y = parseNum(getY(row));
          if(!isNaN(y)) {
            N++;

            sumX  += x;
            sumY  += y;
            sumXY += x * y;
            sumXX += x * x;
          }
        }

        i++; // Discrete nulls must still increment the index
      }

      // y = alpha + beta * x
      if(N >= 2) {
        var avgX  = sumX / N;
        var avgY  = sumY / N;
        var avgXY = sumXY / N;
        var avgXX = sumXX / N;

            // When N === 1 => den = 0
        var den = (avgXX - avgX * avgX);

        var beta = den && ((avgXY - (avgX * avgY)) / den);

        var alpha = avgY - beta * avgX;

        return {
          alpha: alpha,
          beta:  beta,
          reset: function() {},

          // y = alpha + beta * x
          sample: function(x) { return alpha + beta * (+x); }
        };
      }
    }
  });
});

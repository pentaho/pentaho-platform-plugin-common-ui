/*!
* Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/
define(["./_trends"], function(trends) {

  function parseNum(value) {
    return value != null ? (+value) : NaN;  // to Number works for dates as well
  }

  trends.define('linear', {
    label: 'Linear trend',
    model: function(options) {
      var rowsQuery = options.rows,
          getX = options.x,
          getY = options.y,
          i = 0,
          N = 0,
          sumX  = 0,
          sumY  = 0,
          sumXY = 0,
          sumXX = 0;

      while(rowsQuery.next()) {
        var row = rowsQuery.item,
            // Ignore null && NaN values
            x = getX ? parseNum(getX(row)) : i; // use the index itself for discrete stuff

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
        var avgX  = sumX  / N,
            avgY  = sumY  / N,
            avgXY = sumXY / N,
            avgXX = sumXX / N,

            // When N === 1 => den = 0
            den = (avgXX - avgX * avgX),

            beta = den && ((avgXY - (avgX * avgY)) / den),

            alpha = avgY - beta * avgX;

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

/*!
* Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
*/
define(function() {

  function Calc(createOptions) {
    this.canvasElement = createOptions.domElement;
    this.numSpan = document.createElement("span");
    this.numSpan.style.fontSize = "42px";
    this.numSpan.style.position = "relative";
    this.canvasElement.appendChild(this.numSpan);
  }

  Calc.prototype.resize = function(width, height) {
    this.numSpan.style.left = ((this.canvasElement.offsetWidth  - this.numSpan.offsetWidth ) / 2) + "px";
    this.numSpan.style.top  = ((this.canvasElement.offsetHeight - this.numSpan.offsetHeight) / 2) + "px";
  };

  Calc.prototype.draw = function(dataTable, drawSpec) {

    var R = dataTable.getNumberOfRows(),
        j = dataTable.getNumberOfColumns(),
        getValue = function(k) {
          var v = dataTable.getValue(k, j);
          return !isNaN(v) && v != null ? v : null;
        },
        i;

    // Detect measure column.
    while(j--) if(dataTable.getColumnType(j) === "number") break;
    if(j < 0) return;

    var value = null, vi;
    switch(drawSpec.calc) {
      case "MAX":
        for(i = 0; i < R; i++)
          if((vi = getValue(i)) != null)
            value = value == null ? vi : Math.max(value, vi);
        break;

      case "MIN":
        for(i = 0; i < R; i++)
          if((vi = getValue(i)) != null)
            value = value == null ? vi : Math.min(value, vi);
        break;

      case "AVG":
        var total = value = 0;
        if(R) {
          for(i = 0; i < R; i++)
            if((vi = getValue(i)) != null)
              total += vi;
          value = total / R;
        }
        break;
    }

    this.numSpan.innerHTML = value != null ? value.toFixed(2) : "NA";

    this.resize();
  };

  return Calc;
});

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
 */
define(function() {
  return /* @type IVisualApiConfiguration */{

    // VisualType Configurations for sets of <type,container>
    types: /* @type IVisualTypeConfiguration[] */[

      // VizAPI 3 side-by-side
      // Disable **all** VizAPI 3 visualizations in Analyzer.
      // Comment this rule to test VizAPI 3 visualizations in Analyzer.
      /*{
        priority:  -1,
        container: "analyzer",
        enabled:   false
      },*/

      // Disable unfinished CCC visualizations, in any container.
      {
        priority:  -1,
        id:        ["x-ccc_bulletchart", "x-ccc_treemap", "x-ccc_waterfall", "x-ccc_boxplot"],
        enabled:   false
      }
    ]
  };
});

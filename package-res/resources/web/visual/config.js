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

      // Disable all Sample visualizations in Analyzer
      {
        priority:  -1,
        id:        /^sample_/,
        container: "analyzer",
        enabled:   false
      },

      // Configure all CCC-based visuals for Analyzer
      {
        priority:  -1,
        id:        /^ccc_/,
        container: "analyzer",

        args: {
          direct: {}
        }
      },

      // Disable some unfinished CCC visuals
      {
        priority:  -1,
        id:        ["ccc_bulletchart", "ccc_treemap", "ccc_waterfall", "ccc_boxplot"],
        enabled:   false
      },

      // Override/Configure the CCC Line chart for Analyzer
      {
        priority:  -1,
        id:        "ccc_line",
        container: "analyzer",
        args: {
          direct: {}
        }
      }
    ]
  };
});

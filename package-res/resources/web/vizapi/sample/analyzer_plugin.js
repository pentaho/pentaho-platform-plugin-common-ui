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

  /*global analyzerPlugins:true, cv:true, CONTEXT_PATH:true*/

  analyzerPlugins = typeof analyzerPlugins == "undefined" ? [] : analyzerPlugins;

  analyzerPlugins.push({
    init: function() {

      // Helpers contain code that knows about the Analyzer specific context.

      cv.pentahoVisualizationHelpers["sample_calc"] = {
        // Use one of Analyzer's stock placeholder images
        placeholderImageSrc: CONTEXT_PATH + "content/analyzer/images/viz/VERTICAL_BAR.png"
      };
    }
  });
});

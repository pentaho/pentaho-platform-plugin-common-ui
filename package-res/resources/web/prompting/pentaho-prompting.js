/*!
 * Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
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

define("common-ui/prompting/pentaho-prompting",
    ['./utils/GUIDHelper', 'cdf/Dashboard', './PromptPanel', './WidgetBuilder', 'common-ui/util/base64'],

    function (GUIDHelper, Dashboard, PromptPanel) {

      $.extend(pentaho.common.prompting, {

        promptGUIDHelper: new GUIDHelper(),

        /**
         * Remove components from Dashboards.
         *
         * @param components Components to remove from Dashboards.components.
         * @param postponeClear If true we'll postpone calling component.clear() on all removed components.
         */


        /**
         * Append the array b to the array a.
         */
        appendInline: function (a, b) {
          a.splice.apply(a, [a.length, 0].concat(b));
        },

        prepareCDF: function () {
          if (this.prepared) {
            return;
          }
          //dash._setFlatParameters(true); // supporting parameters with dots not requiring the full path to be previously created

          // Don't escape parameter values - we want the exactly as they are declared. We'll handle escaping the values if necessary.
          dash.escapeParameterValues = false;

          this.prepared = true;
        },
      });

      return PromptPanel;
    });

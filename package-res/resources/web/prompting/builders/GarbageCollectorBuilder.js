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

define(['cdf/Logger', 'cdf/lib/Base', '../components/GarbageCollectorComponent'],
    function (Logger, Base, GarbageCollectorComponent) {

      return Base.extend({
        build: function (args) {
          return new GarbageCollectorComponent({
            name: 'gc' + args.promptPanel.generateWidgetGUID(),
            preExecution: function () {
              // Clear the components in reverse since we have an exploded list of components.
              // Clearing them in order would empty the parent container thus removing all
              // elements from the dom before each individual component has a chance to clean up
              // after themselves.
              $.each(args.components.reverse(), function (i, c) {
                try {
                  c.clear();
                } catch (e) {
                  Logger.log("Error clearing " + c.name + ":", 'error');
                  Logger.log(e, 'exception');
                }
              });
              setTimeout(function () {
                // Remove myself from Dashboards.components when we're done updating
                //TODO Review this!!
                args.promptPanel.removeDashboardComponents([this]);
              }.bind(this));
              return false; // Don't try to update, we're done
            }
          });
        }
      })
    });

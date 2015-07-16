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

define(['cdf/components/SelectComponent', 'cdf/components/SelectMultiComponent',
    './ValueBasedParameterWidgetBuilder'],
    function (SelectComponent, SelectMultiComponent, ValueBasedParameterWidgetBuilder) {

      return ValueBasedParameterWidgetBuilder.extend({
        build: function (args) {
          var widget = this.base(args);
          $.extend(widget, {
            type: args.param.multiSelect ? 'SelectMultiComponent' : 'SelectComponent',
            size: args.param.attributes['parameter-visible-items'] || 5,
            changeMode: args.param.multiSelect ? 'timeout-focus' : 'immediate',  // PRD-3687
            preExecution: function () {
              // SelectComponent defines defaultIfEmpty = true for non-multi selects.
              // We can't override any properties of the component so we must set them just before update() is called. :(
              this.defaultIfEmpty = false;
            }
          });

          if (args.param.multiSelect) {
            return new SelectMultiComponent(widget);
          } else {
            return new SelectComponent(widget);
          }
        }
      });
    });

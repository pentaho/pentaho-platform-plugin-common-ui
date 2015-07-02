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

define(['cdf/components/MultiButtonComponent', './ValueBasedParameterWidgetBuilder'],
    function (MultiButtonComponent, ValueBasedParameterWidgetBuilder) {

      return ValueBasedParameterWidgetBuilder.extend({
        build: function (args) {
          var widget = this.base(args);
          $.extend(widget, {
            type: 'MultiButtonComponent',
            isMultiple: args.param.multiSelect,
            verticalOrientation: 'vertical' === args.param.attributes['parameter-layout'],
            expression: function () {
              return this.dashboard.getParameterValue(this.parameter);
            },
            postExecution: function () {
              $('#' + this.htmlObject).addClass('pentaho-toggle-button-container');
            }
          });
          return new MultiButtonComponent(widget);
        }
      });
    });

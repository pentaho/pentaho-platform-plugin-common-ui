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

define(['./ParameterWidgetBuilderBase'],
    function (ParameterWidgetBuilderBase) {

      return ParameterWidgetBuilderBase.extend({
        /**
         *
         * @param param
         * @returns {Array}
         * @private
         */
        _getCDFValuesArray: function (param) {
          var valuesArray = [];
          $.each(param.values, function (i, val) {
            valuesArray.push([val.value, val.label]);
          });
          return valuesArray;
        },

        build: function (args) {
          var widget = this.base(args);
          return $.extend(widget, {
            valueAsId: false,
            valuesArray: this._getCDFValuesArray(args.param)
          });
        }
      });
    });

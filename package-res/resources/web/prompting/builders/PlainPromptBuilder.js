/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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

define(['common-ui/util/formatting', './ValueBasedParameterWidgetBuilder', '../components/StaticAutocompleteBoxComponent', 'common-ui/jquery-clean'],
    function (FormatUtils, ValueBasedParameterWidgetBuilder, StaticAutocompleteBoxComponent, $) {
      return ValueBasedParameterWidgetBuilder.extend({
        build: function (args) {
          var formatter = FormatUtils.createFormatter(args.promptPanel.paramDefn, args.param);
          var transportFormatter = FormatUtils.createDataTransportFormatter(args.promptPanel.paramDefn, args.param);
          var convertToAutocompleteValues = function (valuesArray) {
            return $.map(valuesArray, function (v) {
              var value = formatter ? formatter.format(transportFormatter.parse(v[0])) : v[0];
              // Label is key if it doesn't exist
              var label = (formatter ? formatter.format(transportFormatter.parse(v[1])) : v[1]) || value;
              return {
                value: value,
                label: label
              }
            });
          };

          var widget = this.base(args);
          widget = $.extend(widget, {
            type: 'StaticAutocompleteBoxComponent',
            valuesArray: convertToAutocompleteValues(widget.valuesArray),
            transportFormatter: transportFormatter,
            formatter: formatter,
            param: args.param
          });

          return new StaticAutocompleteBoxComponent(widget);
        }
      })
    });

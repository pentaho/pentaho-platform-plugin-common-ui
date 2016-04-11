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

/**
 * <h2>The Formatted Parameter Widget Builder</h2>
 *
 * To use the FormattedParameterWidgetBuilder you should require the appropriate file
 * from Common-Ui:
 *
 * <pre><code>
 *   require(['common-ui/prompting/builders/FormattedParameterWidgetBuilder'],
 *     function(FormattedParameterWidgetBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * FormattedParameterWidgetBuilder is an abstract class, that needs to be extended by whoever
 * needs to create a CDF component. This abstraction is used to allow format of parameter values
 *
 * @name FormattedParameterWidgetBuilderBase
 * @class
 * @extends ParameterWidgetBuilderBase
 */
define(['common-ui/util/formatting', './ParameterWidgetBuilderBase', 'common-ui/jquery-clean'],
    function (FormatUtils, ParameterWidgetBuilderBase, $) {

      return ParameterWidgetBuilderBase.extend({
        /**
         * Creates a data transport formatter from the Format Utils
         *
         * @method
         * @name FormattedParameterWidgetBuilderBase#_createDataTransportFormatter
         *
         * @param {Parameter} param - The parameter instance
         * @returns {*|{format, parse}}
         * @private
         */
        _createDataTransportFormatter: function(param) {
          return FormatUtils.createDataTransportFormatter(param);
        },

        /**
         * Creates a formatter from the Format Utils
         *
         * @method
         * @name FormattedParameterWidgetBuilderBase#_createFormatter
         *
         * @param {Parameter} param - The parameter instance
         * @returns {*|{format, parse}}
         * @private
         */
        _createFormatter: function(param) {
          return FormatUtils.createFormatter(param);
        },

        /**
         * Assigns to the widget to be helper functions to allow formatting properties
         *
         * @name FormattedParameterWidgetBuilderBase#build
         * @method
         *
         * @param {Object} args - The object with the properties to build the component
         * @param {Parameter} args.param - The parameter with the properties needed to build the component
         * @returns {Object} The object extended with the formatting utils
         */
        build: function (args) {
          var widget = this.base(args);
          return $.extend(widget, {
            transportFormatter: this._createDataTransportFormatter(args.param),
            formatter: this._createFormatter(args.param)
          });
        }
      });
    });

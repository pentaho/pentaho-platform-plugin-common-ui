/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


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
 * @extends ValueBasedParameterWidgetBuilder
 */
define(['common-ui/util/formatting', './ValueBasedParameterWidgetBuilder', 'common-ui/jquery-clean'],
    function (FormatUtils, ValueBasedParameterWidgetBuilder, $) {

      return ValueBasedParameterWidgetBuilder.extend({
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

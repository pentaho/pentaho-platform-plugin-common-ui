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
 * <h2>The Value Based Parameter Widget Builder</h2>
 *
 * To use the ValueBasedParameterWidgetBuilder you should require the appropriate file
 * from Common-Ui:
 *
 * <pre><code>
 *   require(['common-ui/prompting/builders/ValueBasedParameterWidgetBuilder'],
 *     function(ValueBasedParameterWidgetBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * ValueBasedParameterWidgetBuilder is an abstract class, that needs to be extended by whoever
 * needs to create a CDF component. This abstraction is used to create and assign the array of
 * value|label pairs to the component
 *
 * @name ValueBasedParameterWidgetBuilder
 * @class
 * @extends ParameterWidgetBuilderBase
 */

define(['./ParameterWidgetBuilderBase', 'common-ui/jquery-clean'],
    function (ParameterWidgetBuilderBase, $) {

      return ParameterWidgetBuilderBase.extend({
        /**
         * Creates an array with the value|label pair that defines the
         * valuesArray property of a CDF component
         *
         * @name ValueBasedParameterWidgetBuilder#_getCDFValuesArray
         * @method
         *
         * @param {Parameter} param - The parameter that stores the values
         * @returns {Array} The array with the value|label pair
         * @private
         */
        _getCDFValuesArray: function (param) {
          var valuesArray = [];
          $.each(param.values, function (i, val) {
            valuesArray.push([val.value, val.label]);
          });
          return valuesArray;
        },

        /**
         * Assigns to the widget to be built the valuesArray properties
         *
         * @name ValueBasedParameterWidgetBuilder#build
         * @method
         *
         * @param {Object} args - The object with the properties to build the component
         * @param {Parameter} args.param - The parameter with the properties needed to build the component
         * @returns {Object} The object extended with the CDF properties related with valuesArray
         */
        build: function (args) {
          var widget = this.base(args);
          return $.extend(widget, {
            valueAsId: false,
            valuesArray: this._getCDFValuesArray(args.param)
          });
        }
      });
    });

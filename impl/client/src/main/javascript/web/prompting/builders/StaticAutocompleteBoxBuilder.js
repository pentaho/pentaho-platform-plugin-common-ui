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
 * <h2>The Static Autocomplete Box Component Builder</h2>
 *
 * To use the StaticAutocompleteBoxBuilder you should require the appropriate file from common-ui:
 *
 * <pre><code>
 *   require([ 'common-ui/prompting/builders/StaticAutocompleteBoxBuilder' ],
 *     function(StaticAutocompleteBoxBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * To get the component you'll have to create a new instance of the builder and call the <code>build</code> method:
 *
 * <pre><code>
 *   var staticAutocompleteBoxBuilder = new StaticAutocompleteBoxBuilder();
 *
 *   var staticAutocompleteBoxComponent = staticAutocompleteBoxBuilder.build(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the parameters necessary for the {@link StaticAutocompleteBoxComponent}.
 *
 * @name StaticAutocompleteBoxBuilder
 * @class
 * @extends ValueBasedParameterWidgetBuilder
 */
define(['common-ui/util/formatting', './ValueBasedParameterWidgetBuilder', '../components/StaticAutocompleteBoxComponent', 'common-ui/jquery-clean'],
    function(FormatUtils, ValueBasedParameterWidgetBuilder, StaticAutocompleteBoxComponent, $) {
      return ValueBasedParameterWidgetBuilder.extend({

        /**
         * Creates and returns a new instance of StaticAutocompleteBoxBuilder.
         *
         * @method
         * @name StaticAutocompleteBoxBuilder#build
         * @param {Object} args - The arguments to build the widget in accordance with {@link SubmitPromptComponent}
         * @param {Parameter} args.param - The Parameter instance
         * @returns {StaticAutocompleteBoxComponent} The new instance of StaticAutocompleteBoxComponent
         */
        build: function(args) {
          var formatter = FormatUtils.createFormatter(args.param);
          var transportFormatter = FormatUtils.createDataTransportFormatter(args.param);
          var convertToAutocompleteValues = function(valuesArray) {
            return $.map(valuesArray, function(v) {
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
            formatter: formatter
          });

          return new StaticAutocompleteBoxComponent(widget);
        }
      })
    });

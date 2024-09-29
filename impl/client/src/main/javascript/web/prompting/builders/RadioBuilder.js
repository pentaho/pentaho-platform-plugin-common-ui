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
 * <h2>The Radio Builder</h2>
 *
 * To use the RadioBuilder you should require the appropriate file from common-ui:
 *
 * <pre><code>
 *   require([ 'common-ui/prompting/builders/RadioBuilder' ],
 *     function(RadioBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * To get the component you'll have to create a new instance of the builder and call the <code>build</code> method:
 *
 * <pre><code>
 *   var radioBuilder = new RadioBuilder();
 *
 *   var radioComponent = radioBuilder.build(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the prompt panel and the parameters necessary for the component as per
 * [the CDF documentation]{@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:52-RadioComponent:radio_component.xcdf/generatedContent}.
 *
 * <p>
 *   Note: the CDF documentation points to the Dashboard located on the Pentaho BI Server
 * </p>
 *
 * @name RadioBuilder
 * @class
 * @extends ToggleButtonBaseBuilder
 */
define([ 'cdf/components/RadioComponent', './ToggleButtonBaseBuilder' ], function(RadioComponent,
  ToggleButtonBaseBuilder) {
  return ToggleButtonBaseBuilder.extend({

    /**
     * Builds the widget and returns a new instance of CDF RadioComponent. The new instance of RadioComponent is built with
     * 'radio' type.
     *
     * @method
     * @name RadioBuilder#build
     * @param {Object}
     *          args The arguments to build the widget in accordance with [the CDF documentation]{@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:52-RadioComponent:radio_component.xcdf/generatedContent}
     * @param {Parameter}
     *          args.param - The parameter with the properties needed to build the component
     * @returns {RadioComponent} The new instance of RadioComponent
     */
    build : function(args) {
      var widget = this.base(args);
      widget.type = 'radio'; // Specifically 'radio' instead of 'RadioComponent'
      return new RadioComponent(widget);
    }
  });
});

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
 * <h2>The Drop Down Builder</h2>
 *
 * To use the DropDownBuilder you should require the appropriate file
 * from Common-Ui:
 *
 * <pre><code>
 *   require(['common-ui/prompting/builders/DropDownBuilder'],
 *     function(DropDownBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * To get the component you'll have to create a new instance of the builder and
 * call the <code>build</code> method:
 *
 * <pre><code>
 *   var dropDownBuilder = new DropDownBuilder();
 *
 *   var dropDownComponent = dropDownBuilder.build(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the prompt panel and the parameters
 * necessary for the component.
 * {@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:16-SelectComponent:select_component.xcdf/generatedContent SelectComponent} is created.
 *
 * <p>
 *   Note: the CDF documentation points to the Dashboard located on the Pentaho BI Server
 * </p>
 *
 * @name DropDownBuilder
 * @class
 * @extends ValueBasedParameterWidgetBuilder
 */
define(["cdf/components/SelectComponent", "./ValueBasedParameterWidgetBuilder", "common-ui/jquery-clean"],
  function(SelectComponent, ValueBasedParameterWidgetBuilder, $) {

    return ValueBasedParameterWidgetBuilder.extend({
      /**
       * Method used to build the widget, returning an instance of CDF SelectComponent
       *
       * @name DropDownBuilder#build
       * @method
       *
       * @param   {Object}          args - The object with the properties to build the component according to [the CDF Documentation]{@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:16-SelectComponent:select_component.xcdf/generatedContent SelectComponent}
       * @param   {Parameter}       args.param - The parameter with the properties needed to build the component
       * @return {SelectComponent} The instance of SelectComponent
       */
      build: function(args) {
        var widget = this.base(args);

        if(args.promptPanel.paramDefn.ignoreBiServer5538 && !args.param.hasSelection()) {
          // If there is no empty selection, and no value is selected, create one. This way, we can represent
          // the unselected state.
          widget.valuesArray = widget.valuesArray.concat([["", ""]]);
        }

        $.extend(widget, {
          type: "SelectComponent",
          preExecution: function() {
            // SelectComponent defines useFirstValue as `true` for non-multi selects.
            // We can't override any properties of the component so we must set them just before update() is called. :(
            // Only select the first item if we have no selection and are not ignoring BISERVER-5538
            this.useFirstValue = !args.promptPanel.paramDefn.ignoreBiServer5538 && !args.param.hasSelection();
          },
          externalPlugin: args.param.attributes.externalPlugin,
          extraOptions: args.param.attributes.extraOptions
        });

        return new SelectComponent(widget);
      }
    });
  });

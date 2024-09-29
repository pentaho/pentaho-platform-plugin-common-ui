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
 * <h2>The External Input Builder</h2>
 *
 * To use the ExternalInputBuilder you should require the appropriate file
 * from Common-Ui:
 *
 * <pre><code>
 *   require(['common-ui/prompting/builders/ExternalInputBuilder'],
 *     function(ExternalInputBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * To get the component you'll have to create a new instance of the builder and
 * call the <code>build</code> method:
 *
 * <pre><code>
 *   var externalInputBuilder = new ExternalInputBuilder();
 *
 *   var externalInputComponent = externalInputBuilder.build(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the parameters necessary for the {@link ExternalInputComponent}.
 *
 * @name ExternalInputBuilder
 * @class
 * @extends FormattedParameterWidgetBuilderBase
 */

define(['./FormattedParameterWidgetBuilderBase', '../components/ExternalInputComponent', 'common-ui/jquery-clean'],
    function (FormattedParameterWidgetBuilderBase, ExternalInputComponent, $) {

      return FormattedParameterWidgetBuilderBase.extend({
        /**
         * Creates and returns a new instance of ExternalInputComponent.
         *
         * @name ExternalInputComponent#build
         * @method
         *
         * @param   {Object}          args - The arguments to build the widget in accordance with {@link ExternalInputComponent}
         * @returns {ExternalInputComponent} The new instance of ExternalInputComponent
         */
        build: function (args) {
          var widget = this.base(args);
          $.extend(widget, {
            type: 'ExternalInputComponent',
            promptPanel: args.promptPanel,
            paramDefn: args.promptPanel.paramDefn
          });

          return new ExternalInputComponent(widget);
        }
      });
    });

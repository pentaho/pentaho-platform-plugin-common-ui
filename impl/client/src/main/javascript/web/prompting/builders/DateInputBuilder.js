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
 * <h2>The Date Input Builder</h2>
 *
 * To use the DateInputBuilder you should require the appropriate file
 * from Common-Ui:
 *
 * <pre><code>
 *   require(['common-ui/prompting/builders/DateInputBuilder'],
 *     function(DateInputBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * To get the component you'll have to create a new instance of the builder and
 * call the <code>build</code> method:
 *
 * <pre><code>
 *   var dateInputBuilder = new DateInputBuilder();
 *
 *   var dateInputComponent = dateInputBuilder.build(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the parameters necessary for the {@link DojoDateTextBoxComponent}.
 *
 * @name DateInputBuilder
 * @class
 * @extends FormattedParameterWidgetBuilderBase
 */
define(['./FormattedParameterWidgetBuilderBase', '../components/DojoDateTextBoxComponent', 'common-ui/jquery-clean'],
    function (FormattedParameterWidgetBuilderBase, DojoDateTextBoxComponent, $) {

      return FormattedParameterWidgetBuilderBase.extend({
        /**
         * Creates and returns a new instance of DojoDateTextBoxComponent.
         *
         * @name DateInputBuilder#build
         * @method
         *
         * @param   {Object}          args - The arguments to build the widget in accordance with {@link DojoDateTextBoxComponent}
         * @returns {ExternalInputComponent} The new instance of DojoDateTextBoxComponent
         */
        build: function (args) {
          var widget = this.base(args);
          $.extend(widget, {
            type: 'DojoDateTextBoxComponent'
          });

          return new DojoDateTextBoxComponent(widget);
        }
      });
    });

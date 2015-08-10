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
 * @extends ValueBasedParameterWidgetBuilder
 */
define(['./FormattedParameterWidgetBuilderBase', '../components/DojoDateTextBoxComponent'],
    function (FormattedParameterWidgetBuilderBase, DojoDateTextBoxComponent) {

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

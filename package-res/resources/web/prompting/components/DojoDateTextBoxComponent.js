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
 * <h2>The Dojo Date Text Box Component class</h2>
 *
 * <p>The DojoDateTextBoxComponent renders a date picker box</p>
 *
 * To use the DojoDateTextBoxComponent you should require the appropriate file from common-ui:
 *
 * <pre><code>
 *   require([ 'common-ui/promting/components/DojoDateTextBoxComponent' ],
 *     function(DojoDateTextBoxComponent) {
 *       var paramDefn = ...;
 *       var param = ...;
 *       var formatter = createFormatter(paramDefn, param);
 *       var transportFormatter = createDataTransportFormatter(paramDefn, param);
 *       var args = {
 *         type: 'StaticAutocompleteBoxBuilder',
 *         name: 'component_name',
 *         htmlObject: 'dom_element_id',
 *         formatter: formatter,
 *         transportFormatter: transportFormatter,
 *         executeAtStart: true
 *       };
 *       var dojoDateTextBoxComponent = new DojoDateTextBoxComponent(args);
 *     }
 *   );
 * </code></pre>
 *
 * where 'args' is an object that contains the parameters necessary for base CDF component and special options:
 * <ul>
 *   <li>param - {@link Parameter} the parameter info about this widget</li>
 *   <li>paramDefn - {@link ParameterDefinition} the parameter definition used to create the formatter</li>
 *   <li>formatter - {@link formatting} utility to format values</li>
 *   <li>transportFormatter - {@link formatting} utility to format values</li>
 * </ul>
 *
 * @name DojoDateTextBoxComponent
 * @class
 * @extends BaseComponent
 */
define(['cdf/components/BaseComponent', 'dijit/form/DateTextBox', 'dijit/registry', 'cdf/lib/jquery', 'dojo/on'],
    function (BaseComponent, DateTextBox, registry, $, on) {

      return BaseComponent.extend({
        /**
         * Clears the widget from the dojo namespace
         *
         * @method
         * @name DojoDateTextBoxComponent#clear
         */
        clear: function () {
          if (this.dijitId) {
            if (this.onChangeHandle) {
              this.onChangeHandle.remove();
            }
            registry.byId(this.dijitId).destroyRecursive();
            delete this.dijitId;
          }
        },

        /**
         * Renders the Dojo Date Text Box Component
         *
         * @method
         * @name DojoDateTextBoxComponent#update
         */
        update: function () {
          var myself = this;

          var parameterValue = this.dashboard.getParameterValue(this.parameter),
              value = undefined;
          if(this.transportFormatter) {
            value = this.transportFormatter.parse(parameterValue);
          }
          this.dijitId = this.htmlObject + '_input';

          $('#' + this.htmlObject).html($('<input/>').attr('id', this.dijitId));

          if(registry.byId(this.dijitId)) {
            registry.remove(this.dijitId);
          }

          var dateFormat = this.dateFormat;
          var dateTextBox = new DateTextBox({
            name: this.name,
            constraints: {
              datePattern: dateFormat ? dateFormat : this.param.attributes['data-format'],
              selector: 'date',
              formatLength: 'medium' // Used if datePattern is not defined, locale specific
            }
          }, this.dijitId);

          dateTextBox.set('value', value, false);
          this.onChangeHandle = on(dateTextBox, "change", function () {
            myself.dashboard.processChange(this.name);
          }.bind(this));

          this._doAutoFocus();
        },

        /**
         * Returns the value assigned to the component
         *
         * @method
         * @name DojoDateTextBoxComponent#getValue
         *
         * @returns {String} The date picked, parsed using the common-ui formatters
         */
        getValue: function () {
          var date = registry.byId(this.dijitId).get('value');
          if(this.transportFormatter) {
            return this.transportFormatter.format(date);
          }
          return date;
        }
      });
    });

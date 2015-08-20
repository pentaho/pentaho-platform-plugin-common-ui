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
 *   require([ 'common-ui/prompting/components/DojoDateTextBoxComponent' ],
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
define(['cdf/components/BaseComponent', "dojo/date/locale", 'dijit/form/DateTextBox', 'dijit/registry', 'cdf/lib/jquery', 'dojo/on'],
    function (BaseComponent, locale, DateTextBox, registry, $, on) {

      return BaseComponent.extend({
        localeFormatter: locale,

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
          this.clear();
          var myself = this;

          var parameterValue = this.dashboard.getParameterValue(this.parameter),
              value = undefined;

          // If no value was specified use current date
          if (!parameterValue.length){
            parameterValue = this._getFormattedDate(new Date());
          } else if(parameterValue.length == 1) {
            parameterValue = parameterValue[0];
          }

          // Get the date well formatted according to the date format specified to pass on to the parser.
          // For backwards compatibility we need to check if the component is a legacy version of the 
          // date picker and update the date format accordingly.
          var formattedDate = this._getFormattedDate(new Date(parameterValue));

          // Parse the date to a Date object.
          if(this.transportFormatter) {
            value = this.transportFormatter.parse(formattedDate);
          } else if(this._isLegacyDateFormat()) {
            value = this.localeFormatter.parse(formattedDate, {datePattern: myself.dateFormat, selector: "date"});
          }          

          this.dijitId = this.htmlObject + '_input';

          $('#' + this.htmlObject).html($('<input/>').attr('id', this.dijitId));

          var constraints = {
            datePattern: this.dateFormat ? this.dateFormat : this.param.attributes['data-format'],
            selector: 'date',
            formatLength: 'medium' // Used if datePattern is not defined, locale specific
          };

          if(myself.startDate == 'TODAY') {
            constraints.min = new Date();
          } else if(myself.startDate) {
            constraints.min = this.localeFormatter.format(myself.startDate, {datePattern: myself.dateFormat, selector: "date"});
          }

          if(myself.endDate == 'TODAY') {
            constraints.max = new Date();
          } else if(myself.endDate) {
            constraints.max = this.localeFormatter.format(myself.endDate, {datePattern: myself.dateFormat, selector: "date"});
          }

          var dateTextBox = new DateTextBox({
            name: this.name,
            constraints: constraints,
            onChange: function() {
              myself.dashboard.processChange(myself.name);
            }
          }, this.dijitId);

          dateTextBox.set('value', value, false);

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
          return this._getFormattedDate(date);
        },

        /**
         * Returns a formatted date
         *
         * Due to legacy reasons we can't format the numbers in the same way in the Dashboards plugin.
         * Dashboards plugin do not have the notion of timezone and we need to keep the jquery date picker plain date
         * picking.
         *
         * @returns {date}
         * @private
         */
        _getFormattedDate: function(date) {
          if(this.transportFormatter) {
            return this.transportFormatter.format(date);
          } else if(this._isLegacyDateFormat()) {
            this._convertFormat();
            return this.localeFormatter.format(date, {datePattern: this.dateFormat, selector: "date"});
          }
          return date;
        },

        /**
         * Checks if the date format assigned to the component is legacy or not
         *
         * @returns {boolean}
         * @private
         */
        _isLegacyDateFormat: function() {
          var dojoFormat;

          var dateFormat = this.dateFormat ? this.dateFormat : this.param.attributes['data-format'];

          try {
            dojoFormat = this.localeFormatter.format(new Date(), {datePattern: dateFormat, selector: "date"});
          } catch(e) { //in case we have an invalid format and the format breaks
            return true;
          }

          return dojoFormat != $.datepicker.formatDate(dateFormat, new Date());
        },

        /**
         * Converts the date format from jquery to dojo
         * Based on https://api.jqueryui.com/datepicker/#utility-formatDate and http://dojotoolkit.org/reference-guide/1.10/dojo/date/locale/format.html#dojo-date-locale-format
         *
         * @private
         */
        _convertFormat: function() {
          var myself = this;
          myself.dateFormat = this.dateFormat ? this.dateFormat : this.param.attributes['data-format'];

          var regexConvertYear =      [[/(^|(?!y).)(y{1}(?!y))/, "$1yy"],  [/(^|(?!y).)(y{2}(?!y))/, "$1yyyy"]],
              regexConvertMonth =     [[/(^|(?!m).)(m{1}(?!m))/i, "$1M"],   [/(^|(?!m).)(m{2}(?!m))/i, "$1MM"]], // case insensitive for this type
              regexConvertMonthText = [[/(^|(?!M).)(M{3}(?!M))/, "$1MMM"], [/(^|(?!M).)(M{4}(?!M))/, "$1MMMM"]],
              regexConvertDayText =   [[/(^|(?!D).)(D{1}(?!D))/, "$1EEE"], [/(^|(?!D).)(D{2}(?!D))/, "$1EEEE"]],
              regexConvertDayMonth =  [[/(^|(?!o).)(o{1}(?!o))/, "$1D"],   [/(^|(?!o).)(o{2}(?!o))/, "$1DD"], [/(^|(?!o).)(o{3}(?!o))/, "$1DDD"]];

          var replacer = function(i,v){
            if(v[0].test(myself.dateFormat)) {
              myself.dateFormat = myself.dateFormat.replace(v[0], v[1]);
              return false;
            }
          };

          $.each(regexConvertYear, replacer);
          $.each(regexConvertMonthText, replacer);
          $.each(regexConvertMonth, replacer);
          $.each(regexConvertDayText, replacer);
          $.each(regexConvertDayMonth, replacer);
        }
      });
    });

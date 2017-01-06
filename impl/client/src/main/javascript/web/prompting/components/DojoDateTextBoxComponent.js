/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
 *       var param = ...;
 *       var formatter = createFormatter(param);
 *       var transportFormatter = createDataTransportFormatter(param);
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
 *   <li>formatter - {@link formatting} utility to format values</li>
 *   <li>transportFormatter - {@link formatting} utility to format values</li>
 * </ul>
 *
 * @name DojoDateTextBoxComponent
 * @class
 * @extends BaseComponent
 */
define(['cdf/components/BaseComponent', "dojo/date/locale", 'dijit/form/DateTextBox', 'dijit/registry', 'amd!cdf/lib/jquery.ui', 'css!./DojoDateTextBoxComponent.css'],
    function (BaseComponent, locale, DateTextBox, registry, $) {

      return BaseComponent.extend({
        localeFormatter: locale,

        /**
         * Clears the widget from the dojo namespace
         *
         * @method
         * @name DojoDateTextBoxComponent#clear
         */
        clear: function () {
          if(this.onChangeHandle) {
            this.onChangeHandle.remove();
          }
          var object = registry.byId(this.dijitId);
          if(object) {
            object.destroyRecursive();
          }
        },

        /**
         * Parses the date using the correct formatter
         *
         * @param {String} value The String with the date to parse
         * @returns {Date} The parsed string as a Date Object, if it is valid
         * @private
         */
        _parseDate: function (value) {
          if (this.transportFormatter) {
            return this.transportFormatter.parse(value);
          }

          return this.localeFormatter.parse(value, {datePattern: this.dateFormat, selector: "date"});
        },

        /**
         * Renders the Dojo Date Text Box Component
         *
         * @method
         * @name DojoDateTextBoxComponent#update
         */
        update: function () {
          if(this.dijitId == undefined) {
            this.dijitId = this.htmlObject + '_input';
          }

          this.clear();
          var myself = this;

          var parameterValue = this.dashboard.getParameterValue(this.parameter),
              value = undefined;

          if(this._isLegacyDateFormat()) {
            this._convertFormat();
          }

          if(parameterValue) {
            if($.isArray(parameterValue)) {
              parameterValue = parameterValue.length == 0 ? undefined : (parameterValue.length == 1 ? parameterValue[0] : parameterValue);
            }
            if(!parameterValue) {
              value = null;
            } else {
              value = this._parseDate(parameterValue);
            }
          } else {
            value = null;
          }

          $('#' + this.htmlObject).html($('<input/>').attr('id', this.dijitId));

          var constraints = {
            datePattern: this._getDateFormat(),
            selector: 'date',
            formatLength: 'medium' // Used if datePattern is not defined, locale specific
          };

          if(myself.startDate == 'TODAY') {
            constraints.min = new Date();
          } else if(myself.startDate) {
            constraints.min = this._parseDate(myself.startDate);
          }

          if(myself.endDate == 'TODAY') {
            constraints.max = new Date();
          } else if(myself.endDate) {
            constraints.max = this._parseDate(myself.endDate);
          }

          var dateTextBox = new DateTextBox({
            name: this.name,
            constraints: constraints,
            onChange: function() {
              myself.dashboard.processChange(myself.name);
            }
          }, this.dijitId);

          if(this._getDateFormat().match(/(^|(?!y).)(y{2}(?!y))/)) {
            dateTextBox.constraints.fullYear = false;
          }
          dateTextBox.set('value', value);

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
          if (this.transportFormatter) {
            return this.transportFormatter.format(date);
          } else {
            return this.localeFormatter.format(date, {datePattern: this._getDateFormat(), selector: "date"});
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
          var dateFormat = this._getDateFormat();

          if(dateFormat.match(/(^|(?!y).)(y{1}(?!y))/)) {
            return true;
          }

          try {
            dojoFormat = this.localeFormatter.format(new Date(), {datePattern: dateFormat, selector: "date"});
          } catch(e) { //in case we have an invalid format and the format breaks
            return true;
          }

          if(dateFormat.match(/m/)) {
            return true;
          }

          return dojoFormat == $.datepicker.formatDate(dateFormat, new Date());
        },

        /**
         * Converts the date format from jquery to dojo
         * Based on https://api.jqueryui.com/datepicker/#utility-formatDate and http://dojotoolkit.org/reference-guide/1.10/dojo/date/locale/format.html#dojo-date-locale-format
         *
         * @private
         */
        _convertFormat: function() {
          var myself = this;
          myself.dateFormat = this._getDateFormat();

          var regexConvertYear =      [[/(^|(?!y).)(y{1}(?!y))/, "$1yy"],  [/(^|(?!y).)(y{2}(?!y))/, "$1yyyy"]],
              regexConvertMonthText = [[/(^|(?!M).)(M{1}(?!M))/, "$1MMM"], [/(^|(?!M).)(M{2}(?!M))/, "$1MMMM"]],
              regexConvertMonth =     [[/(^|(?!m).)(m{1}(?!m))/, "$1M"],   [/(^|(?!m).)(m{2}(?!m))/, "$1MM"]],
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
        },

        /**
         * Returns the current date format
         *
         * @private
         */
        _getDateFormat: function() {
          if (this.dateFormat) {
            return this.dateFormat;
          } else {
            if (this.param && this.param.attributes['data-format']) {
              return this.param.attributes['data-format']
            } else {
              // Fallback to a default value
              return "yyyy-MM-dd";
            }
          }
        }
      });
    });

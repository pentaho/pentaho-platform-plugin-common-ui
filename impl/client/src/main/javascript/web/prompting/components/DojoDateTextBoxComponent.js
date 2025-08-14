/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/


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

 var pad2 = function(n) {
     return n < 10 ? "0" + n : "" + n;
 };

define(['cdf/components/BaseComponent', "dojo/date/locale", 'dijit/form/DateTextBox', 'dijit/form/NumberSpinner', 'dijit/registry', 'amd!cdf/lib/jquery.ui', 'dojo/store/Memory', 'css!./theme/DojoDateTextBoxComponent.css'],
    function (BaseComponent, locale, DateTextBox, NumberSpinner,registry, $, Memory) {

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
          var ids = [this.dijitId, this.dijitId + '_hour', this.dijitId + '_minute', this.dijitId + '_second', this.dijitId + '_ampm'];
          ids.forEach(function(id) {
            var object = registry.byId(id);
            if(object) object.destroyRecursive();
          });
          $('#' + this.dijitId + '_submit').remove();
        },

        /**
         * Updates the time components and triggers a notification of the change.
         * This method is called when any time component (hours, minutes, seconds, or AM/PM) is modified.
         *
         * @param {number|null} updatedValue - The new value for the time component being updated
         * @param {string} type - The type of time component being updated ('hour', 'minute', 'second')
         * @private
         */
        _updateTimeAndNotify: function(updatedValue, type) {
           var date = registry.byId(this.dijitId).get('value');
           var hour = parseInt(registry.byId(this.dijitId + '_hour').get('value'), 10);
           var minute = parseInt(registry.byId(this.dijitId + '_minute').get('value'), 10);
           var second = parseInt(registry.byId(this.dijitId + '_second').get('value'), 10);
           var ampm = $('#' + this.dijitId + '_ampm').val();

           if (!date || hour === null || minute === null || second === null || !ampm) {
             return;
           }

           if (type === 'hour') {
             hour = updatedValue;
           } else if (type === 'minute') {
             minute = updatedValue;
           } else if (type === 'second') {
             second = updatedValue;
           }

           if(ampm === "PM" && hour < 12) hour += 12;
           if(ampm === "AM" && hour === 12) hour = 0;

           date.setHours(hour, minute, second, 0);
           myself.dashboard.processChange(myself.name, myself._getFormattedDate(date));
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

          var displayTimeSelector = false;
          if (this.param && this.param.attributes && this.param.attributes['display-time-selector'] === "true") {
            displayTimeSelector = true;
          }

          var parameterValue = this.dashboard.getParameterValue(this.parameter),
          value,
          hour = 1, minute = 0, second = 0, ampm = "AM";

          if(this._isLegacyDateFormat()) {
            this._convertFormat();
          }

      if(parameterValue) {
        if($.isArray(parameterValue)) {
          if (parameterValue.length === 0) {
            parameterValue = undefined;
          } else {
            parameterValue = parameterValue.length === 1 ? parameterValue[0] : parameterValue;
          }
        }
        if(parameterValue) {
          var dt = this._parseDate(parameterValue);
          value = dt;
            if(dt) {
              hour = dt.getHours();
              ampm = hour >= 12 ? "PM" : "AM";
              hour = hour % 12;
              if(hour === 0) hour = 12;
              minute = dt.getMinutes();
              second = dt.getSeconds();
                }
            } else { value = null; }
         } else {value = null; }
            // --- UI rendering ---
            $('#' + this.htmlObject).empty();

            if (displayTimeSelector) {
              // --- Enhanced UI with time controls ---
              var $container = $('<div/>').addClass('prompting-time-container');
              $container.append($('<input/>').attr('id', this.dijitId));

              // Prefixes
              $container.append($('<span/>').text('HH:').addClass('prompting-time-label'));
              $container.append($('<input/>').attr('id', this.dijitId + '_hour'));
              $container.append($('<span/>').text('MM:').addClass('prompting-time-label'));
              $container.append($('<input/>').attr('id', this.dijitId + '_minute'));
              $container.append($('<span/>').text('SS:').addClass('prompting-time-label'));
              $container.append($('<input/>').attr('id', this.dijitId + '_second'));
              // AM/PM spinner style
              var $ampmSpinner = $('<span/>').addClass('ampm-spinner');
              $ampmSpinner.append(
                $('<input/>')
                  .attr('id', this.dijitId + '_ampm')
                  .addClass('ampm-input')
                  .attr('type', 'text')
                  .attr('readonly', true)
              );
              var $ampmArrows = $('<span/>').addClass('ampm-arrows');
              $ampmArrows.append(
                $('<button/>').attr('id', this.dijitId + '_ampm_up').addClass('ampm-arrow-btn ampm-up')
              );
              $ampmArrows.append(
                $('<button/>').attr('id', this.dijitId + '_ampm_down').addClass('ampm-arrow-btn ampm-down')
              );
              $ampmSpinner.append($ampmArrows);
              $container.append($ampmSpinner);

              $('#' + this.htmlObject).html($container);
            } else {
              // --- Original UI: just the date picker ---
              $('#' + this.htmlObject).append($('<input/>').attr('id', this.dijitId));
            }

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
              if (!displayTimeSelector) {
                myself.dashboard.processChange(myself.name);
              } else {
                // For time selector, also process change on date change
                var date = registry.byId(myself.dijitId).get('value');
                var hour = parseInt(registry.byId(myself.dijitId + '_hour').get('value'), 10);
                var minute = parseInt(registry.byId(myself.dijitId + '_minute').get('value'), 10);
                var second = parseInt(registry.byId(myself.dijitId + '_second').get('value'), 10);
                var ampm = $('#' + myself.dijitId + '_ampm').val();
                if (!date || hour === null || minute === null || second === null || !ampm) return;
                if(ampm === "PM" && hour < 12) hour += 12;
                if(ampm === "AM" && hour === 12) hour = 0;
                date.setHours(hour, minute, second, 0);
                myself.dashboard.processChange(myself.name, myself._getFormattedDate(date));
              }
            }
          }, this.dijitId);

      if(this._getDateFormat().match(/(^|(?!y).)(y{2}(?!y))/)) {
        dateTextBox.constraints.fullYear = false;
      }
      dateTextBox.set('value', value);

        if (displayTimeSelector) {
          // Hour Spinner (01-12)
          var hourSpinner = new NumberSpinner({
            id: this.dijitId + '_hour',
            value: pad2(hour),
            smallDelta: 1,
            constraints: {min:1, max:12, places:0},
            pattern: "00",
            style: "width: 45px",
            onChange: function(val) {
              var v = (typeof val === "number" ? val : parseInt(val, 10));
              if (isNaN(v) || v < 1) v = 1;
              if (v > 12) v = 12;
              this.textbox.value = pad2(v);
              myself._updateTimeAndNotify(v, 'hour');
            }
          }, this.dijitId + '_hour');

          // Minute Spinner (00-59)
          var minuteSpinner = new NumberSpinner({
            id: this.dijitId + '_minute',
            value: pad2(minute),
            smallDelta: 1,
            constraints: {min:0, max:59, places:0},
            pattern: "00",
            style: "width: 45px",
            onChange: function(val) {
              var v = (typeof val === "number" ? val : parseInt(val, 10));
              if (isNaN(v) || v < 0) v = 0;
              if (v > 59) v = 59;
              this.textbox.value = pad2(v);
              myself._updateTimeAndNotify(v, 'minute');
            }
          }, this.dijitId + '_minute');

          // Second Spinner (00-59)
          var secondSpinner = new NumberSpinner({
            id: this.dijitId + '_second',
            value: pad2(second),
            smallDelta: 1,
            constraints: {min:0, max:59, places:0},
            pattern: "00",
            style: "width: 45px",
            onChange: function(val) {
              var v = (typeof val === "number" ? val : parseInt(val, 10));
              if (isNaN(v) || v < 0) v = 0;
              if (v > 59) v = 59;
              this.textbox.value = pad2(v);
              myself._updateTimeAndNotify(v, 'second');
            }
          }, this.dijitId + '_second');

          // Set AM/PM input value
          $('#' + this.dijitId + '_ampm').val(ampm);

          // AM/PM up arrow sets AM, down arrow sets PM
          $('#' + this.dijitId + '_ampm_up').on('click', function() {
            $('#' + myself.dijitId + '_ampm').val('AM');
            myself._updateTimeAndNotify(null, 'ampm');
          });
          $('#' + this.dijitId + '_ampm_down').on('click', function() {
            $('#' + myself.dijitId + '_ampm').val('PM');
            myself._updateTimeAndNotify(null, 'ampm');
          });
        }

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
           var displayTimeSelector = false;
           if (this.param && this.param.attributes && this.param.attributes['display-time-selector'] === "true") {
             displayTimeSelector = true;
           }
           var date = registry.byId(this.dijitId).get('value');
           if (!displayTimeSelector) {
             return this._getFormattedDate(date);
           } else {
           var hour = parseInt(registry.byId(this.dijitId + '_hour').get('value'), 10);
           var minute = parseInt(registry.byId(this.dijitId + '_minute').get('value'), 10);
           var second = parseInt(registry.byId(this.dijitId + '_second').get('value'), 10);
           var ampm = $('#' + this.dijitId + '_ampm').val();
           if (!date || hour === null || minute === null || second === null || !ampm) return null;
           if(ampm === "PM" && hour < 12) hour += 12;
           if(ampm === "AM" && hour === 12) hour = 0;
           date.setHours(hour, minute, second, 0);
            return this._getFormattedDate(date);
           }
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

          if(dateFormat.match(/o/)) {
            return true;
          }

          try {
            dojoFormat = this.localeFormatter.format(new Date(), {datePattern: dateFormat, selector: "date"});
          } catch(e) { //in case we have an invalid format and the format breaks
            return true;
          }

          if(dateFormat.match(/(G|qQ|w|E|a|h|H|K|k|s|S|vz|Z)/)) {
            return false;
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

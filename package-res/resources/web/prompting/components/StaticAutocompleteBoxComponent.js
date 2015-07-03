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

define(['cdf/components/BaseComponent', 'dojo/number', 'amd!cdf/lib/jquery.ui'],
    function (BaseComponent, DojoNumber, $) {

      /**
       *
       *
       * @param type
       * @private
       */
      function _isNumberType(type) {
        var whiteList = ["java.lang.Number", "java.lang.Byte", "java.lang.Double", "java.lang.Float", "java.lang.Integer",
          "java.lang.Long", "java.lang.Short", "java.math.BigDecimal", "java.math.BigInteger"];
        return _.contains(whiteList, type);
      }

      return BaseComponent.extend({
        update: function () {
          var myself = this;

          // Prepare label-value map
          if (this.labelValueMap === undefined) {
            this.labelValueMap = {};
            $.each(this.valuesArray, function (i, item) {
              this.labelValueMap[item.label] = item.value;
            }.bind(this));
          }

          var ph = $('#' + this.htmlObject);
          ph.empty();

          var html = '<input type="text" id="' + this.htmlObject + '-input"';
          if (this.parameter) {
            var initialValue;
            $.each(this.param.values, function (i, v) {
              if (v.selected) {
                initialValue = this.formatter ? this.formatter.format(this.transportFormatter.parse(v.label)) : v.label;

                try {
                  if (isNaN(v.label) || Math.abs(v.label) == Infinity) {
                    var valueParsed = null;
                  } else {
                    if (_isNumberType(v.type)) {
                      valueParsed = DojoNumber.format(v.label, {locale: SESSION_LOCALE.toLowerCase()});
                    } else {
                      valueParsed = v.label;
                    }
                  }
                } catch (e) {
                  valueParsed = v.label;
                }

                if (valueParsed != null) {
                  initialValue = v.label = v.value = valueParsed;
                }
              }
            }.bind(this));

            if (initialValue !== undefined) {
              html += ' value="' + initialValue + '"';
            }
          }
          html += '></input>';
          ph.html(html);

          var input = $('input', ph);
          input.autocomplete({
            delay: 0,
            source: function (request, response) {
              var term = request.term.toUpperCase();
              var matches = $.map(this.valuesArray, function (tag) {
                if (tag.label.toUpperCase().indexOf(term) >= 0) { // PRD-3745
                  return tag;
                }
              });
              response(matches);
            }.bind(this),

            // change() is called on blur
            //change: function(event, ui) {
            // blur wasn't good enough.
            // clicking on the submit button without previously moving out of the text component
            // doesn't trigger blur on time, because jQuery.autocomplete fires changing on a setTimeout,
            // Causing the click to be processed before the change.
            // We now use the jQuery ui focusout event on the input.
            //}.bind(this),

            // select() is called when an item from the menu is selected
            select: function (event, ui) {
              $('#' + this.htmlObject + '-input').val(ui.item.value);
              myself.dashboard.processChange(this.name);
            }.bind(this)
          });

          // Fire a change any time the user presses enter on the field
          input.keypress(function (e) {
            if (e.which === 13) {
              myself.dashboard.processChange(this.name);
            }
          }.bind(this));

          var _inValue;
          input.focus(function () {
            _inValue = this.getValue();
          }.bind(this));

          input.focusout(function () {
            if (_inValue !== this.getValue()) {

              // focusout may override the autocomplete select handler.
              // we need to update the input with the selected value
              try {
                var newVal = $('#ui-active-menuitem').text();
                if (newVal) {
                  $('#' + myself.htmlObject + '-input').val(newVal);
                }
              }
              catch (e) {
              }

              myself.dashboard.processChange(this.name);
            }
          }.bind(this));

          this._doAutoFocus();
        },

        getValue: function () {
          var val = $('#' + this.htmlObject + '-input').val();
          if (this.param.list) {
            // Return key for value or the value if not found
            return this.labelValueMap[val] || val;
          } else if (this.formatter) {
            return this.transportFormatter.format(this.formatter.parse(val));
          } else {
            return val;
          }
        }
      });
    });

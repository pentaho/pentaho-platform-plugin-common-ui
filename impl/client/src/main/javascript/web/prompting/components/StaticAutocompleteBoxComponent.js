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
 * <h2>The Static Autocomplete Box Component class</h2>
 *
 * <p>The StaticAutocompleteBoxComponent renders an autocomplete input box that helps users with the sugestions based on his input</p>
 *
 * To use the StaticAutocompleteBoxComponent you should require the appropriate file from common-ui:
 *
 * <pre><code>
 *   require([ 'common-ui/prompting/components/StaticAutocompleteBoxComponent' ],
 *     function(StaticAutocompleteBoxComponent) {
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
 *       var staticAutocompleteBoxComponent = new StaticAutocompleteBoxComponent(args);
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
 * @name StaticAutocompleteBoxComponent
 * @class
 * @extends BaseComponent
 */
define([ 'common-ui/util/util', 'cdf/components/BaseComponent',  'amd!cdf/lib/jquery.ui' ], function(Utils, BaseComponent,  $) {

  return BaseComponent.extend({

    /**
     * Creates a static autocomplete box element.
     *
     * @method
     * @name StaticAutocompleteBoxComponent#update
     */
    update : function() {
      var myself = this;

      // Prepare label-value map
      if (this.labelValueMap === undefined) {
        this.labelValueMap = {};
        $.each(this.valuesArray, function(i, item) {
          this.labelValueMap[item.label] = item.value;
        }.bind(this));
      }

      var ph = $('#' + this.htmlObject);
      ph.empty();

      var html = '<input type="text" id="' + this.htmlObject + '-input"';
      if (this.parameter) {
        var initialValue;
        $.each(this.param.values, function(i, v) {
          if (v.selected) {
        	initialValue = this.formatter ? this.formatter.format(this.transportFormatter.parse(v.label)) : v.label;
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
        delay : 0,
        create: function () {
          $(this).data('ui-autocomplete')._renderItem = function (ul, item) {
            // [BISERVER-11863] represent special characters correctly (for example &#39; &amp; &lt; &gt)
            return $("<li></li>").append(myself._createLabelTag(item.label)).appendTo(ul);
          };
        },
        source : function(request, response) {
          var term = request.term.toUpperCase();
          var matches = $.map(this.valuesArray, function(tag) {
            // we need unescape label before matching (fix for special characters like as &#39; &amp; &lt; &gt)
            if (myself._createLabelTag(tag.label).text().toUpperCase().indexOf(term) >= 0) { // PRD-3745
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
        select : function(event, ui) {
          $('#' + this.htmlObject + '-input').val(ui.item.value);
          myself.dashboard.processChange(this.name);
        }.bind(this)
      });

      // Fire a change any time the user presses enter on the field
      input.keypress(function(e) {
        if (e.which === 13) {
          myself.dashboard.processChange(this.name);
        }
      }.bind(this));

      var _inValue;
      input.focus(function() {
        _inValue = this.getValue();
      }.bind(this));

      input.focusout(function() {
        if (_inValue !== this.getValue()) {

          // focusout may override the autocomplete select handler.
          // we need to update the input with the selected value
          try {
            var newVal = $('#ui-active-menuitem').text();
            if (newVal) {
              $('#' + myself.htmlObject + '-input').val(newVal);
            }
          } catch (e) {
          }

          myself.dashboard.processChange(this.name);
        }
      }.bind(this));

      this._doAutoFocus();
    },

    /**
     * Returns the value assigned to the component
     *
     * @method
     * @name StaticAutocompleteBoxComponent#getValue
     *
     * @returns {String} The string inserted in the text area, parsed using the common-ui formatters
     */
    getValue : function() {
      var val = $('#' + this.htmlObject + '-input').val();
      if (this.param.list) {
        // Return key for value or the value if not found
        return this.labelValueMap[val] || val;
      } else if (this.formatter) {
        return this.transportFormatter.format(this.formatter.parse(val));
      } else {
        return val;
      }
    },

    _createLabelTag: function(source) {
      return $("<a></a>").html(source);
    }
  });
});

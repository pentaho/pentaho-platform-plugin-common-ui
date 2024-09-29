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

  return BaseComponent.extend(/** @lends StaticAutocompleteBoxComponent# */{

    /**
     * Gets a value that indicates if the component needs to be updated on the next refresh of its prompt panel,
     * even if the component would otherwise not be selected for update.
     * @type {boolean}
     * @default false
     */
    needsUpdateOnNextRefresh: false,

    /**
     * Stores autocomplete search response callback.
     * @type {?function}
     * @private
     */
    _searchResponseCallback: null,

    /**
     * Is supposed to be used only during the focused edition of the content of the prompt
     * contains the value before editing
     * is not up-to-date when the input box is empty, because the source callback is not called in this scenario
     */
    prevSelValue: undefined,
    /**
     * Creates a static autocomplete box element.
     */
    update : function() {
      var ph = $('#' + this.htmlObject);

      // Prepare label-value map
      this.labelValueMap = {};
      $.each(this.valuesArray, function(i, item) {
        this.labelValueMap[item.label] = item.value;
      }.bind(this));

      // Obtain initial value.
      var initialValue;
      if(this.parameter) {
        $.each(this.param.values, function(i, v) {
          if(v.selected) {
            initialValue = this.formatter ? this.formatter.format(this.transportFormatter.parse(v.label)) : v.label;
          }
        }.bind(this));
      }

      // Verify if element already exists.
      var input = $('input', ph);
      if(input.length === 0) {
        // Initialize autocomplete.
        this._createAndInitializeInputAutocompleteElement(ph, initialValue);
      } else if(initialValue !== this.getValue() && initialValue !== undefined) {
        //Update current value
        input.val(initialValue);
      }

      // BISERVER-14512: It was a problem that suggestion of autocomplete just appear for a moment and then dissapear.
      // This behaviour was because when is call dashboard.update it forces a new instance of input.
      if(this.needsUpdateOnNextRefresh) {
        this.needsUpdateOnNextRefresh = false;
        this._finalizeSource(this.prevSelValue, this._searchResponseCallback)
        this._searchResponseCallback = null;
      }
    },

    /**
     * Returns the value assigned to the component.
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

    _createAndInitializeInputAutocompleteElement: function(ph, initialValue) {
      var html = '<input type="text" id="' + this.htmlObject + '-input"';

      if (initialValue !== undefined) {
        html += ' value="' + initialValue + '"';
      }

      html += '></input>';
      ph.html(html);

      var input = $('input', ph);
      input.autocomplete({
        delay : 200,
        create: function () {
          $(input).data('ui-autocomplete')._renderItem = function (ul, item) {
            // [BISERVER-11863] represent special characters correctly (for example &#39; &amp; &lt; &gt)
            return $("<li></li>").append(this._createLabelTag(item.label)).appendTo(ul);
          }.bind(this);

          // [PRD-6038] Ensuring that the cursor is placed at the end of the input box
          // Opera sometimes sees a carriage return as 2 characters, so we multiple by
          // 2 to ensure we are getting to the very end.
          var inputTextLength = 0;
          if(typeof (this.getValue()) !== "undefined") {
            inputTextLength = this.getValue().length * 2;
          }
          // [PRD-6038] Whether or not the inputTextLength has been set, we need to ensure that the last
          // autocomplete box that has been modified (focused on) retains the selected cursor.  Firefox
          // and Chrome handle this behind the scenes, but IE11 and Edge go to the last autocomplete box
          // on the page.  This conditional statement ensures only the last focused autocomplete box has the
          // cursor range set (thus putting it at the end on the only modified box)
          if(this.autoFocus === true){
            input[0].setSelectionRange(inputTextLength, inputTextLength);
          }
        }.bind(this),
        source: function(request, response) {
          if (this.prevSelValue !== request.term) {
            this.prevSelValue = request.term;
            this._searchResponseCallback = response;
            this.needsUpdateOnNextRefresh = true;
            this.dashboard.processChange(this.name);
          } else {
            this._finalizeSource(request.term, response);
          }
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
          this.dashboard.processChange(this.name);
        }.bind(this)
      });

      // Fire a change any time the user presses enter on the field
      input.keypress(function(e) {
        if (e.which === 13) {
          this.dashboard.processChange(this.name);
        }
      }.bind(this));

      input.focus(function() {
        this.prevSelValue = this.getValue();
      }.bind(this));

      input.focusout(function() {
        if (this.prevSelValue !== this.getValue()) {

          // focusout may override the autocomplete select handler.
          // we need to update the input with the selected value
          try {
            var newVal = $('#ui-active-menuitem').text();
            if (newVal) {
              $('#' + this.htmlObject + '-input').val(newVal);
            }
          } catch (e) {
          }

          this.dashboard.processChange(this.name);
        }
      }.bind(this));
      this._doAutoFocus();
    },

    _createLabelTag: function(source) {
      return $("<a></a>").html(source);
    },

    _finalizeSource: function(term, responseCallback) {
      var searchTerm = term.toUpperCase();
      var matches = $.map(this.valuesArray, function(tag) {
        // we need unescape label before matching (fix for special characters like as &#39; &amp; &lt; &gt)
        // PRD-3745
        if (this._createLabelTag(tag.label).text().toUpperCase().indexOf(searchTerm) >= 0) {
          return tag;
        }
      }.bind(this));

      responseCallback(matches);
    }
  });
});

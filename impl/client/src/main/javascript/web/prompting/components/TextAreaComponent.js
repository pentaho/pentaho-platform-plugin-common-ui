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


define(['cdf/components/BaseComponent', 'cdf/dashboard/Utils', 'common-ui/jquery-clean'], function (BaseComponent, Utils, $) {
  return BaseComponent.extend({
    update: function () {
      var myself = this;
      var value = this.dashboard.getParameterValue(this.parameter);
      var html = '<textarea id="' + this.htmlObject + '-input">';
      if (value != undefined) {
        html += Utils.escapeHtml(value);
      }
      html += '</textarea>';
      $('#' + this.htmlObject).html(html);
      var input = $('#' + this.htmlObject + '-input');
      //change() is called on blur
      input.change(function () {
        // blur wasn't good enough. clicking of the submit button without clicking out of the text component
        // doesn't trigger blur. so modified text fields can have a stale value.
        // we now use the jQuery ui focusout event on the input.
      }.bind(this));
      input.keypress(function (e) {
        if (e.which === 13) {
          myself.dashboard.processChange(this.name);
        }
      }.bind(this));

      input.focusout(function () {
        myself.dashboard.processChange(this.name);
      }.bind(this));

      this._doAutoFocus();
    },

    getValue: function () {
      var val = $('#' + this.htmlObject + '-input').val();
      if (this.formatter) {
        return this.transportFormatter.format(this.formatter.parse(val));
      } else {
        return val;
      }
    }
  });

});

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

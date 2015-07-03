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

define(['cdf/components/BaseComponent','dojo/_base/lang', 'dijit/registry'], function(BaseComponent, lang, registry){
  return BaseComponent.extend({
    clear: function () {
      if (this.dijitId) {
        if (this.onChangeHandle) {
          this.onChangeHandle.remove();
        }
        registry.byId(this.dijitId).destroyRecursive();
        delete this.dijitId;
      }
    },
    update: function () {
      var myself = this;

      var parameterValue = myself.dashboard.getParameterValue(this.parameter);

      var container = $('#' + this.htmlObject)
          .empty();

      var textInputComboId = this.htmlObject + '-textButtonCombo';
      var textInputComboElement = '<div id="' + textInputComboId + '"></div>';
      container.append(textInputComboElement);
      var textInputCombo = new pentaho.common.TextButtonCombo({}, textInputComboId);
      textInputCombo.set('textPlaceHolder', 'file path...');
      textInputCombo.set('value', parameterValue); // set initial value

      // get button label
      var buttonLabel = this.param.attributes['button-label'];
      if (buttonLabel != null && buttonLabel != '') {
        textInputCombo.set('buttonLabel', buttonLabel);
      }

      // override onClickCallback
      textInputCombo.onClickCallback = lang.hitch(this, function (currentValue) {
        try {
          var c = myself.dashboard.getComponentByName(this.name);
          var resultCallback = function (externalValue) {
            textInputCombo.set('text', externalValue);
            myself.dashboard.processChange(this.name);
          };
          c.param.values = [currentValue]; // insert current value
          c.promptPanel.getExternalValueForParam(c.param, resultCallback); // request new value from prompt panel
        } catch (error) {
          if (typeof console !== 'undefined' && console.error) {
            console.error(error);
          }
        }
      });
      this.dijitId = textInputComboId;

      // override onChangeCallback
      textInputCombo.onChangeCallback = lang.hitch(this, function (newValue) {
        myself.dashboard.processChange(this.name);
      });
    },

    getValue: function () {
      return registry.byId(this.dijitId).get('value');
    }
  });
});

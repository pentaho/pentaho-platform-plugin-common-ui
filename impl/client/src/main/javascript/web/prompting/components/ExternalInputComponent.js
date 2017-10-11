/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
 * <h2>The External Input Component class</h2>
 *
 * <p>The ExternalInputComponent renders a necessary elements for external input.</p>
 *
 * To use the ExternalInputComponent you should require the appropriate file from common-ui:
 *
 * <pre><code>
 *   require([ 'common-ui/prompting/components/ExternalInputComponent' ],
 *     function(ExternalInputComponent) {
 *       var promptPanel = ...;
 *       var paramDefn = ...;
 *       var args = {
 *         promptType: 'submit',
 *         type: 'SubmitPromptComponent',
 *         name: 'component_name',
 *         htmlObject: 'dom_element_id',
 *         label: 'Submit label',
 *         autoSubmitLabel: 'Auto-Submit label',
 *         promptPanel: promptPanel,
 *         paramDefn: paramDefn,
 *         executeAtStart: true
 *       };
 *       var externalInputComponent = new ExternalInputComponent(args);
 *     }
 *   );
 * </code></pre>
 *
 * where 'args' is an object that contains the parameters necessary for base CDF component and special options:
 * <ul>
 *   <li>promptPanel - {@link PromptPanel} used to check 'autoSubmit' property</li>
 *   <li>paramDefn - {@link ParameterDefinition} used to check 'autoSubmit' property</li>
 *   <li>param - {@link Parameter} The parameter with the properties needed to build the component</li>
 *   <li>parameter - {@link PromptPanel#getParameterName} parameter name unique to this parameter panel</li>
 *   <li>transportFormatter - {@link PromptPanel#createDataTransportFormatter} the format used to send over the wire</li>
 *   <li>formatter - {@link PromptPanel#createFormatter} Formatter used to format this parameter to display</li>
 * </ul>
 *
 * @name ExternalInputComponent
 * @class
 * @extends BaseComponent
 */
define(['cdf/components/BaseComponent','dojo/_base/lang', 'dijit/registry', 'common-ui/jquery-clean'], 
  function(BaseComponent, lang, registry, $) {
    
  return BaseComponent.extend({

    /** Clears an external input element.
     *
     * @method
     * @name ExternalInputComponent#clear
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
     * Renders an external input element.
     *
     * @method
     * @name ExternalInputComponent#update
     */
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

    /**
     * Returns the value of the external input component.
     *
     * @method
     * @name ExternalInputComponent#getValue
     */
    getValue: function () {
      return registry.byId(this.dijitId).get('value');
    }
  });
});

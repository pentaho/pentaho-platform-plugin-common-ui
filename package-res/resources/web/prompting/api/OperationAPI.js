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
 * The Prompting Operation API Class
 * Provides general functions for working with {@link PromptPanel} instance.
 *
 * @name OperationAPI
 * @class
 * @property {PromptPanel} _promptPanel The prompting panel object
 * @property {Object} _msgs Contains possible constants of messages
 */
define(['common-ui/prompting/PromptPanel'], function(PromptPanel) {
  return function(api, id) {
    this._promptPanel = new PromptPanel(id);
    this._msgs = {
      PROMPT_PANEL_NOT_FOUND: "Prompt Panel not found. Call 'api.operation.render' to create a panel.",
      NO_PARAM_DEFN: "'getParameterDefinitionCallback' function does not return a valid ParameterDefinition instance.",
      NO_PARAM_DEFN_FUNC: "No function defined for 'getParameterDefinitionCallback'. Prompts will not be refreshed."
    };

    this._getPromptPanel = function() {
      if (!this._promptPanel) { // Should never happen
        api.log.error(this._msgs.PROMPT_PANEL_NOT_FOUND, true);
      }

      return this._promptPanel;
    };

    /**
     * Sets a special 'getParameterDefinitionCallback' callback function which defines a new prompt set as a {@link ParameterDefinition} object.
     * The getParameterDefinitionCallback callback function will be immediately called
     * and will continue to be called as needed when the prompt panel validates input provided by the user.
     *
     * @name OperationAPI#render
     * @method
     * @param {Function}  getParameterDefinitionCallback The function called when the prompt panel needs to get the new parameter definition {@link ParameterDefinition}.
     *                                                   Receives a callback function which needs to be executed either synchronously or asynchronously.
     * @example
     *  // Asynchronous
     *  api.operation.render(function(api, callback) {
     *    retrieveParamDefn(function(paramDefn) {
     *      callback(paramDefn);
     *    });
     *
     *  // Synchronous
     *  api.operation.render(function(api, callback) {
     *    var paramDefn = retrieveParamDefn();
     *    callback(paramDefn); // return ParameterDefinition object
     *  });
     */
    this.render = function(getParameterDefinitionCallback) {
      if (!getParameterDefinitionCallback || typeof getParameterDefinitionCallback != "function") {
        api.log.error(this._msgs.NO_PARAM_DEFN_FUNC, true);
      }

      getParameterDefinitionCallback(api, (function(paramDefn) {
        if (!paramDefn) {
          api.log.error(this._msgs.NO_PARAM_DEFN, true);
        }

        this._promptPanel.setParamDefn(paramDefn);

        // Override of getParameterDefinition
        this._promptPanel.getParameterDefinition = (function(promptPanel, refreshCallback) {
          getParameterDefinitionCallback(api, (function(paramDefn) {
            if (!paramDefn) {
              api.log.error(this._msgs.NO_PARAM_DEFN);
              refreshCallback(null);
              return;
            }

            refreshCallback(paramDefn);
          }).bind(this));
        }).bind(this);
      }).bind(this));
    };

    /**
     * Initializes the prompt panel
     *
     * @name OperationAPI#init
     * @method
     */
    this.init = function() {
      try {
        this._getPromptPanel().init();
      } catch(e) {
        if (e.message.search("addComponent: duplicate component name") > -1) {
          api.log.warn("Prompt Panel has been initialized already");
        } else {
          throw e;
        }
      }
    };

    /**
     * Gets the current parameter values
     *
     * @name OperationAPI#getParameterValues
     * @method
     * @returns {JSON} parameter values
     */
    this.getParameterValues = function() {
      return this._getPromptPanel().getParameterValues();
    };

    /**
     * Sets the value of a dashboard parameter by parameter name.
     * This operation won't trigger any event on the prompt panel.
     *
     * @name OperationAPI#setParameterValue
     * @method
     * @param {String}    param The name of the parameter that's going to be set
     * @param {Object}    value The new value for the parameter
     */
    this.setParameterValue = function(param, value) {
      this._getPromptPanel().setParameterValue(param, value);
    };

    /**
     * Refreshes the prompt panel.
     * This API function receives a new parameter definition by using a special function which is defined as input callback for {@link OperationAPI#render}.
     * After the previous and the new parameter definitions are compared, it refreshes the prompt user interface with the differences between these parameter definitions.
     * For example, this API function can be used for submitting the prompt panel.
     *
     * @name OperationAPI#refreshPrompt
     * @param {Boolean} forceUpdate The flag indicates the ability to update all components regardless of the differences between the previous and new xml from the server.
     * @method
     * @example
     *     api.operation.refreshPrompt();
     */
    this.refreshPrompt = function(forceUpdate) {
      this._getPromptPanel().refreshPrompt(forceUpdate);
    };
  };
});

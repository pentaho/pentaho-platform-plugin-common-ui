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
      var values;
      try {
        values = this._getPromptPanel().getParameterValues();
      } catch(e) {
        api.log.error(e);
        values = {};
      }
      return values;
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

    /**
     * Reads and modifies a state of the prompting system.
     * This state consists of a set of properties provided by the server which influence the prompting UI behavior.
     * Additionally, this state includes prompting UI properties which are necessary for the prompting UI to interact with the user and the server.
     * The API function can be used to read the current state without inputting the 'state' parameter.
     * Also, the API function can be used to modify the current state with the 'state' parameter, and as a result, the API function returns the modified current state.
     *
     * @name OperationAPI#state
     * @method
     * @param {Object} [state]                    The set of properties which will be applied to the current state. It's an optional parameter.
     * @param {Boolean} [state.parametersChanged] True if the parameters have changed. Otherwise, false.
     * @param {Boolean} [state.autoSubmit]        True is the prompt is in auto submit mode. Otherwise, false. It's limited by the 'allowAutoSubmit' flag.
     * @param {Number} [state.page]               The number of the page. It's limited in range by the 'totalPages' and 'paginate' flags.
     * @returns {Object}                          The current state which consists of the following properties:
     *                                            <ul>
     *                                              <li>'promptNeeded' &lt;Boolean&gt; - True if prompts are needed. Otherwise, false. (read only property)</li>
     *                                              <li>'paginate' &lt;Boolean&gt; - True if pagination is active. Otherwise, false. (read only property)</li>
     *                                              <li>'totalPages' &lt;Number&gt; - The number of total pages in the report. (read only property)</li>
     *                                              <li>'showParameterUI' &lt;Boolean&gt; - The boolean value of the parameter, 'showParameters'. (read only property)</li>
     *                                              <li>'allowAutoSubmit' &lt;Boolean&gt; - The value of autoSubmit, or if it is undefined, the value of autoSubmitUI. (read only property)</li>
     *                                              <li>'parametersChanged' &lt;Boolean&gt; - True if the parameters have changed. Otherwise, false.</li>
     *                                              <li>'autoSubmit' &lt;Boolean&gt; - True if the prompt is in auto submit mode. Otherwise, false.</li>
     *                                              <li>'page' &lt;Number&gt; - The number of the page.</li>
     *                                            </ul>
     * @example
     * // Read state
     * var currentState = api.operation.state();
     * // Return value:
     * //   {
     * //     "promptNeeded":false,
     * //     "paginate":true,
     * //     "totalPages":10,
     * //     "showParameterUI":true,
     * //     "allowAutoSubmit":true,
     * //     "parametersChanged":false,
     * //     "autoSubmit":false,
     * //     "page":1
     * //   }
     *
     * // Modify state
     * currentState.parametersChanged = true;
     * currentState.autoSubmit = true;
     * currentState.page = 2;
     *
     * var updatedState = api.operation.state(currentState);
     * // Return value:
     * //   {
     * //     "promptNeeded":false,
     * //     "paginate":true,
     * //     "totalPages":10,
     * //     "showParameterUI":true,
     * //     "allowAutoSubmit":true,
     * //     "parametersChanged":true,
     * //     "autoSubmit":true,
     * //     "page":2
     * //   }
     */
    this.state = function(state) {
      if (state) {
        try {
          this._getPromptPanel().setState(state);
        } catch(e) {
          api.log.error(e);
        }
      }
      var result;
      try {
        result = this._getPromptPanel().getState();
      } catch(e) {
        api.log.error(e);
        result = {};
      }
      return result;
    };

    /**
     * Executes the prompt panel {@link PromptPanel#submit|submit} function.
     *
     * @name OperationAPI#submit
     * @param {Object}  [options]        Additional configuration options.
     * @param {Boolean} [options.isInit] Flag indicating if submit is being executed during initialization.
     * @method
     * @example
     *      var options = { 'isInit': true };
     *      api.operation.submit(options);
     */
    this.submit = function(options) {
      var promptPanel = this._getPromptPanel();
      promptPanel.submit(promptPanel, options);
    };
  };
});

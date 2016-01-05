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
 * @property {ParameterXmlParser} _parameterParser The parser for xml retrieved from the server call
 * @property {PromptPanel} _promptPanel The prompting panel object
 * @property {Object} _msgs Contains possible constants of messages
 */
define(['common-ui/prompting/PromptPanel', 'common-ui/prompting/parameters/ParameterXmlParser'], function(PromptPanel, ParameterXmlParser) {
  return function(api, id) {
    this._parameterParser = new ParameterXmlParser();
    this._promptPanel = new PromptPanel(id);
    this._msgs = {
      PROMPT_PANEL_NOT_FOUND: "Prompt Panel not found. Call 'api.operation.render' to create a panel.",
      NO_PARAM_XML: "'getParameterXml' function does not return valid xml.",
      NO_PARAM_XML_FUNC: "No function defined for 'getParameterXml'. Prompts will not be refreshed."
    };

    this._getPromptPanel = function() {
      if (!this._promptPanel) { // Should never happen
        api.log.error(this._msgs.PROMPT_PANEL_NOT_FOUND, true);
      }

      return this._promptPanel;
    };

    /**
     * Creates a new prompt panel provided an html id and the xml parameter definition
     *
     * @name OperationAPI#render
     * @method
     * @param {Function}  getParameterXml The function called when the prompt panel needs to get the new parameter xml.
     *                                    Receives a callback function which needs to be executed either synchronously
     *                                    or asynchronously.
     * @example
     *  // Asynchronous
     *  api.operation.render(function(api, callback) {
     *    retrieveXml(function(xml){
     *      callback(xml);
     *    });
     *
     *  // Synchronous
     *  api.operation.render(function(api, callback) {
     *    var xml = retrieveXml();
     *    callback(xml); // return already retrieved xml definition
     *  });
     */
    this.render = function(getParameterXml) {
      if (!getParameterXml || typeof getParameterXml != "function") {
        api.log.error(this._msgs.NO_PARAM_XML_FUNC, true);
      }

      getParameterXml(api, (function(xml) {
        if (!xml) {
          api.log.error(this._msgs.NO_PARAM_XML, true);
        }

        var paramDefn = this._parameterParser.parseParameterXml(xml);
        this._promptPanel.setParamDefn(paramDefn);

        // Override of getParameterDefinition
        this._promptPanel.getParameterDefinition = (function(promptPanel, refreshCallback) {
          getParameterXml(api, (function(xml) {
            if (!xml) {
              api.log.error(this._msgs.NO_PARAM_XML);
              refreshCallback(null);
              return;
            }

            var paramDefn = this._parameterParser.parseParameterXml(xml);
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
     * This API function gets a new parameter definition by using a special function that is defined as input callback for {@link OperationAPI#render}.
     * Further are compared the previous and the new parameter definitions and after that it refreshes the prompt user interface with the differences between parameter definitions.
     * For example, this API function can be used for submitting prompt panel.
     *
     * @name OperationAPI#refreshPrompt
     * @param {Boolean} forceUpdate The flag indicates ability to update all components regardless of the difference previous and new xml from server
     * @method
     * @example
     *     api.operation.refreshPrompt();
     */
    this.refreshPrompt = function(forceUpdate) {
      this._getPromptPanel().refreshPrompt(forceUpdate);
    };
  };
});

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
  return function(api) {
    this._parameterParser = new ParameterXmlParser();
    this._promptPanel = null;
    this._msgs = {
      PROMPT_PANEL_NOT_FOUND: "Prompt Panel not found. Call 'api.operation.render' to create a panel.",
      NO_PARAM_XML: "'getParameterXml' function does not return valid xml.",
      NO_PARAM_XML_FUNC: "No function defined for 'getParameterXml'. Prompts will not be refreshed."
    };

    this._getPromptPanel = function() {
      if (!this._promptPanel) {
        api.log.error(this._msgs.PROMPT_PANEL_NOT_FOUND, true);
      }

      return this._promptPanel;
    };

    /**
     * Creates a new prompt panel provided an html id and the xml parameter definition
     *
     * @name OperationAPI#render
     * @method
     * @param {String}    id HTML object id where the render the panel
     * @param {Function}  getParameterXml The function called when the prompt panel needs to get the new parameter xml.
     *                                    Receives a callback function which needs to be executed either synchronously
     *                                    or asynchronously.
     * @example
     *  // Asynchronous
     *  api.operation.render("prompt-panel-render-area", function(api, callback) {
     *    retrieveXml(function(xml){
     *      callback(xml);
     *    });
     *
     *  // Synchronous
     *  api.operation.render("prompt-panel-render-area", function(api, callback) {
     *    var xml = retrieveXml();
     *    callback(xml); // return already retrieved xml definition
     *  });
     */
    this.render = function(id, getParameterXml) {
      if (!getParameterXml || typeof getParameterXml != "function") {
        api.log.error(this._msgs.NO_PARAM_XML_FUNC, true);
      }

      getParameterXml(api, (function(xml) {
        if (!xml) {
          api.log.error(this._msgs.NO_PARAM_XML, true);
        }

        var paramDefn = this._parameterParser.parseParameterXml(xml);
        this._promptPanel = new PromptPanel(id, paramDefn);

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
      this._getPromptPanel().init();
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
    }
  };
});

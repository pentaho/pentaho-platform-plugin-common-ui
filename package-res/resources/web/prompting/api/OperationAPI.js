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
      PROMPT_PANEL_NOT_FOUND: "Prompt Panel not found. Call 'api.operation.render' to create a panel."
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
     * @param {String} id HTML object id where the render the panel
     * @param {String} xml XML string containing the parameter definition
     */
    this.render = function(id, xml) {
      var paramDefn = this._parameterParser.parseParameterXml(xml);
      this._promptPanel = new PromptPanel(id, paramDefn);
    };

    /**
     * Refreshes the prompt panel with a given a new xml parameter definition
     *
     * @name OperationAPI#update
     * @method
     * @param {String} xml XML string containing the parameter definition
     */
    this.update = function(xml) {
      var paramDefn = this._parameterParser.parseParameterXml(xml);
      this._getPromptPanel().refresh(paramDefn);
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
     * @returns {Array} parameter values
     */
    this.getParameterValues = function() {
      return this._getPromptPanel().getParameterValues();
    };
  };
});
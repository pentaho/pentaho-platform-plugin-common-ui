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
 * The Prompting Event API Class
 * Provides general functions for working with different events of prompting.
 *
 * @name EventAPI
 * @class
 */
define([], function() {
  return function(api) {
    /**
     * Registers a before render event
     *
     * @name EventAPI#beforeRender
     * @method
     * @param {Function} callback   The function to be executed when the event is triggered
     *                              Pass null if you wish to unbind this event
     */
    this.beforeRender = function(callback) {
      api.operation._getPromptPanel().onBeforeRender = callback;
    };

    /**
     * Registers an after render event
     *
     * @name EventAPI#afterRender
     * @method
     * @param {Function} callback   The function to be executed when the event is triggered
     *                              Pass null if you wish to unbind this event
     */
    this.afterRender = function(callback) {
      api.operation._getPromptPanel().onAfterRender = callback;
    };

    /**
     * Registers a before update event
     *
     * @name EventAPI#beforeUpdate
     * @method
     * @param {Function} callback   The function to be executed when the event is triggered
     *                              Pass null if you wish to unbind this event
     */
    this.beforeUpdate = function(callback) {
      api.operation._getPromptPanel().onBeforeUpdate = callback;
    };

    /**
     * Registers an after update event
     *
     * @name EventAPI#afterUpdate
     * @method
     * @param {Function} callback   The function to be executed when the event is triggered
     *                              Pass null if you wish to unbind this event
     */
    this.afterUpdate = function(callback) {
      api.operation._getPromptPanel().onAfterUpdate = callback;
    };

    /**
     * Registers a parameter changed event.
     *
     * @name EventAPI#parameterChanged
     * @method
     * @param {Function} callback   The function to be executed when the event is triggered.
     *                              Pass null if you wish to unbind this event.
     * @param {String} paramName    The name of the parameter to which the callback will be called.
     *                              This argument is optional. If no parameter name is passed on
     *                              the callback, it will be assigned to all the parameters. If paramName is
     *                              not a valid string, the callback will be registered to all parameters.
     *
     * @example <caption>Register a parameter changed event to all parameters which do not have a specific callback assigned.</caption>
     *  api.event.parameterChanged(function(parameterName, parameterValue) {
     *    // Execute event based code
     *  })
     *
     * @example <caption>Register a parameter changed event to the parameter called "parameterName".</caption>
     *  api.event.parameterChanged(function(parameterName, parameterValue) {
     *    // Execute event based code
     *  }, "parameterName")
     */
    this.parameterChanged = function(callback, paramName) {
      if (callback) {
        if (!api.operation._getPromptPanel().onParameterChanged) {
          api.operation._getPromptPanel().onParameterChanged = {};
        }
        paramName = (typeof paramName === "string" && paramName) || '';
        api.operation._getPromptPanel().onParameterChanged[paramName] = callback;
      } else {
        api.operation._getPromptPanel().onParameterChanged = null;
      }
    };

    /**
     * Registers a post init event
     *
     * @name EventAPI#postInit
     * @method
     * @param {Function} callback The function to be executed when the event is triggered
     *
     * @example
     * api.event.postInit(function() {
     *   // Execute event based code
     * })
     */
    this.postInit = function(callback) {
      api.operation._getPromptPanel().onPostInit(callback);
    };

    /**
     * This function allows you to bind a listener to the 'ready' state,
     * which will be executed when the prompt is ready. If you have already
     * bound a listener to this event, you can pass null to unbind it.
     *
     * @name EventAPI#ready
     * @method
     * @param {Function} callback   The function to be executed when the event is triggered.
     *                               Pass null if you wish to unbind this event.
     * @example
     *  api.event.ready(function(promptPanel) {
     *    // Execute event based code
     *  })
     */
    this.ready = function(callback) {
      if(typeof callback === 'function') {
        api.operation._getPromptPanel().ready = callback;
      } else {
        api.operation._getPromptPanel().ready = function(){};
      }
    };

    /**
     * Registers a listener for when the state of the prompt panel or the parameter definition changes.
     *
     * @name EventAPI#stateChanged
     * @method
     * @param {Function} callback   The function to be executed when the event is triggered. Pass a value of null
     *                              if you wish to unbind this event.
     * @example
     *  api.event.stateChanged(function(name, oldValue, newValue) {
     *    // Execute event based code
     *
     *    // Parameters for State Changed callback
     *    // promptNeeded - server validation has failed and the user needs to correct inputs.
     *    // paginate - the content spans multiple pages therefore show the pagination control.
     *    // totalPages - the number of pages expected by the server.
     *    // showParameterUI - initially hide the parameter UI, but show pagination control, if needed.
     *    // allowAutoSubmit - is auto submission of parameter values allowed after input from the user.
     *    // parametersChanged - the user has changed the parameter values.
     *    // autoSubmit - is auto-submit of the prompt panel values enabled.
     *    // page - the current page in the pagination control. This is limited in range by the "totalPages" property.
     *  });
     */
    this.stateChanged = function(callback) {
      var promptPanel = api.operation._getPromptPanel();
      if(typeof callback === 'function') {
        promptPanel.onStateChanged = callback;
      } else {
        promptPanel.onStateChanged = null;
      }
    }

    /**
     * Registers a callback function to be executed when the submit event is triggered.
     *
     * @name EventAPI#submit
     * @method
     * @param {Function} callback The function to be executed when the event is triggered.
     *                            Passing anything other than a function will unbind this event.
     * @example
     *  api.event.submit(function(options) {
     *    // Process options.isInit flag if needed.
     *    // Execute event-based code.
     *  })
     */
    this.submit = function(callback) {
      if(typeof callback === 'function') {
        api.operation._getPromptPanel().onSubmit = callback;
      } else {
        api.operation._getPromptPanel().onSubmit = null;
      }
    };
  };
});

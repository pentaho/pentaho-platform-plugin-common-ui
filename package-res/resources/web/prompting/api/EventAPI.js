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
     * @param {Function} callback The function to be executed when the event is triggered
     */
    this.beforeRender = function(callback) {
      api.operation._getPromptPanel().dashboard.on('cdf:beforeRender', callback);
    };
    
    /**
     * Registers an after render event
     *
     * @name EventAPI#afterRender
     * @method
     * @param {Function} callback The function to be executed when the event is triggered
     */
    this.afterRender = function(callback) {
      api.operation._getPromptPanel().dashboard.on('cdf:afterRender', callback);
    };

    /**
     * Registers a parameter changed event
     *
     * @name EventAPI#parameterChanged
     * @method
     * @param {Function} callback The function to be executed when the event is triggered
     */
    this.parameterChanged = function(callback) {
      api.operation._getPromptPanel().dashboard.on('cdf:parameterChanged', callback);
    };

    /**
     * Registers a post init event
     *
     * @name EventAPI#postInit
     * @method
     * @param {Function} callback The function to be executed when the event is triggered
     */
    this.postInit = function(callback) {
      api.operation._getPromptPanel().dashboard.on('cdf:postInit', callback);
    };
  };
});
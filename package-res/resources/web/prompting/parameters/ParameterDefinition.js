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

define([], function () {
  return function () {

    return {
      'autoSubmit': undefined, // boolean
      'autoSubmitUI': undefined, // boolean
      'ignoreBiServer5538': undefined, // boolean
      'layout': undefined, // string, [vertical, horizontal]
      'page': undefined, // integer
      'paginate': undefined, // boolean
      'parameterGroups': [],
      'promptNeeded': undefined, // boolean
      'totalPages': undefined, // integer
      'errors': {}, // hash of {paramName, [error1..n]}. "Global" errors are stored as {'null', [error1..n]}.

      /**
       * Returns parameter group from a given name
       *
       * @param {String} name The name of the group to get
       * @returns {ParameterGroup} The parameter group matching the name
       */
      getParameterGroup: function (name) {
        var group;
        $.each(this.parameterGroups, function (i, g) {
          if (g.name === name) {
            group = g;
            return false; // break
          }
        });
        return group;
      },

      /**
       * Gets the value of autoSubmit, or if it is undefined the value of autoSubmitUI
       *
       * @returns {Boolean} The boolean value of auto submit
       */
      allowAutoSubmit: function () {
        if (this.autoSubmit != undefined) {
          return this.autoSubmit;
        }
        return this.autoSubmitUI;
      },

      /**
       * Returns the boolean value of the parameter ShowParameters
       *
       * @returns {Boolean} The value of the parameter ShowParameters
       */
      showParameterUI: function () {
        var showParameters;
        this.mapParameters(function (p) {
          if (p.name == 'showParameters') {
            showParameters = p;
            return false; // break
          }
        });

        return !showParameters || !showParameters.isSelectedValue('false');
      },

      /**
       * Gets the parameter from a given name
       *
       * @param {String} name The name of the parameter
       * @returns {Parameter} The parameter
       */
      getParameter: function (name) {
        var param;
        this.mapParameters(function (p) {
          if (p.name === name) {
            param = p;
            return false; // break
          }
        });
        return param;
      },

      /**
       * @callback callback~cb
       * @param {Parameter} parameter The parameter
       * @param {ParameterGroup} group The group
       */

      /**
       * Executes the callback for each parameter
       *
       * @param {callback~cb} callback
       * @param {Object} x The context to run the callback
       * @returns {Boolean} {true} if all parameters were mapped, {false} otherwise
       */
      mapParameters: function (callback, x) {
        var d = this;
        var breaking = false;
        $.each(this.parameterGroups, function (i, group) {
          $.each(this.parameters, function (j, parameter) {
            if (callback.call(x, parameter, group, d) === false) {
              breaking = true;
              return false; // break
            }
          });
          if (breaking) {
            return false;
          }
        });

        return !breaking;
      }
    };
  }
});

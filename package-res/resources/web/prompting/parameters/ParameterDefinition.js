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
 * @name ParameterDefinition
 * @class
 * @property {Boolean} autoSubmit True is the prompt is in auto submit mode, False otherwise
 * @property {Boolean} autoSubmitUI True if the prompt is in auto submit mode defined in the ui, False otherwise
 * @property {String} layout String defining if the layout of the prompt is Vertical or Horizontal
 * @property {Number} page The number of the page
 * @property {Boolean} paginate True if pagination is active, False otherwise
 * @property {Array|ParameterGroup} parameterGroups The array of ParameterGroup
 * @property {Boolean} promotNeeded True if prompts are needed, False otherwise
 * @property {Number} totalPages The number of total pages of the report
 * @property {Object|Array} errors The array of errors per parameter
 */
define(['common-ui/jquery-clean'], function ($) {
  return function () {

    return {
      'autoSubmit': undefined,
      'autoSubmitUI': undefined,
      'ignoreBiServer5538': undefined,
      'layout': undefined,
      'page': undefined,
      'paginate': undefined,
      'parameterGroups': [],
      'promptNeeded': undefined, // boolean
      'totalPages': undefined, // integer
      'errors': {}, // hash of {paramName, [error1..n]}. "Global" errors are stored as {'null', [error1..n]}.
      'minimized': undefined,

      /**
       * Returns parameter group from a given name
       *
       * @name ParameterDefinition#getParameterGroup
       * @method
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
       * @name ParameterDefinition#allowAutoSubmit
       * @method
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
       * @name ParameterDefinition#showParameterUI
       * @method
       * @returns {Boolean} The value of the parameter ShowParameters
       */
      showParameterUI: function () {
        var showParameters = true;
        this.mapParameters(function (p) {
          if (p.name == 'showParameters') {
            showParameters = p;
            return false; // break
          }
        });
        return (showParameters.isSelectedValue !== undefined) ? !showParameters.isSelectedValue('false') : !showParameters;
      },

      /**
       * Gets the parameter from a given name
       *
       * @name ParameterDefinition#getParameter
       * @method
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
       * Executes the callback for each parameter
       *
       * @name ParameterDefinition#mapParameters
       * @method
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
      },

      /**
       * Updates value of parameter with new one taken from passed parameter object
       * @param newParameter - parameter object with new value
       */
      updateParameterValue: function (newParameter){
        if(newParameter && newParameter.name){
          this.mapParameters( function (oldParam, group) {
            if(newParameter.name === oldParam.name){
              var index = group.parameters.indexOf(oldParam);
              group.parameters[index].values = newParameter.values;
              return;
            }
          }, this );
        }
      }
    };
  }
});

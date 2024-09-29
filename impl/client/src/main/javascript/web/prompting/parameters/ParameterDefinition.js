/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


/**
 * @name ParameterDefinition
 * @class
 * @property {boolean} autoSubmit True is the prompt is in auto submit mode, False otherwise
 * @property {boolean} autoSubmitUI True if the prompt is in auto submit mode defined in the ui, False otherwise
 * @property {string} layout String defining if the layout of the prompt is Vertical or Horizontal
 * @property {number} page The number of the page
 * @property {boolean} paginate True if pagination is active, False otherwise
 * @property {Array|ParameterGroup} parameterGroups The array of ParameterGroup
 * @property {boolean} promotNeeded True if prompts are needed, False otherwise
 * @property {number} totalPages The number of total pages of the report
 * @property {object|Array} errors The array of errors per parameter
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
              /*
               * [BISERVER-14306]
               * In case this particular parameter has a timezoneHint, we need to persist it
               */
              if(newParameter.timezoneHint !== undefined){
                group.parameters[index].timezoneHint = newParameter.timezoneHint;
              }
              return;
            }
          }, this );
        }
      },

      /**
       * Updates attriubtes of parameter with new one taken from passed parameter object
       * @param newParameter - parameter object with new attribute values
       */
      updateParameterAttribute: function (newParameter) {
        if (newParameter && newParameter.name && newParameter.attributes) {
          this.mapParameters(function (oldParam, group) {
            if (newParameter.name === oldParam.name) {
              var index = group.parameters.indexOf(oldParam);
              $.each(newParameter.attributes, function(key, val) {
                if ( group.parameters[index].attributes[key] !== undefined ) {
                  group.parameters[index].attributes[key] = val;
                }
              });
              return;
            }
          }, this );
        }
      }
    };
  }
});

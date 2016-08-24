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
 * Utility to determine the differences of pair ParameterDefinition objects
 * 
 * @name ParameterDefinitionDiffer
 * @class
 */
define([], function() {
  return function() {

    return {
      _isBehavioralAttrsChanged : function(oldParam, newParam) {
        // TODO determine enough compare attributes or something else properties
        var result = JSON.stringify(oldParam.attributes) !== JSON.stringify(newParam.attributes)
          || oldParam.list !== newParam.list 
          || oldParam.mandatory !== newParam.mandatory
          || oldParam.multiSelect !== newParam.multiSelect 
          || oldParam.strict !== newParam.strict
          || oldParam.type !== newParam.type;
        return result;
      },

      _isDataChanged : function(oldParam, newParam) {
        // TODO determine what kind of properties are data, only values or not
        var result = JSON.stringify(oldParam.values) !== JSON.stringify(newParam.values);
        return result;
      },

      _isErrorsChanged : function(paramName, oldParamDefn, newParamDefn) {
        var oldErrors = oldParamDefn.errors[paramName];
        var newErrors = newParamDefn.errors[paramName];
        return JSON.stringify(oldErrors) !== JSON.stringify(newErrors);
      },

      _fillWrapObj : function(result, propName, group, param) {
        if (!result[propName][group.name]) {
          result[propName][group.name] = {
            group : group,
            params : []
          }
        }

        result[propName][group.name].params.push(param);
      },

      /**
       * Returns result differences object for oldParamDefn and newParamDefn object. The result contains group and arrays of
       * parameters that were added to newParamDefn object, were removed from newParamDefn object and were changed in
       * newParamDefn object. The result array "toAdd" contains new parameters and means that is needed to create new 
       * components based this new parameters. The result array "toRemove" contains old parameters and means that is
       * needed to remove components based this old parameters. The result array "toChangeData" contains parameters
       * with changed data and means that is needed to update data of existing components based this changed parameters.
       * 
       * @name ParameterDefinitionDiffer#diff
       * @method
       * @param {ParameterDefinition}
       *          oldParamDefn The old object instance of {@link ParameterDefinition}
       * @param {ParameterDefinition}
       *          newParamDefn The new object instance of {@link ParameterDefinition}
       * @returns {Object} The result object contains data about added, changed and removed parameters between
       *          oldParamDefn and newParamDefn object. The result object consists of properties "toAdd",
       *          "toChangeData", "toRemove". Each property is an array with values of {@link Parameter} type
       * 
       * An example of using:
       * <pre><code>
       *  require([ 'common-ui/prompting/parameters/ParameterDefinitionDiffer' ],
       *     function(ParameterDefinitionDiffer) {
       *       var differ = new ParameterDefinitionDiffer();
       *       var result = differ.diff(new ParameterDefinition(), new ParameterDefinition());
       *     }
       *   );
       * </code></pre>
       *
       * An example returned result:
       * <pre><code>
       *   {
       *     "toAdd" : {
       *       "my_test_group" : {
       *         "group" : {
       *           "name" : "my_test_group",
       *           "label" : undefined,
       *           "parameters" : []
       *         },
       *         params : [] // new parameters to add
       *       }
       *     },
       *     "toChangeData" : {},
       *     "toRemove" : {}
       *   }
       * </code></pre>
       */
      diff : function(oldParamDefn, newParamDefn, nullValueParams) {
        if (!oldParamDefn || !newParamDefn) {
          return false;
        }

        var result = {
          toAdd : {},
          toChangeData : {},
          toRemove : {}
        };

        // find removed parameters
        oldParamDefn.mapParameters(function(param, group) {
          if (!param.attributes.hidden || param.attributes.hidden == 'false') { // Can be 'false' or undefined
            var newParam = newParamDefn.getParameter(param.name);
            if (!newParam || newParam.attributes.hidden == 'true') {
              this._fillWrapObj(result, "toRemove", group, param);
            }
          }
        }, this);
        // find new and changed parameters
        newParamDefn.mapParameters(function(param, group) {
          if (!param.attributes.hidden || param.attributes.hidden == 'false') { // Can be 'false' or undefined
            var index = group.parameters.indexOf(param);
            if (index > 0) {
              param.after = group.parameters[index-1];
            }

            var oldParam = oldParamDefn.getParameter(param.name);
            if (!oldParam || oldParam.attributes.hidden == 'true') {
              this._fillWrapObj(result, "toAdd", group, param); // found newest parameters
            } else if (this._isBehavioralAttrsChanged(oldParam, param)) {
              // add parameter to remove and add arrays for recreating components
              this._fillWrapObj(result, "toRemove", group, oldParam);
              this._fillWrapObj(result, "toAdd", group, param);
            } else {
              param.isErrorChanged = this._isErrorsChanged(param.name, oldParamDefn, newParamDefn);
              if (this._isDataChanged(oldParam, param) || param.isErrorChanged) {
                this._fillWrapObj(result, "toChangeData", group, param);
              }
            }
          }
        }, this);

        // Force change on null value params back to originally selected value
        for (var i in nullValueParams) {
          var nullValueParam = nullValueParams[i];
          newParamDefn.mapParameters(function(param, group) {
            if (nullValueParam.name == param.name) {
              param.forceUpdate = true;
              this._fillWrapObj(result, "toChangeData", group, param);
              return false;
            }
          }, this);
        }

        return result;
      }
    };
  };
});
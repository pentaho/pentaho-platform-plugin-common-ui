/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
 */
define([
  "pentaho/visual/spec/helper",
  "pentaho/util/promise",
  "pentaho/util/error"
], function(specHelper, promiseUtil, error) {

  /**
   * @module pentaho.visual.editing
   */

  /**
   * A singleton helper class with utility methods
   * for working with {{#crossLink "IVisualType"}}{{/crossLink}} instances.
   *
   * #### AMD
   *
   * **Module Id**: `"pentaho/visual/type/helper"`
   *
   * **Module Type**: {{#crossLink "VisualTypeHelper"}}{{/crossLink}}
   *
   * @class VisualTypeHelper
   * @constructor
   */

  return {
      createInstance: createInstance,
      mapGeneralRequirements: mapGeneralRequirements,
      mapVisualRoleRequirements: mapVisualRoleRequirements,
      getRequirements: getRequirements,
      getRequirementOccurRange: getRequirementOccurRange
    };

  /**
   * Maps the **general** requirements of the first requirement set of the given type.
   *
   * Ignores requirements having the name of a standard specification property.
   *
   * Read more about
   * {{#crossLink "IGeneralRequirement"}}general requirement{{/crossLink}}
   * and
   * {{#crossLink "IRequirementSet"}}requirement set{{/crossLink}}.
   *
   * @method mapGeneralRequirements
   *
   * @param {IVisualType} type The visual type.
   * @param {function} fun The mapping function.
   *   Called with the general requirement
   *   {{#crossLink "IGeneralRequirement"}}{{/crossLink}} as only argument.
   * @param {object} [ctx] The `this`context on which to call `fun`.
   */
  function mapGeneralRequirements(type, fun, ctx) {
    if(!fun) throw error.argRequired("fun");
    var reqs = getRequirements(type);
    if(reqs) reqs.forEach(function(req) {
      if(!req.dataStructure && !specHelper.isStandardProperty(req.id))
        fun.call(ctx, req);
    }, this);
  }

  /**
   * Maps the **visual role** requirements of the first requirement set of the given type.
   *
   * Ignores requirements having the name of a standard specification property.
   *
   * Read more about
   * {{#crossLink "IVisualRoleRequirement"}}visual role requirement{{/crossLink}}
   * and
   * {{#crossLink "IRequirementSet"}}requirement set{{/crossLink}}.
   *
   * @method mapVisualRoleRequirements
   *
   * @param {IVisualType} type The visual type.
   * @param {function} fun The mapping function.
   *   Called with the visual role requirement
   *   {{#crossLink "IVisualRoleRequirement"}}{{/crossLink}} as only argument.
   * @param {object} [ctx] The `this`context on which to call `fun`.
   */
  function mapVisualRoleRequirements(type, fun, ctx) {
    if(!fun) throw error.argRequired("fun");
    var reqs = getRequirements(type);
    if(reqs) reqs.forEach(function(req) {
      if(req.dataStructure && !specHelper.isStandardProperty(req.id))
        fun.call(ctx, req);
    }, this);
  }

  /**
   * Gets all the requirements of the first requirement set of the given type
   * (even any having the name of a standard specification property).
   *
   * Read more about
   * {{#crossLink "IRequirement"}}requirement{{/crossLink}}
   * and
   * {{#crossLink "IRequirementSet"}}requirement set{{/crossLink}}.
   *
   * Do **not** modify the returned array or any of its elements.
   *
   * @method getRequirements
   *
   * @param {IVisualType} type The visual type.
   *
   * @return {IRequirement[]} The requirements.
   */
  function getRequirements(type) {
    if(!type) throw error.argRequired("type");
    var dataReqs = type.dataReqs;
    return (dataReqs && dataReqs[0] && dataReqs[0].reqs) || null;
  }

  /**
   * Gets the normalized occurrence range of a requirement.
   *
   * @method getRequirementOccurRange
   *
   * @param {IRequirement} req The data requirement.
   *
   * @return {Object} An object with `min` and `max` properties.
   */
  function getRequirementOccurRange(req) {
    var minOccur = Math.max(req.required ? 1 : 0, req.minOccur || 0); // >= 0

    var allowMultiple = req.allowMultiple == null || !!req.allowMultiple;
    var maxOccur = Math.min( // >=  1
          allowMultiple ? Infinity : 1,
          req.maxOccur == null ? Infinity : Math.max(req.maxOccur, 1));

    return {
      min: minOccur,
      max: minOccur > maxOccur ? minOccur : maxOccur
    };
  }

  /**
   * Asynchronously creates a visual with the given options.
   *
   * @method createInstance
   * @param {IVisualCreateOptions} createOptions Options to create the visual.
   *
   * @return {Promise.<IVisual>} A promise for an {{#crossLink "IVisual"}}{{/crossLink}}.
   */
  function createInstance(createOptions) {
    if(!createOptions) throw error.argRequired("createOptions");

    var type = createOptions.type;

    if(!type) throw error.argRequired("createOptions.type");
    if(!createOptions.domElement) throw error.argRequired("createOptions.domElement");

    var factory = type.factory, classPath;
    if(factory) {
      switch(typeof factory) {
        case "string":
          return promiseUtil.require(factory)
            .then(function(factory) {
                return factory(createOptions);
              })
            .then(haveVisual);

        case "function": break;
        default: throw error.argInvalidType("createOptions.type.factory", ["string", "function"], typeof factory);
      }
    } else if((classPath = type['class'])) {
      factory = createClassFactory(classPath);
    } else {
      throw error.argRequired("createOptions.type.factory");
    }

    return promiseUtil.wrapCall(function() { return factory(createOptions); })
      .then(haveVisual);
  }

  function haveVisual(visual) {
    if(!visual) throw new Error("Invalid visual factory.");
    return visual;
  }

  function createClassFactory(classPath) {

    return classFactory;

    function classFactory(createOptions) {
      // Legacy global class
      var visual;
      eval('(visual = new ' + classPath + '(createOptions.domElement))');
      return visual;
    }
  }
});

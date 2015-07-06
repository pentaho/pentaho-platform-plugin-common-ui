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
 */
define([
  "../_utils"
], function(utils) {

  /**
   * @module pentaho.visual.editing
   */

  /**
   * A singleton helper class with methods that
   * operate on visual specifications.
   *
   * #### AMD
   *
   * **Module Id**: `"pentaho/visual/spec/helper"`
   *
   * **Module Type**: {{#crossLink "VisualSpecHelper"}}{{/crossLink}}
   *
   * @class VisualSpecHelper
   * @constructor
   */

  var standardSpec = {
          action: 1,
          type:   1,
          state:  1,
          data:   1,
          width:  1,
          height: 1,
          highlights: 1,
          direct: 1
        };

  return {
      create: create,
      clone:  clone,
      setProperties: setProperties,
      eachProperties: eachProperties,
      isStandardProperty: isStandardProperty
    };

  /**
   * Indicates if a name is that of a standard property name.
   *
   * Standard specification properties are those defined
   * by the {{#crossLink "IVisualSpec"}}{{/crossLink}} and
   * {{#crossLink "IVisualDrawSpec"}}{{/crossLink}} interfaces:
   *
   * * `type`
   * * `state`
   * * `data`
   * * `highlights`
   * * `direct`
   * * `width`
   * * `height`
   * * `action`
   *
   * @method isStandardProperty
   *
   * @return {boolean} `true` if the property name is _standard_, `false` otherwise.
   */
  function isStandardProperty(name) {
    return standardSpec[name] === 1;
  }

  /**
   * Creates a specification of a given visual type and, optionally,
   * having the additional specified "visual properties".
   *
   * See {{#crossLink "VisualSpecHelper/setProperties:method"}}{{/crossLink}}
   * for information on how the specified `properties` are set in the
   * newly created specification.
   *
   * @method create
   * @param {IVisualType} type The visual type.
   * @param {Object} [properties] Visual properties to initialize the specification.
   *
   * @return {IVisualSpec} The created visual specification.
   */
  function create(type, properties) {
    if(!type) throw utils.error.argRequired("type");
    var spec = {
            type:   type.id,
            width:  undefined,
            height: undefined,
            state:  undefined,
            data:   undefined,
            highlights: undefined,
            direct: undefined
          };

    // 0 - Fill with own, defined and non-standard properties of IVisualType.args
    setProperties(spec, type.args && clone(type.args));

    // 1 - Fill with specified properties
    setProperties(spec, properties);

    return spec;
  }

  /**
   * Clones a visual specification.
   *
   * @method clone
   *
   * @param {IVisualSpec} spec The specification to clone.
   *
   * @return {IVisualSpec} The cloned specification.
   */
  function clone(spec) {
    var clone = {},
        O_proto = Object.prototype,
        p, v;

    for(p in spec)
      if(O_proto[p] !== (v = spec[p]))
        clone[p] = utils.shallowObjectClone(v);

    return clone;
  }

  /**
   * Calls a function for each generic (non-standard), defined property of a visual specification.
   *
   * @method eachProperties
   *
   * @param {IVisualSpec} spec The specification whose properties to map.
   * @param {function} fun The mapping function.
   *   Called with each property's value and name as arguments.
   *   Iteration is cancelled if the function returns the value `false`.
   * @param {object} [ctx] The `this` context on which to call `fun`.
   *
   * @return {boolean} `true` if iteration was not cancelled, `false` otherwise.
   */
  function eachProperties(spec, fun, ctx) {
    return utils.O_eachOwnDefined.call(spec, function(v, p) {
      if(!isStandardProperty(p))
        return fun.call(ctx, v, p); // maybe stop
    });
  }

  /**
   * Sets properties in a visual specification, given a property map.
   *
   * Optionally, only sets properties that are not yet defined in
   * the given specification.
   *
   * Only the _own_ and non-standard properties of `props` are considered.
   *
   * See {{#crossLink "VisualSpecHelper/isStandardProperty:method"}}{{/crossLink}}.
   *
   * @method setProperties
   *
   * @param {IVisualSpec} spec The specification to set properties in.
   * @param {object} props A map of properties.
   * @param {boolean} [defaultsOnly=false] Indicates if only the properties
   * of the specification that have no value should be set.
   */
  function setProperties(spec, props, defaultsOnly) {
    if(props) eachProperties(props, function(v, p) {
      if(!defaultsOnly || spec[p] === undefined)
        spec[p] = v;
    });
  }
});

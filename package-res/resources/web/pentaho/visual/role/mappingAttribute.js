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
  "module",
  "pentaho/i18n!messages",
  "pentaho/util/object",
  "./aggregation"
], function(module, bundle, O) {

  "use strict";

  return function(context) {

    var Complex = context.get("complex");

    /**
     * @name pentaho.visual.role.MappingAttribute
     * @class
     * @extends pentaho.type.Complex
     *
     * @amd {pentaho.type.Factory<pentaho.visual.role.MappingAttribute>} pentaho/visual/role/mappingAttribute
     *
     * @classDesc The `MappingAttribute` class represents a data property in a
     * [visual role mapping]{@link pentaho.visual.role.Mapping}.
     *
     * @see pentaho.visual.role.Mapping
     *
     * @description Creates a visual role mapping attribute instance.
     * @constructor
     * @param {pentaho.visual.role.spec.UMappingAttribute} [spec] A visual role mapping attribute specification.
     */
    return Complex.extend("pentaho.visual.role.MappingAttribute", /** @lends pentaho.visual.role.MappingAttribute# */{

      constructor: function(spec, keyArgs) {
        // The name property?
        if(typeof spec === "string") spec = {name: spec};

        this.base(spec, keyArgs);
      },

      toSpecInContext: function(keyArgs) {
        var spec = this.base(keyArgs);
        if(spec && spec.constructor === Object) {
          // If only the name is output, then return it directly.
          var count = 0;
          var name = null;

          for(var p in spec) {
            if(O.hasOwn(spec, p)) {
              count++;
              if(count > 1 || p !== "name") break;
              // count === 0 && p === name
              name = spec.name;
            }
          }

          if(name && count === 1) spec = name;
        }

        return spec;
      },

      type: /** @lends pentaho.visual.role.MappingAttribute.Type# */{
        id: module.id,

        props: [
          {name: "name", type: "string", isRequired: true},
          {name: "aggregation", type: "pentaho/visual/role/aggregation", value: "sum"},
          {name: "isReverse", type: "boolean", value: false}
        ]
      }
    })
    .implement({type: bundle.structured.mappingAttribute});
  };
});
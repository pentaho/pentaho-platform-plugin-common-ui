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
  "./Base",
  "../type/Context",
  "../util/object"
], function(Base, context, O) {

  var Complex = context.get("pentaho/type/complex");
  
  return Base.extend("pentaho.lang.ComplexChange", {

    constructor: function(source) {
      this._source = source;
      this._properties = {};
    },

    get source() {
      return this._source;
    },

    has: function(property) {
      return O.hasOwn(this._properties, property);
    },

    set: function(property, change) {
      var source = this._source;

      if(source instanceof Complex) {
        var ptype = source.type.get(property);

        if(!ptype.isList)
          change = {type: "set", oldValue: source.getv(property), newValue: change};

      }
      
      this._properties[property] = change;
    },
    
    get: function(property) {
      if(!this.has(property)) return null;

      return this._properties[property];
    },

    propertyNames: function() {
      return Object.keys(this._properties);
    }
  });

});
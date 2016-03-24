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
  "../util/object"
], function(Base, O) {

  "use strict";

  return Base.extend("pentaho.lang.ComplexChangeset", {

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
      var pType = source.type.get(property);

      var propertyChange = pType.isList ? createListChange(source, property, change) : createValueChange(source, property, change);

      this._properties[property] = propertyChange;
      //TODO: decide if this should be chainable
    },

    get: function(property) {
      if(!this.has(property)) return null;

      return this._properties[property];
    },

    get propertyNames() {
      return Object.keys(this._properties);
    },

    each: function(iterator, context){
      var iteratorContext = context || this;
      this.propertyNames.forEach(function(name){
        iterator.call(iteratorContext, this.get(name), name);
      }, this);
      //TODO: decide if this should be chainable
    }
  });


  function createValueChange(source, property, value) {
    return {
      get type() { return "set"; },
      get oldValue() { return source.get(property); },
      newValue: value
    };
  }

  function createListChange(source, property, change) {
    return {};
  }

});

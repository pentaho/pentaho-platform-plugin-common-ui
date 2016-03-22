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
  
  return Base.extend("pentaho.lang.ChangeSet", {

    constructor: function(property, value, previousValue) {
      this._previousValues = {};
      this._values = {};

      this._newEntry(property, previousValue, value);
    },

    has: function(property) {
      return O.hasOwn(this._previousValues, property);
    },

    _newEntry: function(property, previousValue, value) {
      if(!this.has(property)) {
        this._previousValues[property] = previousValue;
      }
      this._values[property] = value;
    },
    
    get previousValues() {
      return this._previousValues;
    },
    
    get values() {
      return this._values;
    },
    
    get properties() {
      return Object.keys(this._previousValues);
    },

    getPreviousValue: function(property) {
      return this._previousValues[property];
    },

    getValue: function(property) {
      return this._values[property];
    }

    /*setPreviousValue: function(property, value) {
      if(this._previousValues[property] != null) {
        return;
      }
      this._previousValues[property] = value;
    },

    setValue: function(property, value) {
      this._values[property] = value;
    },*/
  });

});
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
  "./PrimitiveChange"
], function(PrimitiveChange) {
  "use strict";

  return PrimitiveChange.extend("pentaho.type.ValueChange", {

    constructor: function(owner, propertyName, valueSpec) {
      this.base(owner);

      this._propertyName = propertyName;
      this._oldValue = owner.get(propertyName);

      if(valueSpec) this.newValue = valueSpec;
    },

    type: "set",

    set: function(valueSpec){
      this.newValue = valueSpec;
    },

    set newValue(valueSpec) {
      this._newValue = this._oldValue ? this._oldValue.type.toValue(valueSpec) : valueSpec;
    },

    get newValue() {
      return this._newValue;
    },

    get oldValue() {
      return this._oldValue;
    },

    simulate: function(/* propertyValue */) {
      return this.newValue;
    },

    _commit: function() {
      var complex = this.owner;
      complex._values[this._propertyName] = this.newValue;
    }

  });
});

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

  return PrimitiveChange.extend("pentaho.type.RemoveChange", {

    constructor: function(changeset, elem, index) {
      this.base(changeset);

      this._index = index;
      this._element = elem;

      this._oldValue = null;
    },

    get newValue() {
      if(this._newValue) return this._newValue;

      this._newValue = this._apply(this.capture().clone());

      return this._newValue;
    },

    get oldValue() {
      return this._oldValue;
    },

    capture: function() {
      var owner = this.owner;

      this._oldValue = owner.applyUpTo(owner.oldValue.clone(), this);

      return this._oldValue;
    },

    apply: function() {
      this._apply(this.owner.list);
    },
    
    _apply: function(list) {
      list._elems.splice(this.index, 1);
      delete list._keys[this.key];
    }
  });
});


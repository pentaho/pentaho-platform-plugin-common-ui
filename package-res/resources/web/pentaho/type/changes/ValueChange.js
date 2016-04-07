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
  "./PropertyChange"
], function(PropertyChange) {
  "use strict";

  return PropertyChange.extend("pentaho.type.changes.ValueChange", /** @lends pentaho.type.changes.ValueChange# */{

    constructor: function(owner, propertyName, valueSpec) {
      this.base(owner);
      this._propertyName = propertyName;
      this._oldValue = owner.get(propertyName);
      this._pType = owner.type.get(propertyName);

      if(valueSpec !== undefined) this.set(valueSpec);
    },

    /**
     * @inheritdoc
     */
    get type() {
      return "set";
    },

    set: function(valueSpec) {
      this._newValue = this._pType.toValue(valueSpec);
    },

    simulate: function(/* propertyValue */) {
      return this.newValue;
    },

    _commit: function() {
      this.owner._values[this._propertyName] = this.newValue;
    }

  });
});

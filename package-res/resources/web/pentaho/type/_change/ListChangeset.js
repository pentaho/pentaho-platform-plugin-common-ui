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
  "./Changeset",
  "./AddChange",
  "./RemoveChange"
], function(Changeset, AddChange, RemoveChange) {
  "use strict";

  return Changeset.extend("pentaho.type.ListChangeset", {
    
    constructor: function(owner, propertyName, valueSpec) {
      this.base(owner);

      this._propertyName = propertyName;
      this._oldValue = this.owner.get(propertyName);

      this._changes = [];
      if(valueSpec) this.set(valueSpec);
    },

    get changes() {
      return this._changes;
    },

    //region public interface
    set newValue(valueSpec) {
      this.set(valueSpec);
    },

    /**
     * Computes the new value.
     * The value of the original property is not modified.
     *
     * @returns {*}
     */
    get newValue() {
      var newValue = this._newValue;
      if(newValue) return newValue;

      this._newValue = newValue = this.simulate(this.oldValue.clone());
      return newValue;
    },

    get oldValue() {
      return this._oldValue;
    },
    //endregion


    set: function(valueSpec) {
      //do list logic
    },
    
    simulate: function(propertyValue) {
      var changes = this.changes.slice();

      // Ignore changes until the last clear
      var idxLastClear = changes.reduce(function(memo, change, idx) {
        return change.type === "clear" ? idx : memo;
      }, undefined);
      changes = changes.slice(idxLastClear);

      // mutate list
      changes.forEach(function(change) {
        change.simulate(propertyValue);
      });

      return propertyValue;
    },

    _commit: function(){
      this.simulate(this._oldValue);
    }
  });
});

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
    
    constructor: function(owner, list) {
      this.base(owner);

      this._changes = [];
      this._list = list;

      this._oldValue = list.clone();
      
    },

    get list() {
      return this._list;
    },

    get changes() {
      return this._changes;
    },
    
    get oldValue() {
      return this._oldValue;
    },
    
    capture: function(index) {
      var change = this.changes[index];
      
      if(change) 
        return change.capture();
      else 
        return this.oldValue;
    },

    get newValue() {
      var changes = this.changes;
      var index = changes.length - 1;

      return changes[index].newValue;
    },
    
    set: function(valueSpec) {
      //do list logic
    },

    apply: function() {
      this.changes.forEach(function(change) {
        change.apply();
      });
    },

    applyUpTo: function() {

    }
  });
});

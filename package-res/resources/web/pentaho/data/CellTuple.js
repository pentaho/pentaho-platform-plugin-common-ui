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
  "./Cell",
  "./_WithStructure",
  "../lang/List"
], function(Cell, WithStructure, List) {

  var CellTuple = List.extend("pentaho.data.CellTuple", {

    constructor: function() {

      this.base();

      // Fill with null valued cells.
      var i = this.length;
      var SL = this.structure.length;
      while(i++ < SL) this.add(null);
    },

    // region IListElement
    elemName: "CellTuple",
    // endregion

    // region IWithKey implementation
    keyName:  "key",

    _key: null,

    get key() {
      var key = this._key;
      if(key == null) {
        key = this._key = this.map(function(cell) {
          return cell.key;
        }).join("~");
      }

      return key;
    },
    // endregion

    _label: null,

    get label() {
      var label = this._label;
      if(label == null) label = this._label = this.map(function(cell) { return cell.label; }).join("~");
      return label;
    },

    // region List implementation
    elemClass: Cell,

    _cast: function(spec, index) {
      var structPos = this.structure[index];
      if(!structPos) throw new Error("Cell tuple has out-of-bounds cells.");
      return structPos.attribute.toCellOf(spec);
    },
    // endregion

    // region IWithStructure implementation
    get structure() {
      throw new Error("abstract");
    },
    // endregion

    // region Collection-like methods
    has: function(attrName) {
      return this.get(attrName, false) != null;
    },

    get: function(attrName, assertExists) {
      var ordinal = this.structure.ordinalOf(attrName);
      if(ordinal >= 0) return this[ordinal];
      if(assertExists) throw new Error("A cell is not defined for attribute '" + attrName + "'.");
      return null;
    },

    getByOrdinalOrName: function(ordinalOrName, assertExists) {
      return typeof ordinalOrName === "string" ? this.get(ordinalOrName, assertExists) : this[ordinalOrName];
    },

    getExisting: function(attrName) {
      return this.get(attrName, true);
    },
    // endregion

    _onStructurePositionAdded: function() {
      this.add(null);
    }
  });

  // -------

  CellTuple.Adhoc = CellTuple.extend("pentaho.data.AdhocCellTuple", {
    constructor: function(keyArgs) {
      WithStructure.call(this, keyArgs);

      this.base();
    }
  })
  .implement(WithStructure);

  return CellTuple;
});

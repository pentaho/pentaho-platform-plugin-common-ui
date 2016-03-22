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
  "../Structure",
  "../../lang/Base",
  "../../util/arg"
], function(Structure, Base, arg) {

  var MeasureCellSet = Base.extend("pentaho.data._cross.MeasureCellSet", {

    // spec: [Array(Array(*))]
    // keyArgs: structure, [C: 0]
    constructor: function(spec, keyArgs) {
      this._structure = arg.required(keyArgs, "structure", "keyArgs");

      switch(this._structure.length) {
        case 0:
          this._cube = null;
          break;
        case 1:
          this._cube = new SingleMeasureCube(keyArgs);
          break;
        default:
          this._cube = new MultiMeasureCube(keyArgs);
          break;
      }

      if(spec) this._load(spec);
    },

    //region IWithStructure implementation
    get structure() {
      return this._structure;
    },
    //endregion

    get: function(r, c, m, preventCreate) {
      var attr = this._structure[m == null ? 0 : m].attribute;
      return this._cube.get(r, c, attr, preventCreate);
    },

    getByName: function(r, c, attrName, preventCreate) {
      var attr = this._structure.getExisting(attrName).attribute;
      return this._cube.get(r, c, attr, preventCreate);
    },

    getByAttribute: function(r, c, attr, preventCreate) {
      return this._cube.get(r, c, attr, preventCreate);
    },

    setByAttribute: function(r, c, attr, cellSpec) {
      return this._cube.setByAttribute(r, c, attr, cellSpec);
    },

    _load: function(cubeSpec) {
      var r = -1,
          R = cubeSpec.length,
          measAttrs = this._structure.toSpec({shareModel: true});
      while(++r < R) {
        var rowSpec = cubeSpec[r],
            c = -1,
            C = rowSpec.length;
        while(++c < C) {
          var measSpecs = rowSpec[c];
          if(measSpecs instanceof Array) {
            var k = -1,
                K = measSpecs.length;
            while(++k < K) this.set(r, c, measAttrs[k], measSpecs[k]);
          } else {
            this.set(r, c, measAttrs[0], measSpecs);
          }
        }
      }
    },

    _onColAdded: function() {
      if(this._cube) this._cube._onColAdded();
    }
  });

  // ------

  var MeasureCube = Base.extend("pentaho.data._cross.MeasureCube", {

    constructor: function (keyArgs) {
      // row -> col -> {<meaName>: cell, ...} (multiple measures)
      // row -> col -> cell (single measure)

      this._C = arg.optional(keyArgs, "C", 0);
      this._cube = [];
    },

    _getRow: function(r, preventCreate) {
      var cube = this._cube;
      return cube[r] || (preventCreate ? null : (cube[r] = new Array(this._C)));
    },

    _onColAdded: function() {
      this._C++;

      // Add one col to every row.
      var cube = this._cube,
          r = -1,
          R = cube.length;
      while(++r < R) cube[r].push(null);
    }
  });

  // ------

  var MultiMeasureCube = MeasureCube.extend("pentaho.data._cross.MultiMeasureCube", {

    constructor: function(keyArgs) {
      var structure = arg.required(keyArgs, "structure", "keyArgs");

      this.base(keyArgs);

      var measHolderBase = this._measHolderBase = {};
      structure.forEach(function(pos) { measHolderBase[pos.attribute.name] = null; });
    },

    get: function(r, c, attr, preventCreate) {
      var rowCol = this._getRowCol(r, c, preventCreate);
      if(!rowCol) return null;

      return rowCol[attr.name] ||
          (preventCreate ? null : (rowCol[attr.name] = attr.toCellOf(null)));
    },

    setByAttribute: function(r, c, attr, cellSpec) {
      var rowCol = this._getRowCol(r, c);
      return (rowCol[attr.name] = attr.toCellOf(cellSpec));
    },

    _getRowCol: function(r, c, preventCreate) {
      var row = this._getRow(r, preventCreate);
      if(!row) return null;

      var rowCol = row[c];
      if(!rowCol) {
        if(preventCreate) return null;

        row[c] = rowCol = Object.create(this._measHolderBase);
      }
      return rowCol;
    }
  });

  // -------

  var SingleMeasureCube = MeasureCube.extend("pentaho.data._cross.SingleMeasureCube", {

    get: function(r, c, attr, preventCreate) {
      var row = this._getRow(r, preventCreate);
      if(!row) return null;
      return row[c] || (preventCreate ? null : (row[c] = attr.toCellOf(null)));
    },

    setByAttribute: function(r, c, attr, cellSpec) {
      return (this._getRow(r)[c] = attr.toCellOf(cellSpec));
    }
  });

  // ------

  return MeasureCellSet;
});
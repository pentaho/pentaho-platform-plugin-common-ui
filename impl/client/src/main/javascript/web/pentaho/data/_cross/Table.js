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
  "./Axis",
  "./MeasureCellSet",
  "../../lang/Base",
  "../../util/arg",
  "../../util/error",
  "../../util/object"
], function(Structure, Axis, MeasureCellSet, Base, arg, error, O) {

  return Base.extend("pentaho.data._cross.Table", {
    // keyArgs: model
    constructor: function(spec, keyArgs) {
      /*
       * Measures in Columns format
       * --------------------------
       * {
       *   layout: {
       *       cols: [attrs],
       *       rows: [attrs],
       *       meas: [attrs]
       *   },
       *
       *   // cols and rows in MIC format
       *   cols: [],
       *   rows: []
       * }
       *
       * Cube format
       * -----------
       * (used for internal serialization)
       * {
       *   layout: {
       *       cols: [attr*],
       *       rows: [attr*],
       *       meas: [attr*]
       *   },
       *
       *   // axes
       *   cols: [axisPosition*],
       *   rows: [axisPosition*],
       *
       *   // "regular" measure cell set (with all combinations, null or not)
       *   meas: [
       *       [ ... ],
       *       ...
       *   ],
       *
       *   micCols: [
       *       {
       *          o: col-tuple-ordinal,
       *          a: mea-attribute-ordinal
       *       },
       *       ...
       *   ]
       * }
       */

      // Create layout/structure.
      var model = arg.required(keyArgs, "model", "keyArgs");
      var laySpec = arg.optional(spec, "layout");
      var ka = {model: model};
      var lay = {
            rows: Structure.to((laySpec && laySpec.rows) || [], ka),
            cols: Structure.to((laySpec && laySpec.cols) || [], ka),
            meas: Structure.to((laySpec && laySpec.meas) || [], ka)
          };

      this.model = model;
      this.layout = lay;

      // Properties for faster access.
      this._xR = lay.rows.length;
      this._xC = lay.cols.length;
      this._xM = lay.meas.length;

      // Create axes and measures.
      this.rows = Axis.to([], {structure: lay.rows});
      this.cols = Axis.to([], {structure: lay.cols});

      this._micColsIndex = {};

      // Created in #_loadDataXYZ, when the initial number of column axis' tuples is finally known.
      this.meas = null;

      // -------

      if(spec.meas)
        this._loadDataCube(spec);
      else
        this._loadDataMic(spec);
    },
    // region MIC - Measures In Columns - View

    // [
    //   // col tuple ordinal, measure attribute ordinal
    //   {o: 0, a: 1}
    // ]
    _micCols: null,

    // mic col key -> mic col index
    // mic col key: (col tuple ordinal|0) + "~" + (measure structure ordinal|-1)
    _micColsIndex: null,

    _getMicColKey: function(micCol) {
      if(this._xC) {
        var colTupleKey = this.cols[micCol.ordinal].key;
        return colTupleKey + (micCol.attribute ? ("~" + micCol.attribute.name) : "");
      }

      // assert micCol.attribute
      return micCol.attribute.name;
    },

    _getMicColLabel: function(micCol) {
      if(this._xC) {
        var colTupleLabel = this.cols[micCol.ordinal].cells.label;
        return colTupleLabel + (micCol.attribute ? ("~" + micCol.attribute.label) : "");
      }

      // assert micCol.attribute
      return micCol.attribute.label;
    },

    _setMicCol: function(k, colOrdinal, meaStructPos) {
      if(meaStructPos)
        this._setMicColCore(k, colOrdinal, meaStructPos.ordinal, meaStructPos.attribute);
      else
        this._setMicColCore(k, colOrdinal, -1, null);
    },

    _setMicColCore: function(k, colOrdinal, meaAttrOrdinal, meaAttr) {
      this._micColsIndex[colOrdinal + "~" + meaAttrOrdinal] = k;

      return (this._micCols[k] = {ordinal: colOrdinal, attrOrdinal: meaAttrOrdinal, attribute: meaAttr});
    },

    _hasMicCol: function(colOrdinal, meaStructPos) {
      if(colOrdinal == null) return false;

      var micKey = colOrdinal + "~" + (meaStructPos ? meaStructPos.ordinal : -1);

      return O.hasOwn(this._micColsIndex, micKey);
    },

    _buildFullMicView: function() {
      // Build a full-mic view.
      var c = this.cols.length;
      var xM = this._xM;

      if(xM) {
        var k = c * xM;
        var measStruct = this.layout.meas;

        this._micCols = new Array(k);

        // For each col tuple
        while(c--) {
          // For each measure attribute
          var m = xM;
          while(m--) this._setMicCol(--k, c, measStruct[m]);
        }
      } else {
        while(c--) this._setMicCol(c, c, null);
      }
    },
    // endregion

    // region LOAD Cube Format
    _loadDataCube: function(spec) {
      // assert spec.meas

      if(spec.rows) this.rows.addMany(spec.rows);
      if(spec.cols) this.cols.addMany(spec.cols);

      var measStruct = this.layout.meas;

      // Only now the number of column tuples is known.
      this.meas = new MeasureCellSet(spec.meas, {
        structure: measStruct,
        C: this.cols.length
      });

      var micColSpecs = spec.micCols;
      if(micColSpecs) {
        // TODO: Not validating received data...

        this._micCols = new Array(micColSpecs.length);

        var xM = measStruct.length;

        micColSpecs.forEach(function(micColSpec, k) {
          this._setMicCol(k, micColSpec.o, xM ? measStruct[micColSpec.a] : null);
        }, this);

      } else {
        this._buildFullMicView();
      }
    },
    // endregion

    // region LOAD MeasuresInColumns Format
    _loadDataMic: function(spec) {
      /* rawTable
       *                (>= xR)
       *                  [i]
       * |<-------------- rawC --------------->|
       *
       *    RowColumn          ColColumn
       * |<----------->|<--------------------->|
       *       xR                rawCC
       *                          [k]
       *
       *    {attr: ""}     {c: [], attr: ""}
       * +-------------+-----------------------+     ---
       * |             |                       |      ^
       * |             |                       |      |
       * |             |                       |      |  rawR [j]
       * |             |                       |      |
       * |             |                       |      v
       * +-------------+-----------------------+     ---
       */
      var rawCols = (spec && spec.cols) || [];
      var rawRows = (spec && spec.rows) || [];
      var rawC = rawCols.length;
      var rawR = rawRows.length;

      // Number of CrossColColumns.
      var rawCC = rawC - this._xR;

      if(rawCC < 0 && (this._xC || this._xM))
        throw error.argInvalid(
            "spec.cols",
            "As many columns as row attributes are required when there are measure and/or column attributes.");

      // 1. CrossRowColumn
      if(rawC && this._xR) this._processCrossRowColumns(rawCols);

      // 2. CrossColColumn
      if(rawCC > 0) { // rawCC can also be negative
        this._micCols = new Array(rawCC);

        // process Cross Col Columns
        var j = this._xR - 1;
        while(++j < rawC) this._addCrossCol(rawCols[j], j);

      } else {
        this._micCols = [];
      }

      // Only now we know the number of column tuples.
      // Rows are created on request, during #_processCrossRows.
      this.meas = new MeasureCellSet(null, {
          structure: this.layout.meas,
          C: this.cols.length
        });

      // 2. CrossRow
      if(rawR > 0 && (this._xR || this._xM))
        this._processCrossRows(rawRows);

    },

    _processCrossRowColumns: function(rawCols) {
      var rowsStruct = this.rows.structure;
      var j = Math.min(rawCols.length, this._xR); // rawC, rowsStruct.length
      while(j--) {
        // colSpec
        // * a string - the attribute name, or
        // * an object with an "attr" property (every other property is ignored)
        var colSpec = rawCols[j];
        var colAttr = rowsStruct[j].attribute;
        var attrName = (colSpec && typeof colSpec === "object") ? colSpec.attr : colSpec;

        // Validate attribute matches, if specified.
        if(attrName != null && attrName !== colAttr.name)
          throw new Error(
              "Invalid cross-table - attribute mismatch: '" + attrName + "'. " +
              "Expected: '" + colAttr.name + "'.");
      }
    },

    _addCrossCol: function(colSpec, j) {
      // This function's code could be written simpler,
      // if we'd sacrifice state consistency in face of validations failing mid-way...
      // For example, we could intern the column tuple up-front.
      if(colSpec == null) throw error.argRequired("cols[" + j + "]");

      var k = j - this._xR;
      var xC = this._xC;
      var xM = this._xM;

      // Validation, preparation

      // Get measure attribute name.
      var meaAttrName;
      if(xC) {
        if(typeof colSpec !== "object") throw error.argInvalidType("cols[" + j + "]", "object");

        meaAttrName = colSpec.attr;
      } else {
        if(!xM)
          throw error.argInvalid("cols[" + j + "]",
            "Cannot have cross-columns when there are no measure and no column attributes.");

        meaAttrName = (colSpec && typeof colSpec === "object") ? colSpec.attr : colSpec;
      }

      // assert xC || xM

      // Resolve measure attribute
      var meaStructPos;
      if(!xM) {
        if(meaAttrName != null)
          throw error.argInvalid("cols[" + j + "].attr", "Cannot be specified when there are no measures.");

        meaStructPos = null;
      } else if(meaAttrName == null) {
        if(xM > 1)
          throw error.argInvalid("cols[" + j + "].attr", "Required when there is more than one measure.");

        // Default to the single measure attribute
        meaStructPos = this.layout.meas[0];
      } else {
        // Asserts existence.
        meaStructPos = this.layout.meas.getExisting(meaAttrName);
      }

      var colOrdinal;
      var colCellTuple;
      if(xC) {
        colCellTuple = this.cols.toCellTuple(colSpec.c);

        // Is it an existing column tuple?
        var colAxisPos = this.cols.get(colCellTuple.key);
        if(colAxisPos) colOrdinal = colAxisPos.ordinal;
      } else {
        // The degenerate [] col cell-tuple is the only cell-tuple.
        colOrdinal = 0;
      }

      // Check for a duplicate column (same ordinal? and attrOrdinal?).
      if(this._hasMicCol(colOrdinal, meaStructPos))
        throw error.argInvalid("cols[" + j + "]", "Duplicate column cell tuple and measure attribute.");

      // Commit.

      // Create the column axis position, if necessary.
      if(xC) {
        if(colOrdinal == null) colOrdinal = this.cols.add(colCellTuple).ordinal;

      } else if(!k) {
        // The first k, 0, creates the degenerate [] col cell-tuple.
        this.cols.intern([]); // JIC
      }

      // Add the Mic column.
      return this._setMicCol(k, colOrdinal, meaStructPos);
    },

    // When there are measure attrs but no row attrs (xM && !xR),
    // there's still need for a cross "row" to be able to store the measures.
    // A dummy, empty row-cell-tuple is created to support that case.
    get _isDegenerateCrossRow() {
      return !this._xR && !!this._xM;
    },

    _processCrossRows: function(rawRows) {
      // assert xR || xM
      if(this._isDegenerateCrossRow) this.rows.intern([]);

      var i = -1;
      var rawR = rawRows.length;
      while(++i < rawR) this._addRow(rawRows[i], i);
    },

    _addRow: function(rowSpec, i) {
      if(!rowSpec) throw error.argRequired("rows[" + i + "]");

      // Obtain row cells
      var rawRowCellSpecs;
      if(rowSpec instanceof Array) {
        rawRowCellSpecs = rowSpec;
        // rowSpec = null;
      } else {
        rawRowCellSpecs = rowSpec.c;
        if(!(rawRowCellSpecs instanceof Array))
          throw error.argInvalid("rows[" + i + "].c", "Not an array.");
      }

      // Register row cells tuple
      var r;
      if(this._isDegenerateCrossRow) {
        // <=> !xR and xM
        r = 0;
      } else {
        // => xR
        // _Unshift_ the first xR cols of rawRowCellSpecs: the row axis' tuple cells.
        var rowCellSpecs = rawRowCellSpecs.splice(0, this._xR);

        // A duplicate row would result in an ordinal different from i.
        r = this.rows.intern(rowCellSpecs).ordinal;
      }

      if(i !== r)
        throw error.argInvalid("rows[" + i + "].c", "Duplicate row tuple.");

      // Process measures for any cross-col columns
      if(this._xM) {
        var micCols = this._micCols;
        if(micCols.length) { // rawCC
          var k = -1;
          var K = Math.min(micCols.length, rawRowCellSpecs.length);
          var meas = this.meas;
          var cellSpec;

          while(++k < K)
            if((cellSpec = rawRowCellSpecs[k]) != null)
              meas.setByAttribute(
                  r,
                  micCols[k].ordinal, // c
                  micCols[k].attribute,
                  cellSpec);

        }
      }
    },
    // endregion

    getCell: function(rowIndex, colIndex) {
      var k = colIndex - this._xR;
      // A cross-row cell-tuple value
      if(k < 0) return this.rows[rowIndex].cells[colIndex];

      // A cross-col measure value
      var micCol = this._micCols[k];
      return this.meas.getByAttribute(rowIndex, micCol.ordinal, micCol.attribute);
    },

    // region ITableReadOnly implementation
    getNumberOfColumns: function() {
      return this._xR + this._micCols.length;
    },

    getNumberOfRows: function() {
      return this.rows.length;
    },

    // columns
    getColumnAttribute: function(colIndex) {
      // A _cross-row column attribute or
      // a _cross-col column, measure attribute
      var k = colIndex - this._xR;
      return (k < 0)
          ? this.layout.rows[colIndex].attribute
          : this._micCols[k].attribute;
    },

    getColumnType: function(colIndexOrName) {
      var attr = this.getColumnAttribute(colIndexOrName);
      if(attr) return attr.type;
    },

    getColumnId: function(colIndex) {
      var k = colIndex - this._xR;
      return k < 0
          ? this.layout.rows[colIndex].attribute.name
          : this._getMicColKey(this._micCols[k]);
    },

    getColumnLabel: function(colIndex) {
      var k = colIndex - this._xR;
      return k < 0
          ? this.layout.rows[colIndex].attribute.label
          : this._getMicColLabel(this._micCols[k]);
    },

    // cells
    getValue: function(rowIndex, colIndex) {
      return this.getCell(rowIndex, colIndex).value;
    },

    getValueKey: function(rowIndex, colIndex) {
      return this.getCell(rowIndex, colIndex).key;
    },

    getFormattedValue: function(rowIndex, colIndex) {
      return this.getCell(rowIndex, colIndex).toString();
    },

    getLabel: function(rowIndex, colIndex) {
      return this.getCell(rowIndex, colIndex).label;
    },
    // endregion

    // region ITable
    addColumn: function(colSpec) {
      var colsAxis = this.cols;
      var C0 = colsAxis.length;
      var j = this.getNumberOfColumns();

      this._addCrossCol(colSpec, j);

      // If a new column axis tuple was added (due to a distinct colSpec.c),
      // then we need to notify the measures cell set.
      if(colsAxis.length > C0) this.meas._onColAdded();

      return j;
    },

    addRow: function(rowSpec) {
      var i = this.rows.length;

      this._addRow(rowSpec, i);

      return i;
    },
    // endregion

    // region ISpecifiable implementation
    toSpec: function(keyArgs) {
      var lay = this.layout;

      return {
        layout: {
          rows: lay.rows.toSpec(keyArgs),
          cols: lay.cols.toSpec(keyArgs),
          meas: lay.meas.toSpec(keyArgs)
        },

        rows: this.rows.toSpec(),
        cols: this.cols.toSpec(),
        meas: this.meas.toSpec(),

        micCols: this._micCols.map(function(micCol) {
          return {o: micCol.ordinal, a: micCol.attrOrdinal};
        })
      };
    },
    // endregion

    toSpecPlain: function(keyArgs) {
      // Assumes model is shared.

      // Columns are a linearization of the _cross layout (rows, cols, meas).
      var rowsAxis = this.rows;
      var colsAxis = this.cols;
      var meas = this.meas;
      var R = rowsAxis.length;
      var C = colsAxis.length;
      var R1 = Math.max(1, R);
      var C1 = Math.max(1, C);
      var xR = this._xR;
      var xC = this._xC;
      var xM = this._xM;
      var RC = xR + xC;
      var P = RC + xM; // === plainColSpecs.length
      var plainRowSpecs = [];
      var plainColSpecs = [].concat(
            rowsAxis.structure.toSpec(keyArgs),
            colsAxis.structure.toSpec(keyArgs),
            meas.structure.toSpec(keyArgs));
      var skipRowsWithAllNullMeasures = xM > 0 && !!O.getOwn(keyArgs, "skipRowsWithAllNullMeasures");
      var r = -1;

      while(++r < R1) {
        var rowPosCells = R ? rowsAxis[r].cells : null;
        var c = -1;

        while(++c < C1) {
          var plainRowCellSpecs = new Array(P);
          var colPosCells;
          var k;

          if(R) {
            k = xR;
            while(k--) plainRowCellSpecs[k] = rowPosCells[k].toSpec();
          }

          if(C) {
            k = xC;
            colPosCells = colsAxis[c].cells;
            while(k--) plainRowCellSpecs[xR + k] = colPosCells[k].toSpec();
          }

          k = xM;
          var isAllNullMeasures = skipRowsWithAllNullMeasures;
          while(k--) {
            var cell = meas.get(r, c, k, true);
            var value = cell && cell.toSpec();

            if(isAllNullMeasures && value !== null) {
              isAllNullMeasures = false;
            }

            plainRowCellSpecs[RC + k] = value;
          }

          if(!isAllNullMeasures) {
            plainRowSpecs.push({c: plainRowCellSpecs});
          }
        }
      }

      return {
        cols: plainColSpecs,
        rows: plainRowSpecs
      };
    }
  });
});

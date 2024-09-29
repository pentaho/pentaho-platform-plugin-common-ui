/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "./CellTuple",
  "../lang/Base",
  "../util/error",
  "../util/object"
], function(CellTuple, Base, error, O) {

  return Base.extend("pentaho.data._WithCellTupleBase", {
    // keyArgs: structure
    constructor: function(keyArgs) {
      this.cellTupleBase = CellTuple.Adhoc.to([], keyArgs);

      // Rhino complains that `constructor` is a read-only property,
      // if we set this.cellTupleBase.constructor directly.
      // However, per the above call, from Class.to, and then to pentaho.util.Object.applyClass,
      // it is a writable property. This is probably a Rhino bug.
      // Anyway, this goes around that by redefining the property.
      Object.defineProperty(this.cellTupleBase, "constructor", {
        // enumerable: false,
        configurable: true,
        writable: true,
        value: CellTuple.Adhoc
      });
    },

    // keyArgs: {}
    toCellTuple: function(cellSpecs, keyArgs) {
      if(cellSpecs instanceof CellTuple)
        return cellSpecs;

      if(!(cellSpecs instanceof Array))
        throw error.argInvalidType("cellSpecs", "Array");

      var cellTuple = O.setPrototypeOf(cellSpecs, this.cellTupleBase);
      CellTuple.call(cellTuple, keyArgs);
      return cellTuple;
    }
  });
});

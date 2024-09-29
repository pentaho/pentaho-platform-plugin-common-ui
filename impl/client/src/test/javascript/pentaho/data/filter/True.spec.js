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
  "pentaho/type/Complex",
  "pentaho/data/filter/True",
  "pentaho/data/filter/False"
], function(Complex, TrueFilter, FalseFilter) {

  "use strict";

  describe("pentaho.data.filter.True", function() {

    var ProductSummary;

    beforeAll(function() {
      ProductSummary = Complex.extend({
        $type: {
          props: [
            {name: "name", valueType: "string", label: "Name"},
            {name: "sales", valueType: "number", label: "Sales"},
            {name: "inStock", valueType: "boolean", label: "In Stock"}
          ]
        }
      });
    });

    describe("#kind", function() {

      it("should return 'true'", function() {
        var filter = new TrueFilter();
        expect(filter.kind).toBe("true");
      });
    });

    describe("#contains(elem)", function() {

      it("should return `true` for any element", function() {

        var filter  = new TrueFilter();

        var elem = new ProductSummary({name: "A", sales: 12000, inStock: true});
        var result = filter.contains(elem);

        expect(result).toBe(true);

        // ---

        elem = new ProductSummary({name: "B", sales: 0, inStock: false});
        result = filter.contains(elem);

        expect(result).toBe(true);
      });
    }); // #contains

    describe("#negate()", function() {
      it("should return a `False` filter", function() {
        var filter = new TrueFilter();

        var invFilter = filter.negate();

        expect(invFilter instanceof FalseFilter);
      });
    }); // #negate

    describe("#toSpec", function() {
      var filter;

      beforeEach(function() {
        filter = new TrueFilter();
      });

      describe("when invoked without keyword arguments", function() {
        var filterSpec;

        beforeEach(function() {
          filterSpec = filter.toSpec();
        });

        it("should omit the type", function() {
          expect(filterSpec._).toBeUndefined();
        });
      });

      describe("when invoked with the keyword argument `forceType` set to `true`", function() {
        it("should specify the type by the #alias", function() {

          var filterSpec = filter.toSpec({
            forceType: true
          });

          expect(filterSpec._).toBe("true");
        });

        it("should specify the type by the #id when the `noAlias` option is additionally specified", function() {

          var filterSpec = filter.toSpec({
            forceType: true,
            noAlias: true
          });

          expect(filterSpec._).toBe("pentaho/data/filter/True");
        });
      });
    }); // #toSpec

    describe("#contentKey", function() {

      it("should return '(true)'", function() {
        var filter  = new TrueFilter();

        expect(filter.$contentKey).toBe("(true)");
      });
    });
  }); // pentaho.data.filter.True
});

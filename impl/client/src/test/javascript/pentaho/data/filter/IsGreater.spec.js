/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/

define([
  "pentaho/type/Complex",
  "pentaho/data/filter/IsGreater",
  "./propertyUtils"
], function(Complex, IsGreaterFilter, propertyUtils) {

  "use strict";

  describe("pentaho.data.filter.IsGreater", function() {

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

    propertyUtils.behavesLikeProperty(function() { return IsGreaterFilter; }, {
      valueType: "number",
      rawValue: 42,
      kind: "isGreater",
      id: "IsGreater",
      alias: ">"
    });

    describe("#contains(elem)", function() {

      var elem;

      beforeEach(function() {

        elem = new ProductSummary({name: "A", sales: 12000, inStock: true});
      });

      it("should return `true` if `elem` has property `property` with a value > `value`", function() {

        var filter  = new IsGreaterFilter({property: "sales", value: {_: "number", v: 13000}});

        var result = filter.contains(elem);

        expect(result).toBe(true);
      });

      it("should return `false` if `elem` does not have property `property`", function() {

        var filter  = new IsGreaterFilter({property: "foo", value: {_: "number", v: 12000}});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should return `false` if `elem` has property `property` with a value = `value`", function() {

        var filter  = new IsGreaterFilter({property: "foo", value: {_: "number", v: 12000}});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should return `false` if `elem` has property `property` with a value < `value`", function() {

        var filter  = new IsGreaterFilter({property: "foo", value: {_: "number", v: 11000}});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });
    }); // #contains

    describe("#contentKey", function() {

      it("should return '(> propName valueKey)'", function() {
        var filter  = new IsGreaterFilter({property: "name", value: 1});

        expect(filter.$contentKey).toBe("(> name 1)");
      });

      it("should return '(> propName )' when no value is set'", function() {
        var filter  = new IsGreaterFilter({property: "name"});

        expect(filter.$contentKey).toBe("(> name )");
      });

      it("should return '(>  valueKey)' when no property is set'", function() {
        var filter  = new IsGreaterFilter({value: 1});

        expect(filter.$contentKey).toBe("(>  1)");
      });

      it("should return '(>  )' when no property or value are set'", function() {
        var filter  = new IsGreaterFilter();

        expect(filter.$contentKey).toBe("(>  )");
      });
    });
  }); // end pentaho.data.filter.IsGreater
});

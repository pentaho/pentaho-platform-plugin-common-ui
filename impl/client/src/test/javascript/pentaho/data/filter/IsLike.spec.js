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
  "pentaho/data/filter/IsLike",
  "pentaho/type/Complex",
  "./propertyUtils"
], function(IsLikeFilter, Complex, propertyUtils) {

  "use strict";

  describe("pentaho.data.filter.IsLike", function() {

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

    propertyUtils.behavesLikeProperty(function() { return IsLikeFilter; }, {
      valueType: "string",
      rawValue: "match",
      kind: "isLike",
      id: "IsLike",
      alias: "like"
    });

    describe("#contains(elem)", function() {

      var elem;

      beforeEach(function() {
        elem = new ProductSummary({name: {v: "acme", f: "test"}, sales: 12000, inStock: true});
      });

      it("should return `true` if `elem` has property `property` " +
        "with a value matching an affix of `value`", function() {

        var filter  = new IsLikeFilter({
          property: "name",
          value: "es",
          anchorStart: false,
          anchorEnd: false,
          isCaseInsensitive: false
        });

        var filterDefaultValues = new IsLikeFilter({property: "name", value: "es"});

        var result = filter.contains(elem);
        var resultDefaultValues = filterDefaultValues.contains(elem);

        expect(result).toBe(true);
        expect(resultDefaultValues).toBe(true);
      });

      it("should return `false` if `elem` does not have property `property`", function() {

        var filter  = new IsLikeFilter({property: "foo", value: "match"});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should return `true` if `elem` has property `property` " +
        "with a value matching a prefix of `value`", function() {

        var filter  = new IsLikeFilter({
          property: "name",
          value: "tes",
          anchorStart: true,
          anchorEnd: false,
          isCaseInsensitive: false
        });
        var negFilter = new IsLikeFilter({
          property: "name",
          value: "es",
          anchorStart: true,
          anchorEnd: false,
          isCaseInsensitive: false
        });

        var result = filter.contains(elem);
        var negResult = negFilter.contains(elem);

        expect(result).toBe(true);
        expect(negResult).toBe(false);
      });

      it("should return `true` if `elem` has property `property` " +
        "with a value matching a suffix of `value`", function() {

        var filter  = new IsLikeFilter({
          property: "name",
          value: "est",
          anchorStart: false,
          anchorEnd: true,
          isCaseInsensitive: false
        });
        var negFilter = new IsLikeFilter({
          property: "name",
          value: "es",
          anchorStart: false,
          anchorEnd: true,
          isCaseInsensitive: false
        });

        var result = filter.contains(elem);
        var negResult = negFilter.contains(elem);

        expect(result).toBe(true);
        expect(negResult).toBe(false);
      });

      it("should return `true` if `elem` has property `property` with a value exactly matching `value`", function() {

        var filter  = new IsLikeFilter({
          property: "name",
          value: "test",
          anchorStart: true,
          anchorEnd: true,
          isCaseInsensitive: false
        });
        var negFilter = new IsLikeFilter({
          property: "name",
          value: "tes",
          anchorStart: true,
          anchorEnd: true,
          isCaseInsensitive: false
        });
        var negFilter2 = new IsLikeFilter({
          property: "name",
          value: "est",
          anchorStart: true,
          anchorEnd: true,
          isCaseInsensitive: false
        });

        var result = filter.contains(elem);
        var negResult = negFilter.contains(elem);
        var negResult2 = negFilter2.contains(elem);

        expect(result).toBe(true);
        expect(negResult).toBe(false);
        expect(negResult2).toBe(false);
      });

      it("should return `true` if `elem` has property `property` with " +
        "a value matching `value` including case sensitivity", function() {
        var filter  = new IsLikeFilter({
          property: "name",
          value: "test",
          anchorStart: true,
          anchorEnd: true,
          isCaseInsensitive: false
        });

        var result = filter.contains(elem);

        expect(result).toBe(true);
      });

      it("should return `false` if `elem` has property `property` with " +
        "a value matching `value` including case sensitivity", function() {
        var filter  = new IsLikeFilter({
          property: "name",
          value: "TEST",
          anchorStart: true,
          anchorEnd: true,
          isCaseInsensitive: false
        });

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should return `true` if `elem` has property `property` with " +
        "a value matching `value` excluding case sensitivity", function() {
        var filter  = new IsLikeFilter({
          property: "name",
          value: "TEST",
          anchorStart: true,
          anchorEnd: true,
          isCaseInsensitive: true
        });

        var result = filter.contains(elem);

        expect(result).toBe(true);
      });
    }); // #contains

    describe("#contentKey", function() {

      it("should return '(like propName valueKey anchorS anchorE caseI)'", function() {
        var filter  = new IsLikeFilter({property: "name", value: "str"});
        var anotherFilter = new IsLikeFilter({
          property: "name",
          value: "str",
          anchorStart: true,
          anchorEnd: true,
          isCaseInsensitive: false
        });

        expect(filter.$contentKey).toBe("(like name str false false false)");
        expect(anotherFilter.$contentKey).toBe("(like name str true true false)");
      });

      it("should return '(like propName  false false false)' when no value is set'", function() {
        var filter  = new IsLikeFilter({property: "name"});

        expect(filter.$contentKey).toBe("(like name  false false false)");
      });

      it("should return '(like  valueKey false false false)' when no property is set'", function() {
        var filter  = new IsLikeFilter({value: "str"});

        expect(filter.$contentKey).toBe("(like  str false false false)");
      });

      it("should return '(like   false false false)' when no property or value are set'", function() {
        var filter  = new IsLikeFilter();

        expect(filter.$contentKey).toBe("(like   false false false)");
      });
    });
  });
});

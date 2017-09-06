/*!
 * Copyright 2017 Pentaho Corporation.  All rights reserved.
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
  "pentaho/data/filter/isLike",
  "pentaho/type/Context",
  "pentaho/type/complex",
  "./propertyUtils"
], function(isLikeFactory, Context, complexFactory, propertyUtils) {

  "use strict";

  describe("pentaho.data.filter.IsLike", function() {

    var context;
    var Complex;
    var IsLikeFilter;
    var ProductSummary;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {

            context = _context;
            Complex = context.get("complex");

            ProductSummary = Complex.extend({
              $type: {
                props: [
                  {name: "name", valueType: "string", label: "Name"},
                  {name: "sales", valueType: "number", label: "Sales"},
                  {name: "inStock", valueType: "boolean", label: "In Stock"}
                ]
              }
            });

            return context.getDependencyApplyAsync([
              "pentaho/data/filter/isLike"
            ], function(IsLike) {
              IsLikeFilter = IsLike;
            });
          })
          .then(done, done.fail);
    });

    propertyUtils.behavesLikeProperty(function() { return IsLikeFilter; }, {
      valueType: "string",
      rawValue: "match",
      kind: "isLike",
      alias: "like"
    });

    describe("#contains(elem)", function() {

      var elem;

      beforeEach(function() {
        elem = new ProductSummary({name: {v: "acme", f: "test"}, sales: 12000, inStock: true});
      });

      it("should return `true` if `elem` has property `property` with a value matching an affix of `value`", function() {

        var filter  = new IsLikeFilter({property: "name", value: "es", anchorStart: false, anchorEnd: false});
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

      it("should return `true` if `elem` has property `property` with a value matching a prefix of `value`", function() {

        var filter  = new IsLikeFilter({property: "name", value: "tes", anchorStart: true, anchorEnd: false});
        var negFilter = new IsLikeFilter({property: "name", value: "es", anchorStart: true, anchorEnd: false});

        var result = filter.contains(elem);
        var negResult = negFilter.contains(elem);

        expect(result).toBe(true);
        expect(negResult).toBe(false);
      });

      it("should return `true` if `elem` has property `property` with a value matching a suffix of `value`", function() {

        var filter  = new IsLikeFilter({property: "name", value: "est", anchorStart:false, anchorEnd: true});
        var negFilter = new IsLikeFilter({property: "name", value: "es", anchorStart: false, anchorEnd: true});

        var result = filter.contains(elem);
        var negResult = negFilter.contains(elem);

        expect(result).toBe(true);
        expect(negResult).toBe(false);
      });

      it("should return `true` if `elem` has property `property` with a value exactly matching `value`", function() {

        var filter  = new IsLikeFilter({property: "name", value: "test", anchorStart:true, anchorEnd: true});
        var negFilter = new IsLikeFilter({property: "name", value: "tes", anchorStart: true, anchorEnd: true});
        var negFilter2 = new IsLikeFilter({property: "name", value: "est", anchorStart: true, anchorEnd: true});

        var result = filter.contains(elem);
        var negResult = negFilter.contains(elem);
        var negResult2 = negFilter2.contains(elem);

        expect(result).toBe(true);
        expect(negResult).toBe(false);
        expect(negResult2).toBe(false);
      });
    }); // #contains

    describe("#contentKey", function() {

      it("should return '(like propName valueKey anchorS anchorE)'", function() {
        var filter  = new IsLikeFilter({property: "name", value: "str"});
        var anotherFilter = new IsLikeFilter({property: "name", value: "str", anchorStart: true, anchorEnd: true});

        expect(filter.contentKey).toBe("(like name str false false)");
        expect(anotherFilter.contentKey).toBe("(like name str true true)");
      });

      it("should return '(like propName  false false)' when no value is set'", function() {
        var filter  = new IsLikeFilter({property: "name"});

        expect(filter.contentKey).toBe("(like name  false false)");
      });

      it("should return '(like  valueKey false false)' when no property is set'", function() {
        var filter  = new IsLikeFilter({value: "str"});

        expect(filter.contentKey).toBe("(like  str false false)");
      });

      it("should return '(like   false false)' when no property or value are set'", function() {
        var filter  = new IsLikeFilter();

        expect(filter.contentKey).toBe("(like   false false)");
      });
    });
  }); // pentaho.data.filter.IsLike
});

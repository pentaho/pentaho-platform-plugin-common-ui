/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/filter/true",
  "pentaho/type/filter/false",
  "pentaho/type/Context",
  "pentaho/type/complex"
], function(trueFactory, falseFactory, Context, complexFactory) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.filter.True", function() {

    var context = new Context();
    var TrueFilter = context.get(trueFactory);
    var FalseFilter = context.get(falseFactory);
    var Complex = context.get(complexFactory);

    var ProductSummary = Complex.extend({
      type: {
        props: [
          {name: "name", type: "string", label: "Name"},
          {name: "sales", type: "number", label: "Sales"},
          {name: "inStock", type: "boolean", label: "In Stock"}
        ]
      }
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

          expect(filterSpec._).toBe("pentaho/type/filter/true");
        });
      });
    }); // #toSpec

    describe("#contentKey", function() {

      it("should return '(true)'", function() {
        var filter  = new TrueFilter();

        expect(filter.contentKey).toBe("(true)");
      });
    });
  }); // pentaho.type.filter.True
});

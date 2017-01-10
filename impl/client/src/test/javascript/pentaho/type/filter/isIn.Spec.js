/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/filter/isIn",
  "pentaho/type/Context",
  "pentaho/type/complex"
], function(isInFactory, Context, complexFactory) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.filter.IsIn", function() {

    var context = new Context();
    var IsInFilter = context.get(isInFactory);
    var Complex = context.get(complexFactory);

    var ProductSummary = Complex.extend({
      type: {
        props: [
          {name: "name",    type: "string",  label: "Name"    },
          {name: "sales",   type: "number",  label: "Sales"   },
          {name: "inStock", type: "boolean", label: "In Stock"}
        ]
      }
    });

    describe("new ({property, values})", function() {

      it("should be possible to create an instance", function() {

        var filter = new IsInFilter({property: "foo", values: [{_: "string", v: "bar"}]});

        expect(filter instanceof IsInFilter).toBe(true);
      });
    });

    describe("#kind", function() {

      it("should return 'isIn'", function() {
        var filter  = new IsInFilter();
        expect(filter.kind).toBe("isIn");
      });
    });

    describe("#property", function() {

      it("should return the property name specified at construction", function() {

        var filter = new IsInFilter({property: "foo"});

        expect(filter.property).toBe("foo");
      });
    }); //#property

    describe("#values", function() {

      it("should return a values list with the values specified at construction", function() {

        var filter = new IsInFilter({values: [{_: "string", v: "bar"}, {_: "string", v: "foo"}]});

        var values = filter.values;
        expect(values.count).toBe(2);
        expect(values.at(0).value).toBe("bar");
        expect(values.at(1).value).toBe("foo");
      });
    }); //#values

    describe("#contains(elem)", function() {

      var elem = new ProductSummary({name: "A", sales: 12000, inStock: true});

      it("should return `true` if `elem` has property `property` whose value is one of `values`", function() {

        var filter  = new IsInFilter({
          property: "sales",
          values: [
            {_: "number", v: 14000},
            {_: "number", v: 12000}
          ]
        });

        var result = filter.contains(elem);

        expect(result).toBe(true);
      });

      it("should return `false` if `elem` does not have property `property`", function() {

        var filter  = new IsInFilter({
          property: "foo",
          values: [
            {_: "number", v: 14000},
            {_: "number", v: 12000}
          ]
        });

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should return `false` if `elem` has property `property` and `values` is empty", function() {

        var filter  = new IsInFilter({property: "sales"});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should return `false` if `elem` has property `property` and its value is not in `values`", function() {

        var filter  = new IsInFilter({
          property: "sales",
          values: [
            {_: "number", v: 14000},
            {_: "number", v: 13000}
          ]
        });

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should return `false` if `elem` has property `property` with a null value", function() {

        var elem = new ProductSummary({name: "A"});

        var filter  = new IsInFilter({
          property: "sales",
          values: [
            {_: "number", v: 14000},
            {_: "number", v: 12000}
          ]
        });

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });
    }); // #contains
  }); // pentaho.type.filter.IsIn
});
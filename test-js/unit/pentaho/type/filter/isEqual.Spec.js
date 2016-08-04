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
  "pentaho/type/filter/isEqual",
  "pentaho/type/Context",
  "pentaho/type/complex"
], function(isEqualFactory, Context, complexFactory) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.filter.IsEqual", function() {

    var context = new Context();
    var IsEqualFilter = context.get(isEqualFactory);
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

    describe("new ({property, value})", function() {

      it("should be possible to create an instance", function() {

        var filter = new IsEqualFilter({property: "foo", value: {_: "string", v: "bar"}});

        expect(filter instanceof IsEqualFilter).toBe(true);
      });
    });

    describe("#kind", function() {

      it("should return 'isEqual'", function() {
        var filter  = new IsEqualFilter();
        expect(filter.kind).toBe("isEqual");
      });
    });

    describe("#property", function() {

      it("should return the property name specified at construction", function() {

        var filter = new IsEqualFilter({property: "foo"});

        expect(filter.property).toBe("foo");
      });
    }); //#property

    describe("#value", function() {

      it("should return the value specified at construction", function() {

        var filter = new IsEqualFilter({value: {_: "string", v: "bar"}});

        expect(filter.value).toBe("bar");
      });
    }); //#value

    describe("#contains(elem)", function() {

      var elem = new ProductSummary({name: "A", sales: 12000, inStock: true});

      it("should return `true` if `elem` has property `property` with a value = `value`", function() {

        var filter  = new IsEqualFilter({property: "sales", value: {_: "number", v: 12000}});

        var result = filter.contains(elem);

        expect(result).toBe(true);
      });

      it("should return `false` if `elem` does not have property `property`", function() {

        var filter  = new IsEqualFilter({property: "foo", value: {_: "number", v: 12000}});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should return `false` if `elem` has property `property` with a value != `value`", function() {

        var filter  = new IsEqualFilter({property: "foo", value: {_: "number", v: 24000}});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });
    }); // #contains
  }); // pentaho.type.filter.IsEqual
});
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
          {name: "name", valueType: "string", label: "Name"},
          {name: "sales", valueType: "number", label: "Sales"},
          {name: "inStock", valueType: "boolean", label: "In Stock"}
        ]
      }
    });

    describe("new ({property, value})", function() {

      it("should be possible to create an instance " +
        "by specifying the properties by #name and value specification", function() {

        var filter = new IsEqualFilter({property: "foo", value: {_: "string", v: "bar"}});

        expect(filter instanceof IsEqualFilter).toBe(true);
      });

      it("should be possible to create an instance " +
        "by specifying the properties by #nameAlias and value specification", function() {

        var filter = new IsEqualFilter({p: "foo", v: {_: "string", v: "bar"}});

        expect(filter instanceof IsEqualFilter).toBe(true);
      });

      it("should be possible to create an instance by specifying the properties by #nameAlias and value", function() {

        var filter = new IsEqualFilter({p: "foo", v: "bar"});

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

      it("should return the property name specified at construction via #nameAlias", function() {

        var filter = new IsEqualFilter({p: "foo"});

        expect(filter.property).toBe("foo");
      });
    }); // #property

    describe("#toSpec", function() {
      var filter;

      beforeEach(function() {
        filter = new IsEqualFilter({property: "foo", value: {_: "string", v: "bar"}});
      });

      describe("when invoked without keyword arguments", function() {
        var filterSpec;

        beforeEach(function() {
          filterSpec = filter.toSpec();
        });

        it("should omit the type", function() {
          expect(filterSpec._).toBeUndefined();
        });

        it("should specify the properties by their #nameAlias instead of their #name", function() {

          expect(filterSpec.p).toBe("foo");
          expect(filterSpec.v).toBe("bar");
          expect(filterSpec.property).toBeUndefined();
          expect(filterSpec.value).toBeUndefined();
        });

        describe("when the value has a formatted value", function() {
          it("should output the value's inline type", function() {
            var filter = new IsEqualFilter({property: "foo", value: {_: "string", v: "bar", f: "Bar"}});
            var filterSpec = filter.toSpec();
            expect(filterSpec.p).toBe("foo");
            expect(filterSpec.v).toEqual({_: "string", v: "bar", f: "Bar"});
            expect(filterSpec.property).toBeUndefined();
            expect(filterSpec.value).toBeUndefined();
          });
        });
      });

      describe("when invoked with the keyword argument `noAlias` set to `true`", function() {
        it("should specify the properties by their #name", function() {

          var filterSpec = filter.toSpec({
            noAlias: true
          });

          expect(filterSpec._).toBeUndefined();

          expect(filterSpec.p).toBeUndefined();
          expect(filterSpec.v).toBeUndefined();

          expect(filterSpec.property).toBe("foo");
          expect(filterSpec.value).toBe("bar");
        });
      });

      describe("when invoked with the keyword argument `forceType` set to `true`", function() {
        it("should specify the type by the #alias", function() {

          var filterSpec = filter.toSpec({
            forceType: true
          });

          expect(filterSpec._).toBe("=");
        });

        it("should specify the type by the #id when the `noAlias` option is additionally specified", function() {

          var filterSpec = filter.toSpec({
            forceType: true,
            noAlias: true
          });

          expect(filterSpec._).toBe("pentaho/type/filter/isEqual");
        });
      });

    }); // #toSpec

    describe("#value", function() {

      it("should return the value specified at construction", function() {

        var filter = new IsEqualFilter({value: {_: "string", v: "bar"}});

        expect(filter.value).toBe("bar");
      });

      it("should return the value specified at construction via #nameAlias", function() {

        var filter = new IsEqualFilter({v: {_: "string", v: "bar"}});

        expect(filter.value).toBe("bar");
      });
    }); // #value

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

    describe("#contentKey", function() {

      it("should return '(= propName valueKey)'", function() {
        var filter  = new IsEqualFilter({property: "name", value: 1});

        expect(filter.contentKey).toBe("(= name 1)");
      });

      it("should return '(= propName ) when no value is set'", function() {
        var filter  = new IsEqualFilter({property: "name"});

        expect(filter.contentKey).toBe("(= name )");
      });

      it("should return '(=  valueKey) when no property is set'", function() {
        var filter  = new IsEqualFilter({value: 1});

        expect(filter.contentKey).toBe("(=  1)");
      });

      it("should return '(=  ) when no property or value are set'", function() {
        var filter  = new IsEqualFilter();

        expect(filter.contentKey).toBe("(=  )");
      });
    });
  }); // pentaho.type.filter.IsEqual
});

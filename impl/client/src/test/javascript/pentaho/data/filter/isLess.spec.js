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
  "pentaho/data/filter/isLess",
  "pentaho/type/Context",
  "pentaho/type/complex",
  "./propertyUtils"
], function(isLessFactory, Context, complexFactory, propertyUtils) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true */

  describe("pentaho.data.filter.IsLess", function() {

    var context = new Context();
    var IsLessFilter = context.get(isLessFactory);
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

    propertyUtils.behavesLikeProperty(IsLessFilter, {
      valueType: "number",
      rawValue: 42,
      kind: "isLess",
      alias: "<"
    });

    describe("#contains(elem)", function() {

      var elem = new ProductSummary({name: "A", sales: 12000, inStock: true});

      it("should return `false` if `elem` has property `property` with a value > `value`", function() {

        var filter  = new IsLessFilter({property: "sales", value: {_: "number", v: 13000}});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should return `false` if `elem` does not have property `property`", function() {

        var filter  = new IsLessFilter({property: "foo", value: {_: "number", v: 12000}});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should return `false` if `elem` has property `property` with a value = `value`", function() {

        var filter  = new IsLessFilter({property: "sales", value: {_: "number", v: 12000}});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should return `true` if `elem` has property `property` with a value < `value`", function() {

        var filter  = new IsLessFilter({property: "sales", value: {_: "number", v: 11000}});

        var result = filter.contains(elem);

        expect(result).toBe(true);
      });
    }); // #contains

    describe("#contentKey", function() {

      it("should return '(< propName valueKey)'", function() {
        var filter  = new IsLessFilter({property: "name", value: 1});

        expect(filter.contentKey).toBe("(< name 1)");
      });

      it("should return '(< propName )' when no value is set'", function() {
        var filter  = new IsLessFilter({property: "name"});

        expect(filter.contentKey).toBe("(< name )");
      });

      it("should return '(<  valueKey)' when no property is set'", function() {
        var filter  = new IsLessFilter({value: 1});

        expect(filter.contentKey).toBe("(<  1)");
      });

      it("should return '(<  )' when no property or value are set'", function() {
        var filter  = new IsLessFilter();

        expect(filter.contentKey).toBe("(<  )");
      });
    });
  }); // pentaho.data.filter.IsLess
});

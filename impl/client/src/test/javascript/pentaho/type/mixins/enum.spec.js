/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/Context",
  "pentaho/type/SpecificationScope",
  "tests/pentaho/util/errorMatch"
], function(Context, SpecificationScope, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context();
  var List = context.get("pentaho/type/list");
  var PentahoNumber = context.get("pentaho/type/number");
  var PentahoString = context.get("pentaho/type/string");
  var Enum = context.get("pentaho/type/mixins/enum");

  describe("pentaho.type.mixins.Enum", function() {

    it("should be a function", function() {
      expect(typeof Enum).toBe("function");
    });

    describe(".extend", function() {
      it("should throw if extended", function() {

        var MyNumber = PentahoNumber.extend({
          type: {
            mixins: [Enum],
            domain: [1, 2, 3]
          }
        });

        expect(function() {
          MyNumber.extend();
        }).toThrow(errorMatch.operInvalid());
      });
    });

    describe("#domain -", function() {

      it("should throw if given default null `domain`", function() {

        expect(function() {
          PentahoNumber.extend({
            type: {
              mixins: [Enum]
            }
          });
        }).toThrow(errorMatch.argRequired("spec.domain"));
      });

      it("should respect the specified domain", function() {

        var MyNumber = PentahoNumber.extend({
          type: {
            mixins: [Enum],
            domain: [1, 2, 3]
          }
        });

        var domain = MyNumber.type.domain;
        expect(domain instanceof List).toBe(true);
        expect(domain.count).toBe(3);

        expect(domain.at(0) instanceof PentahoNumber).toBe(true);
        expect(domain.at(1) instanceof PentahoNumber).toBe(true);
        expect(domain.at(2) instanceof PentahoNumber).toBe(true);

        expect(domain.at(0).value).toBe(1);
        expect(domain.at(1).value).toBe(2);
        expect(domain.at(2).value).toBe(3);
      });

      it("should throw when set to nully after initialization", function() {

        function expectIt(newDomain) {
          var MyNumber = PentahoNumber.extend({
            type: {
              mixins: Enum,
              domain: [1, 2, 3]
            }
          });

          var domain = MyNumber.type.domain;
          expect(domain instanceof List).toBe(true);
          expect(domain.count).toBe(3);

          expect(function() {
            MyNumber.type.domain = newDomain;
          }).toThrow(errorMatch.argRequired("domain"));

          expect(MyNumber.type.domain).toBe(domain);
          expect(domain.count).toBe(3);
        }

        expectIt(null);
        expectIt(undefined);
      });

      it("should allow setting to an object after initialization, for configuration", function() {

        var MyNumber = PentahoNumber.extend({
          type: {
            mixins: Enum,
            domain: [1, 2, 3]
          }
        });

        var domain = MyNumber.type.domain;

        expect(domain.at(0).formatted).toBe(null);
        expect(domain.at(1).formatted).toBe(null);
        expect(domain.at(2).formatted).toBe(null);

        MyNumber.type.domain = {
          "1": {f: "F1"},
          "2": {f: "F2"},
          "3": {f: "F3"}
        };

        expect(domain.at(0).formatted).toBe("F1");
        expect(domain.at(1).formatted).toBe("F2");
        expect(domain.at(2).formatted).toBe("F3");
      });
    }); // #domain

    describe(".Type#validate(value)", function() {

      it("should return null on a value that is equal to one of `domain`", function() {

        var MyNumber = PentahoNumber.extend({
          type: {
            mixins: Enum,
            domain: [1, 2, 3]
          }
        });

        var v = new MyNumber(1);

        expect(MyNumber.type.validate(v)).toBe(null);
      });

      it("should return an Error on a value that is not equal to one of `domain`", function() {

        var MyNumber = PentahoNumber.extend({
          type: {
            mixins: Enum,
            domain: [1, 2, 3]
          }
        });

        var v = new MyNumber(4);

        var errors = MyNumber.type.validate(v);
        expect(errors.length).toBe(1);
        expect(errors[0] instanceof Error).toBe(true);
      });
    });

    describe(".Type#fillSpecInContext(spec, keyArgs)", function() {

      it("should serialize `domain` using array form", function() {

        var MyNumber = PentahoNumber.extend({
          type: {
            mixins: Enum,
            domain: [1, 2, 3]
          }
        });

        var scope = new SpecificationScope();
        var spec = {};
        var result = MyNumber.type._fillSpecInContext(spec, {});

        scope.dispose();

        expect(result).toBe(true);
        expect(spec.domain).toEqual([1, 2, 3]);
      });
    });

    describe(".Type#compare(a, b)", function() {
      var MyString;

      beforeEach(function() {
        MyString = PentahoString.extend({
          type: {
            mixins: Enum,
            domain: ["Xau", "Wow", "Beu"]
          }
        });
      });

      it("should return negative if only `a` is not a valid enum value", function() {
        expect(MyString.type.compare("foo", "Xau")).toBeLessThan(0);
      });

      it("should return positive if only `b` is not a valid enum value", function() {
        expect(MyString.type.compare("Xau", "foo")).toBeGreaterThan(0);
      });

      it("should return 0 if both `a` and `b` are not valid enum values", function() {
        expect(MyString.type.compare("bar", "foo")).toBe(0);
      });

      it("should return 0 if `a` and `b` are equal valid enum values", function() {
        function expectIt(value) {

          expect(MyString.type.compare(value, value)).toBe(0);

          expect(MyString.type.compare(
              new MyString(value),
              new MyString(value))).toBe(0);
        }

        expectIt("Xau");
        expectIt("Wow");
        expectIt("Beu");
      });

      it("should return negative if `a` is before and `b` is after", function() {
        function expectIt(a, b) {
          expect(MyString.type.compare(a, b)).toBeLessThan(0);
          expect(MyString.type.compare(new MyString(a), new MyString(b))).toBeLessThan(0);
        }

        expectIt("Xau", "Wow");
        expectIt("Xau", "Beu");
        expectIt("Wow", "Beu");
      });

      it("should return positive if `a` is after and `b` is before", function() {
        function expectIt(a, b) {
          expect(MyString.type.compare(a, b)).toBeGreaterThan(0);
          expect(MyString.type.compare(new MyString(a), new MyString(b))).toBeGreaterThan(0);
        }

        expectIt("Wow", "Xau");
        expectIt("Beu", "Xau");
        expectIt("Beu", "Wow");
      });
    });
  });
});

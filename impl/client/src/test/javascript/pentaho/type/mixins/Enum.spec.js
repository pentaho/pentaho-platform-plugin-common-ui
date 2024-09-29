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
  "pentaho/type/List",
  "pentaho/type/Number",
  "pentaho/type/String",
  "pentaho/type/mixins/Enum",
  "pentaho/type/SpecificationScope",
  "tests/pentaho/util/errorMatch"
], function(List, PentahoNumber, PentahoString, Enum, SpecificationScope, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.mixins.Enum", function() {

    it("should be a function", function() {
      expect(typeof Enum).toBe("function");
    });

    describe(".extend", function() {
      it("should throw if extended", function() {

        var MyNumber = PentahoNumber.extend({
          $type: {
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
            $type: {
              mixins: [Enum]
            }
          });
        }).toThrow(errorMatch.argRequired("spec.domain"));
      });

      it("should respect the specified domain", function() {

        var MyNumber = PentahoNumber.extend({
          $type: {
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
            $type: {
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
          $type: {
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

    describe("#validate(value)", function() {

      it("should return null on a value that is equal to one of `domain`", function() {

        var MyNumber = PentahoNumber.extend({
          $type: {
            mixins: Enum,
            domain: [1, 2, 3]
          }
        });

        var v = new MyNumber(1);

        expect(v.validate()).toBe(null);
      });

      it("should return an Error on a value that is not equal to one of `domain`", function() {

        var MyNumber = PentahoNumber.extend({
          $type: {
            mixins: Enum,
            domain: [1, 2, 3]
          }
        });

        var v = new MyNumber(4);

        var errors = v.validate();
        expect(errors.length).toBe(1);
        expect(errors[0] instanceof Error).toBe(true);
      });
    });

    describe(".Type#fillSpecInContext(spec, keyArgs)", function() {

      it("should serialize `domain` using array form", function() {

        var MyNumber = PentahoNumber.extend({
          $type: {
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

    describe(".Type#compareElements(a, b)", function() {
      var MyString;

      beforeEach(function() {
        MyString = PentahoString.extend({
          $type: {
            mixins: Enum,
            domain: ["Xau", "Wow", "Beu"]
          }
        });
      });

      it("should return negative if only `a` is not a valid enum value", function() {
        expect(MyString.type.compareElements(new MyString("foo"), new MyString("Xau"))).toBeLessThan(0);
      });

      it("should return positive if only `b` is not a valid enum value", function() {
        expect(MyString.type.compareElements(new MyString("Xau"), new MyString("foo"))).toBeGreaterThan(0);
      });

      it("should return 0 if both `a` and `b` are not valid enum values", function() {
        expect(MyString.type.compareElements(new MyString("bar"), new MyString("foo"))).toBe(0);
      });

      it("should return 0 if `a` and `b` are equal valid enum values", function() {

        function expectIt(value) {

          expect(MyString.type.compareElements(
            new MyString(value),
            new MyString(value))).toBe(0);
        }

        expectIt("Xau");
        expectIt("Wow");
        expectIt("Beu");
      });

      it("should return negative if `a` is before and `b` is after", function() {

        function expectIt(a, b) {
          expect(MyString.type.compareElements(new MyString(a), new MyString(b))).toBeLessThan(0);
        }

        expectIt("Xau", "Wow");
        expectIt("Xau", "Beu");
        expectIt("Wow", "Beu");
      });

      it("should return positive if `a` is after and `b` is before", function() {

        function expectIt(a, b) {
          expect(MyString.type.compareElements(new MyString(a), new MyString(b))).toBeGreaterThan(0);
        }

        expectIt("Wow", "Xau");
        expectIt("Beu", "Xau");
        expectIt("Beu", "Wow");
      });
    });
  });
});

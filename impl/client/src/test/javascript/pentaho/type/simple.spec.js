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
  "pentaho/type/Context",
  "pentaho/lang/UserError",
  "tests/pentaho/util/errorMatch"
], function(Context, UserError, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      Element = context.get("pentaho/type/element"),
      Simple  = context.get("pentaho/type/simple");

  describe("pentaho.type.Simple -", function() {
    function expectThrow(spec, errorMatch) {
      expect(function() {
        var foo = new Simple(spec);
      }).toThrow(errorMatch);
    }

    function constructWithValue(spec) {
      if(spec != null) {
        var simpleType = new Simple(spec);
        expect(simpleType.value).toBe(spec);
      } else {
        expectThrow(spec, errorMatch.argRequired("value"));
      }
    }

    function constructWithObject(v, f) {
      var spec = {};
      if(v != null && f != null) {
        spec = {value: v, formatted: f};
      }

      if(v != null) {
        var simpleType = new Simple(spec);
        expect(simpleType.value).toBe(v);
        expect(simpleType.formatted).toBe(f);
      } else {
        expectThrow(spec, errorMatch.argRequired("value"));
      }

      return spec;
    }

    function constructWithSimple(value, formatted) {
      var spec = new Simple(constructWithObject(value, formatted));
      var simpleType = new Simple(spec);

      expect(simpleType.value).toBe(value);
      expect(simpleType.formatted).toBe(formatted);
    }

    it("should be a function", function() {
      expect(typeof Simple).toBe("function");
    });

    it("should be a sub-class of `Element`", function() {
      expect(Simple.prototype instanceof Element).toBe(true);
    });

    describe("new Simple() -", function() {
      it("Creating with a Object", function() {
        constructWithObject();
        constructWithObject(null);
        constructWithObject(true, "true");
        constructWithObject(123, "123");
        constructWithObject("simple", "simple");
      });

      it("Creating with other Simple", function() {
        constructWithSimple(true, "true");
        constructWithSimple(123, "123");
        constructWithSimple("simple", "Simple");
      });

      it("Creating with a value", function() {
        constructWithValue();
        constructWithValue(null);
        constructWithValue(true);
        constructWithValue(123);
        constructWithValue("simple");
        constructWithValue(new Element());
      });
    });

    describe("#clone -", function() {
      it("The cloned object should be equal to the original", function() {
        var original = new Simple(constructWithObject(true, "true"));
        var clone = original.clone();

        expect(clone).not.toBe(original);
        expect(clone.value).toBe(original.value);
        expect(clone.formatted).toBe(original.formatted);
      });
    });

    describe("#value -", function() {
      var simpleType;

      beforeEach(function() {
        simpleType = new Simple(123);
      });

      function setValueExpectedThrow(value, errorMatch) {
        expect(function() {
          simpleType.value = value;
        }).toThrow(errorMatch);

        expect(function() {
          simpleType.v = value;
        }).toThrow(errorMatch);
      }

      it("Should return the given value in the constructor", function() {
        expect(simpleType.value).toBe(123);
      });

      it("Cannot change the primitive value of a simple value", function() {
        setValueExpectedThrow(456, errorMatch.argInvalid("value"));
      });

      it("Nothing should happen when setting the underlying primitive value with the same value", function() {
        expect(function() {
          simpleType.value = 123;
        }).not.toThrow();
        expect(simpleType.value).toBe(123);
      });

      it("Simple value cannot contain null", function() {
        setValueExpectedThrow(null, errorMatch.argRequired("value"));
      });
    });

    describe("#formatted -", function() {
      var simpleType;
      beforeEach(function() {
        simpleType = new Simple(123);
      });

      function testNullValue(value) {
        simpleType.formatted = value;
        expect(simpleType.formatted).toBe(null);
        simpleType.f = value;
        expect(simpleType.formatted).toBe(null);
      }

      function testFormattedValue(value) {
        simpleType.formatted = value;
        expect(simpleType.formatted).toBe(value);
        simpleType.f = value + "f";
        expect(simpleType.formatted).toBe(value + "f");
      }

      it("Should return null if set with nully or empty values", function() {
        testNullValue(null);
        testNullValue(undefined);
        testNullValue("");
      });

      it("Should return the formatted value if set with a non empty String", function() {
        testFormattedValue("foobar");
      });
    });

    describe("#valueOf() -", function() {
      it("Should return the given value in the constructor", function() {
        var simpleType = new Simple(123);
        expect(simpleType.valueOf()).toBe(123);
      });
    });

    describe("#toString() -", function() {
      it("Should return the same value as formatted", function() {
        var simpleType = new Simple(constructWithObject(123, "123"));
        expect(simpleType.toString()).toBe(simpleType.formatted);
      });

      it("Should return the value converted to a string if 'formatted' is not defined", function() {
        var simpleType = new Simple(123);
        expect(simpleType.toString()).toBe("123");
      });
    });

    describe("#$key -", function() {
      it("Should convert the given value to a string", function() {
        var simple1 = new Simple(123);
        expect(simple1.$key).toBe(String(123));
      });
    });

    describe("#configure(config)", function() {
      it("should configure the Simple when given a plain object", function() {
        var simple1 = new Simple(123);
        expect(simple1.formatted).toBe(null);

        simple1.configure({formatted: "ABC"});

        expect(simple1.formatted).toBe("ABC");
      });

      it("should configure the Simple when given another Simple of equal value", function() {
        var simple1 = new Simple(123);
        var simple2 = new Simple({v: 123, f: "ABC"});

        simple1.configure(simple2);

        expect(simple1.formatted).toBe("ABC");
      });

      it("should throw when given another Simple of different value", function() {
        expect(function() {
          var simple1 = new Simple(123);
          var simple2 = new Simple({v: 234, f: "ABC"});

          simple1.configure(simple2);

        }).toThrow(errorMatch.argInvalid("value"));
      });

      it("should throw when not given a plain object or another Simple", function() {
        expect(function() {
          var simple1 = new Simple(123);
          simple1.configure("foo");
        }).toThrow(errorMatch.argInvalidType("config", ["Object", "pentaho.type.Simple"], "string"));

        expect(function() {
          var simple1 = new Simple(123);
          simple1.configure(new Date());
        }).toThrow(errorMatch.argInvalidType("config", ["Object", "pentaho.type.Simple"], "object"));
      });

      it("should do nothing when given itself", function() {
        // dummy test
        var simple1 = new Simple(123);
        simple1.configure(simple1);
        expect(simple1.value).toBe(123);
      });
    });

    describe(".Type -", function() {
      var ElemType = Simple.Type;

      it("should be a function", function() {
        expect(typeof ElemType).toBe("function");
      });

      it("should be a sub-class of `Element.Type`", function() {
        expect(ElemType.prototype instanceof Element.Type).toBe(true);
      });

      describe("#isSimple", function() {
        it("should have `isSimple` equal to `true`", function () {
          expect(Simple.type.isSimple).toBe(true);
        });
      });

      describe("#cast", function() {

        it("should default to an identity method", function() {
          var value = {};
          var Derived = Simple.extend();

          expect(Derived.type.cast(value)).toBe(value);
        });

        it("should be overridable", function() {
          var Derived = Simple.extend({type: {
            cast: function(v) {
              return v * 2;
            }
          }});

          expect(Derived.type.cast(3)).toBe(6);
        });

        it("should be possible to call base", function() {
          var Derived1 = Simple.extend({type: {
            cast: function(v) {
              return v * 2;
            }
          }});

          var Derived2 = Derived1.extend({type: {
            cast: function(v) {
              return this.base(v) * 5;
            }
          }});

          expect(Derived2.type.cast(3)).toBe(3 * 2 * 5);
        });
      });

      describe("#toValue(value)", function() {
        function expectCastError(type, value, errorMatch) {
          expect(function() {
            type.toValue(value);
          }).toThrow(errorMatch);
        }

        it("should call the cast method with the given value, if it is non-nully", function() {
          var original = {};

          var Derived = Simple.extend();
          spyOn(Derived.type, "cast").and.returnValue(original);

          Derived.type.toValue(original);

          expect(Derived.type.cast.calls.count()).toBe(1);
          expect(Derived.type.cast.calls.first().args).toEqual([original]);
        });

        it("should return a non-nully value returned by the cast method", function() {
          var original = {};
          var Derived = Simple.extend();

          spyOn(Derived.type, "cast").and.returnValue(original);

          expect(Derived.type.toValue({})).toBe(original);
        });

        it("should throw when given a nully value", function() {
          var Derived = Simple.extend();

          expectCastError(Derived.type, null, errorMatch.argRequired("value"));

          expectCastError(Derived.type, undefined, errorMatch.argRequired("value"));
        });

        it("should throw an error, when the cast method returns nully", function() {
          var value;
          var Derived = Simple.extend();
          spyOn(Derived.type, "cast").and.callFake(function() { return value; });

          value = null;
          expectCastError(Derived.type, 0, errorMatch.argInvalid("value"));

          value = undefined;
          expectCastError(Derived.type, 0, errorMatch.argInvalid("value"));
        });

        it("should throw user errors thrown by the cast method", function() {
          var error = new UserError("Invalid!");
          var Derived = Simple.extend();
          spyOn(Derived.type, "cast").and.callFake(function() { throw error; });

          expect(function() {
            Derived.type.toValue({});
          }).toThrow(error);
        });
      });
    });
  });
});

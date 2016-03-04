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
  "tests/pentaho/util/errorMatch"
], function(Context, errorMatch) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      Element = context.get("pentaho/type/element"),
      Simple  = context.get("pentaho/type/simple");

  describe("pentaho.type.Simple -", function() {
    function expectThrow(spec, errorMatch) {
      expect(function() {
        new Simple(spec);
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

    describe("#key -", function() {
      it("Should convert the given value to a string", function() {
        var simple1 = new Simple(123);
        expect(simple1.key).toBe(String(123));
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

    describe(".Meta -", function() {
      var ElemMeta = Simple.Meta;

      it("should be a function", function() {
        expect(typeof ElemMeta).toBe("function");
      });

      it("should be a sub-class of `Element.Meta`", function() {
        expect(ElemMeta.prototype instanceof Element.Meta).toBe(true);
      });

      describe("#cast -", function() {
        var SimpleMeta, Derived;

        beforeEach(function() {
          SimpleMeta = Simple.meta;
          Derived = Simple.extend({meta: {
            cast: function (value) {
              var n = parseFloat(value);
              if (isNaN(n)) throw new Error("Invalid value");
              return n;
            }
          }});
        });

        function expectCastError(meta, value, errorMatch) {
          expect(function() {
            meta.cast(value);
          }).toThrow(errorMatch);
        }

        it("Default cast should return the value unchanged", function() {
          var original = 123;
          var final = SimpleMeta.cast(original);

          expect(original).toBe(final);
        });

        it("Cannot cast null values", function() {
          expectCastError(SimpleMeta, null, errorMatch.argRequired("value"));
        });

        it("Top cast function should throw an error message when cast function returns nully (null or undefined).", function() {
          SimpleMeta.cast = function(value) {
            return value === 0 ? null : value;
          };
          expectCastError(SimpleMeta, 0, errorMatch.argInvalid("value"));

          SimpleMeta.cast = function(value) {
            return value === 0 ? undefined : value;
          };
          expectCastError(SimpleMeta, 0, errorMatch.argInvalid("value"));
        });

        it("Should have changed the default cast behaviour and return an error if not a number", function() {
          expect(Derived.meta.cast("1")).toBe(1);

          expect(function() {
            Derived.meta.cast("a");
          }).toThrowError("Invalid value");
        });

        it("Setting cast to a falsy value restores the default cast function (identity)", function() {
          var value = "123";
          expect(Derived.meta.cast(value)).toBe(123);
          Derived.meta.cast = null;
          expect(Derived.meta.cast(value)).toBe(value);
        });
      });
    });
  });
});

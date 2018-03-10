/*!
 * Copyright 2010 - 2018 Hitachi Vantara.  All rights reserved.
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

  /* global describe:true, it:true, expect:true, beforeAll:true*/

  describe("pentaho.type.Simple", function() {

    var context;
    var Element;
    var Simple;

    function expectThrow(spec, errorMatch) {
      expect(function() {
        var foo = new Simple(spec);
      }).toThrow(errorMatch);
    }

    function constructWithValue(spec) {
      if(spec != null) {
        var simple = new Simple(spec);
        expect(simple.value).toBe(spec);
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
        var simple = new Simple(spec);
        expect(simple.value).toBe(v);
        expect(simple.formatted).toBe(f);
      } else {
        expectThrow(spec, errorMatch.argRequired("value"));
      }

      return spec;
    }

    function constructWithSimple(value, formatted) {
      var other = new Simple(constructWithObject(value, formatted));
      var simple = new Simple(other);

      expect(simple.value).toBe(value);
      expect(simple.formatted).toBe(formatted);
    }

    beforeAll(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Element = context.get("pentaho/type/element");
            Simple  = context.get("pentaho/type/simple");
          })
          .then(done, done.fail);
    });

    it("should be a function", function() {
      expect(typeof Simple).toBe("function");
    });

    it("should be a sub-class of `Element`", function() {
      expect(Simple.prototype instanceof Element).toBe(true);
    });

    describe("new Simple() -", function() {

      it("creating with a Object", function() {
        constructWithObject();
        constructWithObject(null);
        constructWithObject(true, "true");
        constructWithObject(123, "123");
        constructWithObject("simple", "simple");
      });

      it("creating with other Simple", function() {
        constructWithSimple(true, "true");
        constructWithSimple(123, "123");
        constructWithSimple("simple", "Simple");
      });

      it("creating with a value", function() {
        constructWithValue();
        constructWithValue(null);
        constructWithValue(true);
        constructWithValue(123);
        constructWithValue("simple");
        constructWithValue(new Element());
      });
    });

    describe("#clone()", function() {
      it("should create an object which is equal to the original", function() {
        var original = new Simple(constructWithObject(true, "true"));
        var clone = original.clone();

        expect(clone).not.toBe(original);
        expect(clone.value).toBe(original.value);
        expect(clone.formatted).toBe(original.formatted);
      });
    });

    describe("#value", function() {

      it("should throw when set", function() {
        var simple = new Simple({value: 1, formatted: "One"});

        expect(function() {
          simple.value = 1;
        }).toThrowError(TypeError);
      });
    });

    describe("#formatted", function() {

      it("should default to null", function() {
        var simple = new Simple({value: 1});
        expect(simple.formatted).toBe(null);
      });

      it("should respect a specified non-empty value", function() {
        var simple = new Simple({value: 1, formatted: "One"});
        expect(simple.formatted).toBe("One");
      });

      it("should respect a specified non-empty value in the `f` property", function() {
        var simple = new Simple({value: 1, f: "One"});
        expect(simple.formatted).toBe("One");
      });

      it("should ignore `f` if `formatted` is specified", function() {
        var simple = new Simple({value: 1, formatted: "One", f: "two"});
        expect(simple.formatted).toBe("One");
    });

      it("should convert a specified empty or undefined value to null", function() {
        var simple = new Simple({value: 1, formatted: ""});
        expect(simple.formatted).toBe(null);

        simple = new Simple({value: 1, formatted: undefined});
        expect(simple.formatted).toBe(null);

        simple = new Simple({value: 1, formatted: null});
        expect(simple.formatted).toBe(null);
      });

      it("should convert a non-empty non-string value to a string", function() {
        var simple = new Simple({value: 1, formatted: 123});
        expect(simple.formatted).toBe("123");
      });

      it("should throw when set", function() {
        var simple = new Simple({value: 1, formatted: "One"});

        expect(function() {
          simple.formatted = "One";
        }).toThrowError(TypeError);
      });
    });

    describe("#valueOf()", function() {
      it("should return the same value as `#value`", function() {
        var simpleType = new Simple(123);
        expect(simpleType.valueOf()).toBe(123);
      });
    });

    describe("#toString()", function() {
      it("should return the same value as formatted", function() {
        var simpleType = new Simple(constructWithObject(123, "123"));
        expect(simpleType.toString()).toBe(simpleType.formatted);
      });

      it("should return the value converted to a string if 'formatted' is not defined", function() {
        var simpleType = new Simple(123);
        expect(simpleType.toString()).toBe("123");
      });
    });

    describe("#$key", function() {
      it("should convert the `#value` to a string", function() {
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

    describe(".Type", function() {

      var ElemType;

      beforeAll(function() {
        ElemType = Simple.Type;
      });

      it("should be a function", function() {
        expect(typeof ElemType).toBe("function");
      });

      it("should be a sub-class of `Element.Type`", function() {
        expect(ElemType.prototype instanceof Element.Type).toBe(true);
      });

      describe("#isSimple", function() {
        it("should have `isSimple` equal to `true`", function() {
          expect(Simple.type.isSimple).toBe(true);
        });
      });

      describe("#isReadOnly", function() {
        it("should return the value `false`", function() {
          expect(Simple.type.isReadOnly).toBe(true);
        });
      });

      describe("#isEntity", function() {
        it("should return the value `true`", function() {
          expect(Simple.type.isEntity).toBe(true);
        });
      });

      describe("#cast", function() {

        it("should default to an identity method", function() {
          var value = {};
          var Derived = Simple.extend();

          expect(Derived.type.cast(value)).toBe(value);
        });

        it("should be overridable", function() {
          var Derived = Simple.extend({$type: {
            cast: function(v) {
              return v * 2;
            }
          }});

          expect(Derived.type.cast(3)).toBe(6);
        });

        it("should be possible to call base", function() {
          var Derived1 = Simple.extend({$type: {
            cast: function(v) {
              return v * 2;
            }
          }});

          var Derived2 = Derived1.extend({$type: {
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

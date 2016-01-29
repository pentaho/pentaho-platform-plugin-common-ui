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
  "pentaho/type/Item",
  "pentaho/type/Context",
  "pentaho/util/error",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(Item, Context, error, bundle) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      Value = context.get("pentaho/type/value"),
      Number = context.get("pentaho/type/number");

  describe("pentaho/type/value -", function() {

    it("should be a function", function() {
      expect(typeof Value).toBe("function");
    });

    it("should be a sub-class of `Item`", function() {
      expect(Value.prototype instanceof Item).toBe(true);
    });

    describe(".Meta -", function() {
      var ValueMeta = Value.Meta;

      it("should be a function", function() {
        expect(typeof ValueMeta).toBe("function");
      });

      it("should be a sub-class of `Item.Meta`", function() {
        expect(ValueMeta.prototype instanceof Item.Meta).toBe(true);
      });

      it("should have an `uid`", function() {
        expect(ValueMeta.prototype.uid != null).toBe(true);
        expect(typeof ValueMeta.prototype.uid).toBe("number");
      });

      it("should have `abstract` equal to `true`", function() {
        expect(ValueMeta.prototype.abstract).toBe(true);
      });

      describe("#areEqual(va, vb)", function() {
        it("should return `true` if both values are nully", function() {
          expect(Value.meta.areEqual(null, null)).toBe(true);
          expect(Value.meta.areEqual(undefined, undefined)).toBe(true);
          expect(Value.meta.areEqual(null, undefined)).toBe(true);
          expect(Value.meta.areEqual(undefined, null)).toBe(true);
        });

        it("should return `false` if only one of the values is nully", function() {
          var va = new Value();

          expect(Value.meta.areEqual(null, va)).toBe(false);
          expect(Value.meta.areEqual(undefined, va)).toBe(false);
          expect(Value.meta.areEqual(va, undefined)).toBe(false);
          expect(Value.meta.areEqual(va, null)).toBe(false);
        });

        it("should return `true` when given the same value instances and not call its #equals method", function() {
          var va = new Value();

          spyOn(va, "equals").and.callThrough();

          expect(Value.meta.areEqual(va, va)).toBe(true);
          expect(va.equals).not.toHaveBeenCalled();
        });

        it("should return `false` when given values with different constructors and not call their #equals methods", function() {
          var va = new Value();
          var vb = new Number(1);

          spyOn(va, "equals").and.callThrough();
          spyOn(vb, "equals").and.callThrough();

          expect(Value.meta.areEqual(va, vb)).toBe(false);

          expect(va.equals).not.toHaveBeenCalled();
          expect(vb.equals).not.toHaveBeenCalled();
        });

        it("should call the first value's #equals method when these are distinct instances with the same constructor",
            function() {
          var va = new Value();
          var vb = new Value();

          spyOn(va, "equals").and.callFake(function() { return false; });
          spyOn(vb, "equals").and.callFake(function() { return false; });

          expect(Value.meta.areEqual(va, vb)).toBe(false);

          expect(va.equals).toHaveBeenCalled();
          expect(vb.equals).not.toHaveBeenCalled();
        });
      }); // end #areEqual
    }); // ".Meta -"

    describe(".extend({...}) returns a value that -", function() {

      it("should be a function", function() {
        var Derived = Value.extend();
        expect(typeof Derived).toBe("function");
      });

      it("should be a sub-class of Value", function() {
        var Derived = Value.extend();
        expect(Derived).not.toBe(Value);
        expect(Derived.prototype instanceof Value).toBe(true);
      });

      describe("has a .Meta property that -", function() {

        it("should be a function", function() {
          var Derived = Value.extend();
          expect(typeof Derived.Meta).toBe("function");
        });

        it("should be a sub-class of Value.Meta", function() {
          var Derived = Value.extend();
          expect(Derived.Meta).not.toBe(Value.Meta);
          expect(Derived.meta instanceof Value.Meta).toBe(true);
        });

        describe("#abstract", function() {
          it("should respect a specified abstract spec value", function() {
            var Derived = Value.extend({meta: {abstract: true}});
            expect(Derived.meta.abstract).toBe(true);

            Derived = Value.extend({meta: {abstract: false}});
            expect(Derived.meta.abstract).toBe(false);
          });

          it("should default to `false` whe spec is unspecified and should not inherit the base value", function() {
            var Derived = Value.extend();
            expect(Derived.meta.abstract).toBe(false);

            var Abstract = Value.extend({meta: {abstract: true }});
            var Concrete = Value.extend({meta: {abstract: false}});

            var DerivedAbstract = Abstract.extend();
            var DerivedConcrete = Concrete.extend();

            expect(DerivedAbstract.meta.abstract).toBe(false);
            expect(DerivedConcrete.meta.abstract).toBe(false);
          });

          it("should respect a set non-nully value", function() {
            var Derived = Value.extend();
            expect(Derived.meta.abstract).toBe(false);

            Derived.meta.abstract = true;
            expect(Derived.meta.abstract).toBe(true);

            Derived.meta.abstract = false;
            expect(Derived.meta.abstract).toBe(false);
          });

          it("should set to the default value false when set to a nully value", function() {
            var Derived = Value.extend({meta: {abstract: true}});
            expect(Derived.meta.abstract).toBe(true);
            Derived.meta.abstract = null;
            expect(Derived.meta.abstract).toBe(false);

            Derived = Value.extend({meta: {abstract: true}});
            expect(Derived.meta.abstract).toBe(true);
            Derived.meta.abstract = undefined;
            expect(Derived.meta.abstract).toBe(false);
          });
        }); // #abstract
      });

      // TODO: remaining properties: value, annotations...

    }); // .extend({...})

    describe("#key", function() {
      it("should return the result of toString()", function() {
        var va = new Value();

        spyOn(va, "toString").and.returnValue("FOOO");

        expect(va.key).toBe("FOOO");
        expect(va.toString).toHaveBeenCalled();
      });
    });// end #key

    describe("#equals", function() {
      it("should return `true` if given the same value", function() {
        var va = new Value();

        expect(va.equals(va)).toBe(true);
      });

      it("should return `true` if two distinct values have the same key", function() {
        var va = new Value(),
            vb = new Value();

        // Override/Redefine getter property
        Object.defineProperty(va, "key", {value: "A"});
        Object.defineProperty(vb, "key", {value: "A"});

        expect(va.equals(vb)).toBe(true);
      });

      it("should return `false` if two distinct values have different keys", function() {
        var va = new Value(),
            vb = new Value();

        // Override/Redefine getter property
        Object.defineProperty(va, "key", {value: "A"});
        Object.defineProperty(vb, "key", {value: "B"});

        expect(va.equals(vb)).toBe(false);
      });
    }); // end #equals

    describe("#clone()", function() {
      it("should throw a not implemented error", function() {
        var va = new Value();

        expect(function() {
          va.clone();
        }).toThrowError(error.notImplemented().message);
      });
    });// end #clone
  });
});

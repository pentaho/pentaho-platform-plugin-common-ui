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
  "pentaho/type/Instance",
  "pentaho/type/Context",
  "tests/pentaho/util/errorMatch"
], function(Instance, Context, errorMatch) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  var context = new Context(),
      Value = context.get("pentaho/type/value"),
      PentahoNumber = context.get("pentaho/type/number"),
      Type = Instance.Type;

  describe("pentaho/type/value -", function() {

    it("should be a function", function() {
      expect(typeof Value).toBe("function");
    });

    it("should be a sub-class of `Instance`", function() {
      expect(Value.prototype instanceof Instance).toBe(true);
    });

    describe(".Type -", function() {
      var valueType;
      var Value;
      var myContext;

      beforeEach( function() {
        // making sure that we have a new Value definition for each test
        myContext = new Context();
        Value = myContext.get("pentaho/type/value");
        valueType = Value.type;
      });

      it("should be a function", function() {
        expect(typeof Value.Type).toBe("function");
      });

      it("should be a sub-class of `Type`", function() {
        expect(valueType instanceof Type).toBe(true);
      });

      it("should have an `uid`", function() {
        expect(valueType.uid != null).toBe(true);
        expect(typeof valueType.uid).toBe("number");
      });

      describe("#isValue", function() {
        it("should have `isValue` equal to `true`", function () {
          expect(valueType.isValue).toBe(true);
        });
      });

      describe("#context()", function() {
        it("the Value type has the context in which it was defined", function() {
          var myContext = new Context();
          var Value = myContext.get("pentaho/type/value");

          expect(Value.type.context).toBe(myContext);
        });
      }); // end #context

      describe("#isAbstract", function() {
        it("should have default `isAbstract` equal to `true`", function () {
          expect(valueType.isAbstract).toBe(true);
        });

        it("should allow changing `isAbstract` value", function () {
          valueType.isAbstract = false;
          expect(valueType.isAbstract).toBe(false);
          valueType.isAbstract = true;
          expect(valueType.isAbstract).toBe(true);
        });
      }); // end #isAbstract

      describe("#areEqual(va, vb)", function() {
        it("should return `true` if both values are nully", function() {
          expect(Value.type.areEqual(null, null)).toBe(true);
          expect(Value.type.areEqual(undefined, undefined)).toBe(true);
          expect(Value.type.areEqual(null, undefined)).toBe(true);
          expect(Value.type.areEqual(undefined, null)).toBe(true);
        });

        it("should return `false` if only one of the values is nully", function() {
          var va = new Value();

          expect(Value.type.areEqual(null, va)).toBe(false);
          expect(Value.type.areEqual(undefined, va)).toBe(false);
          expect(Value.type.areEqual(va, undefined)).toBe(false);
          expect(Value.type.areEqual(va, null)).toBe(false);
        });

        it("should return `true` when given the same value instances and not call its #equals method", function() {
          var va = new Value();

          spyOn(va, "equals").and.callThrough();

          expect(Value.type.areEqual(va, va)).toBe(true);
          expect(va.equals).not.toHaveBeenCalled();
        });

        it("should return `false` when given values with different constructors and not call their #equals methods",
        function() {
          var va = new Value();
          var vb = new PentahoNumber(1);

          spyOn(va, "equals").and.callThrough();
          spyOn(vb, "equals").and.callThrough();

          expect(Value.type.areEqual(va, vb)).toBe(false);

          expect(va.equals).not.toHaveBeenCalled();
          expect(vb.equals).not.toHaveBeenCalled();
        });

        it("should call the first value's #equals method when these are distinct instances with the same constructor",
            function() {
          var va = new Value();
          var vb = new Value();

          spyOn(va, "equals").and.callFake(function() { return false; });
          spyOn(vb, "equals").and.callFake(function() { return false; });

          expect(Value.type.areEqual(va, vb)).toBe(false);

          expect(va.equals).toHaveBeenCalled();
          expect(vb.equals).not.toHaveBeenCalled();
        });
      }); // end #areEqual

      describe("#create(valueSpec, {defaultType: .})", function() {

        it("should return an instance when given nully", function() {
          var Complex = myContext.get("pentaho/type/complex");
          var MyComplex = Complex.extend();
          var inst = MyComplex.type.create(null);
          expect(inst instanceof MyComplex).toBe(true);

          inst = MyComplex.type.create(undefined);
          expect(inst instanceof MyComplex).toBe(true);
        });

        it("should create an instance given a number value when called on a Number type", function() {
          var Number = myContext.get("pentaho/type/number");
          var number = Number.type.create(1);

          expect(number instanceof Number).toBe(true);
          expect(number.value).toBe(1);
        });

        it("should create an instance given a number value when called on Number", function() {
          var Number = myContext.get("pentaho/type/number");
          var number = Number.type.create(1);

          expect(number instanceof Number).toBe(true);
          expect(number.value).toBe(1);
        });

        it("should create an instance given a boolean value when called on Boolean", function() {
          var Boolean = myContext.get("pentaho/type/boolean");
          var value = Boolean.type.create(true);

          expect(value instanceof Boolean).toBe(true);
          expect(value.value).toBe(true);
        });

        it("should create an instance given an object value when called on Object", function() {
          var Object = myContext.get("pentaho/type/object");
          var primitive = {};
          var value = Object.type.create({v: primitive});

          expect(value instanceof Object).toBe(true);
          expect(value.value).toBe(primitive);
        });

        it("should create an instance given an object with a type annotation, '_'", function() {
          var value = Value.type.create({_: "pentaho/type/number", v: 1});

          var Number = myContext.get("pentaho/type/number");
          expect(value instanceof Number).toBe(true);
          expect(value.value).toBe(1);
        });

        it("should throw if given a type-annotated value that does not extend from the this type", function() {
          var String = myContext.get("pentaho/type/string");

          expect(function() {
            String.type.create({_: "pentaho/type/number", v: 1});
          }).toThrow(errorMatch.operInvalid());
        });

        it("should not throw if given a type-annotated value that does extend from the given baseType", function() {
          var Simple = myContext.get("pentaho/type/simple");
          var Number = myContext.get("pentaho/type/number");

          var value = Simple.type.create({_: "pentaho/type/number", v: 1});

          expect(value instanceof Number).toBe(true);
          expect(value.value).toBe(1);
        });

        it("should throw if given a type annotated value of an abstract type", function() {
          var MyAbstract = myContext.get("pentaho/type/complex").extend({type: {isAbstract: true}});

          expect(function() {
            Value.type.create({_: MyAbstract});
          }).toThrow(errorMatch.operInvalid());
        });

        it("should throw if given a value and called on an abstract type", function() {
          var MyAbstract = myContext.get("pentaho/type/complex").extend({type: {isAbstract: true}});

          expect(function() {
            MyAbstract.type.create({});
          }).toThrow(errorMatch.operInvalid());
        });

        // ---

        it("should be able to create a type-annotated value of a list type", function() {
          var NumberList = myContext.get({base: "list", of: "number"});

          var value = Value.type.create({_: NumberList, d: [1, 2]});

          expect(value instanceof NumberList).toBe(true);
          expect(value.count).toBe(2);
          expect(value.at(0).value).toBe(1);
          expect(value.at(1).value).toBe(2);
        });

        it("should be able to create a type-annotated value of an inline list type", function() {
          var value = Value.type.create({
            _: {base: "list", of: "number"},
            d: [1, 2]
          });

          expect(value instanceof myContext.get("list")).toBe(true);
          expect(value.count).toBe(2);
          expect(value.at(0).value).toBe(1);
          expect(value.at(1).value).toBe(2);
        });

        it("should be able to create a type-annotated value of an inline complex type", function() {
          var value = Value.type.create({
            _: {
              props: ["a", "b"]
            },
            "a": 1,
            "b": 2
          });

          expect(value instanceof myContext.get("complex")).toBe(true);
          expect(value.get("a").value).toBe("1");
          expect(value.get("b").value).toBe("2");
        });

        it("should be able to create a type-annotated value of an inline list complex type", function() {
          var value = Value.type.create({
            _: [
              {
                props: [
                  {name: "a"},
                  "b"
                ]
              }
            ],
            d: [
              {a: 1, b: 2}
            ]
          });

          expect(value instanceof myContext.get("list")).toBe(true);
          expect(value.count).toBe(1);
        });

        it("should be able to create a type-annotated value of an inline list complex type in array form", function() {
          var value = Value.type.create({
            _: [{
              props: ["a", "b"]
            }],
            d: [
              [1, 2],
              [3, 4]
            ]
          });

          expect(value instanceof myContext.get("list")).toBe(true);
          expect(value.count).toBe(2);
        });

      }); // #create
    }); // "Type"

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

      describe("has a .Type property that -", function() {

        it("should be a function", function() {
          var Derived = Value.extend();
          expect(typeof Derived.Type).toBe("function");
        });

        it("should be a sub-class of Value.Type", function() {
          var Derived = Value.extend();
          expect(Derived.Type).not.toBe(Value.Type);
          expect(Derived.type instanceof Value.Type).toBe(true);
        });

        describe("#isAbstract", function() {
          it("should respect a specified abstract spec value", function() {
            var Derived = Value.extend({type: {isAbstract: true}});
            expect(Derived.type.isAbstract).toBe(true);

            Derived = Value.extend({type: {isAbstract: false}});
            expect(Derived.type.isAbstract).toBe(false);
          });

          it("should default to `false` whe spec is unspecified and should not inherit the base value", function() {
            var Derived = Value.extend();
            expect(Derived.type.isAbstract).toBe(false);

            var Abstract = Value.extend({type: {isAbstract: true }});
            var Concrete = Value.extend({type: {isAbstract: false}});

            var DerivedAbstract = Abstract.extend();
            var DerivedConcrete = Concrete.extend();

            expect(DerivedAbstract.type.isAbstract).toBe(false);
            expect(DerivedConcrete.type.isAbstract).toBe(false);
          });

          it("should respect a set non-nully value", function() {
            var Derived = Value.extend();
            expect(Derived.type.isAbstract).toBe(false);

            Derived.type.isAbstract = true;
            expect(Derived.type.isAbstract).toBe(true);

            Derived.type.isAbstract = false;
            expect(Derived.type.isAbstract).toBe(false);
          });

          it("should set to the default value false when set to a nully value", function() {
            var Derived = Value.extend({type: {isAbstract: true}});
            expect(Derived.type.isAbstract).toBe(true);
            Derived.type.isAbstract = null;
            expect(Derived.type.isAbstract).toBe(false);

            Derived = Value.extend({type: {isAbstract: true}});
            expect(Derived.type.isAbstract).toBe(true);
            Derived.type.isAbstract = undefined;
            expect(Derived.type.isAbstract).toBe(false);
          });
        }); // #isAbstract
      });

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

    describe("#configure(config)", function() {
      it("should call #_configure if config is non-nully", function() {
        var va = new Value();

        spyOn(va, "_configure");

        va.configure({});

        expect(va._configure).toHaveBeenCalled();
      });

      it("should call #_configure with the given non-nully config", function() {
        var va = new Value();
        var config = {};
        spyOn(va, "_configure");

        va.configure(config);

        expect(va._configure).toHaveBeenCalledWith(config);
      });

      it("should not call #_configure if the given config is nully", function() {
        var va = new Value();
        spyOn(va, "_configure");

        var config = null;
        va.configure(config);
        expect(va._configure).not.toHaveBeenCalled();

        config = undefined;
        va.configure(config);
        expect(va._configure).not.toHaveBeenCalled();
      });

      it("should return this", function() {
        var va = new Value();
        expect(va.configure({})).toBe(va);
        expect(va.configure(null)).toBe(va);
      });
    }); // end #configure
  });
});

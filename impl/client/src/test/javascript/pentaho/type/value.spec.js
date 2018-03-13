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
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  describe("pentaho.type.Value", function() {

    var context;
    var Value;
    var NumberList;

    beforeAll(function(done) {
      Context.createAsync()
        .then(function(_context) {
          context = _context;
          Value = context.get("pentaho/type/value");
          NumberList = context.get(["pentaho/type/number"]);
        })
        .then(done, done.fail);
    });

    it("should be a function", function() {
      expect(typeof Value).toBe("function");
    });

    it("should be a sub-class of `Instance`", function() {
      var Instance = context.get("instance");

      expect(Value.prototype instanceof Instance).toBe(true);
    });

    describe(".Type", function() {

      var valueType;

      beforeAll(function() {
        valueType = Value.type;
      });

      describe("#isValue", function() {
        it("should have `isValue` equal to `true`", function() {
          expect(valueType.isValue).toBe(true);
        });
      });

      describe("#isAbstract", function() {
        it("should have `isAbstract` equal to `true`", function() {
          expect(valueType.isAbstract).toBe(true);
        });
      });

      describe("#isReadOnly", function() {
        it("should return the value `false`", function() {
          expect(valueType.isReadOnly).toBe(false);
        });
      });

      // region equality
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

        it("should delegate to the equals method of the first value", function() {

          var va = new Value();
          var vb = new Value();

          spyOn(va, "equals").and.callThrough();

          Value.type.areEqual(va, vb);

          expect(va.equals).toHaveBeenCalledWith(vb);
        });
      });

      describe("#areEqualContent(va, vb)", function() {

        it("should call #areEqual(va, vb)", function() {

          spyOn(Value.type, "areEqual").and.returnValue(false);

          var va = {};
          var vb = {};

          Value.type.areEqualContent(va, vb);

          expect(Value.type.areEqual).toHaveBeenCalledTimes(1);
          expect(Value.type.areEqual).toHaveBeenCalledWith(va, vb);
        });

        it("should call vA.equalsContent(vb) if #areEqual returns true", function() {

          var va = new Value();
          var vb = new Value();

          spyOn(Value.type, "areEqual").and.returnValue(true);
          spyOn(va, "equalsContent").and.returnValue(true);

          var result = Value.type.areEqualContent(va, vb);

          expect(va.equalsContent).toHaveBeenCalledTimes(1);
          expect(va.equalsContent).toHaveBeenCalledWith(vb);

          expect(result).toBe(true);
        });

        it("should not call vA.equalsContent(vb) if #areEqual returns false", function() {

          var va = new Value();
          var vb = new Value();

          spyOn(Value.type, "areEqual").and.returnValue(false);
          spyOn(va, "equalsContent");

          var result = Value.type.areEqualContent(va, vb);

          expect(va.equalsContent).not.toHaveBeenCalled();

          expect(result).toBe(false);
        });
      });

      describe("#areEqualContentElements(listA, listB)", function() {

        it("should call #areEqualContent(elemA, elemB) for every element until false is returned", function() {

          var listA = new NumberList([1, 2, 3]);
          var listB = new NumberList([1, 2, 3]);

          spyOn(valueType, "areEqualContent").and.returnValue(true);

          valueType.areEqualContentElements(listA, listB);

          expect(valueType.areEqualContent).toHaveBeenCalledWith(listA.at(0), listB.at(0));
          expect(valueType.areEqualContent).toHaveBeenCalledWith(listA.at(1), listB.at(1));
          expect(valueType.areEqualContent).toHaveBeenCalledWith(listA.at(2), listB.at(2));
        });

        it("should return true if every element pairs is equals and equals content", function() {

          var listA = new NumberList([1, 2, 3]);
          var listB = new NumberList([1, 2, 3]);

          spyOn(valueType, "areEqualContent").and.returnValue(true);

          var result = valueType.areEqualContentElements(listA, listB);

          expect(result).toBe(true);
        });

        it("should return false if any element pair is not equals or not equals content", function() {

          var listA = new NumberList([1, 2, 3]);
          var listB = new NumberList([1, 2, 3]);

          spyOn(valueType, "areEqualContent")
            .and.returnValue(true)
            .withArgs(listA.at(1), listB.at(1))
            .and.returnValue(false);

          var result = valueType.areEqualContentElements(listA, listB);

          expect(result).toBe(false);
        });
      });
      // endregion

      // region instance spec
      describe("#normalizeInstanceSpec(instSpec)", function() {

        it("should not call _normalizeInstanceSpec if instSpec is nully", function() {

          spyOn(valueType, "_normalizeInstanceSpec");

          valueType.normalizeInstanceSpec(null);

          expect(valueType._normalizeInstanceSpec).not.toHaveBeenCalled();

          valueType.normalizeInstanceSpec(undefined);

          expect(valueType._normalizeInstanceSpec).not.toHaveBeenCalled();
        });

        it("should return null if instSpec is nully", function() {

          spyOn(valueType, "_normalizeInstanceSpec");

          var result = valueType.normalizeInstanceSpec(null);

          expect(result).toBe(null);

          result = valueType.normalizeInstanceSpec(undefined);

          expect(result).toBe(null);
        });

        it("should call _normalizeInstanceSpec if instSpec is not nully", function() {

          spyOn(valueType, "_normalizeInstanceSpec");

          var instSpec = {};

          valueType.normalizeInstanceSpec(instSpec);

          expect(valueType._normalizeInstanceSpec).toHaveBeenCalledWith(instSpec);
        });

        it("should return what _normalizeInstanceSpec returns", function() {

          var normalizedSpec = {};

          spyOn(valueType, "_normalizeInstanceSpec").and.returnValue(normalizedSpec);

          var instSpec = {};

          var result = valueType.normalizeInstanceSpec(instSpec);

          expect(result).toBe(normalizedSpec);
        });
      });

      describe("#_normalizeInstanceSpec(instSpec)", function() {

        it("should return instSpec", function() {
          var instSpec = {};

          var result = valueType.normalizeInstanceSpec(instSpec);

          expect(result).toBe(instSpec);
        });
      });

      describe("#hasNormalizedInstanceSpecKeyData(instSpec)", function() {

        it("should return false", function() {
          var instSpec = {};

          var result = valueType.hasNormalizedInstanceSpecKeyData(instSpec);

          expect(result).toBe(false);
        });
      });
      // endregion
    });

    describe(".extend({...}) returns a value that -", function() {

      var context;
      var Instance;
      var Type;
      var Value;

      beforeEach(function(done) {
        Context.createAsync()
            .then(function(_context) {
              context = _context;
              Instance = context.get("instance");
              Type = Instance.Type;
              Value = context.get("pentaho/type/value");
            })
            .then(done, done.fail);
      });

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
      });

    });

    describe("#$key", function() {
      it("should return the result of toString()", function() {
        var va = new Value();

        spyOn(va, "toString").and.returnValue("FOOO");

        expect(va.$key).toBe("FOOO");
        expect(va.toString).toHaveBeenCalled();
      });
    });

    // region equality
    describe("#equals(other)", function() {

      it("should return `true` if given the same value", function() {
        var va = new Value();

        expect(va.equals(va)).toBe(true);
      });

      it("should return `false` if given a nully value", function() {
        var va = new Value();

        expect(va.equals(null)).toBe(false);
        expect(va.equals(undefined)).toBe(false);
      });

      it("should call #_equals if not the same value and the other is not null", function() {
        var va = new Value();
        var vb = new Value();

        spyOn(va, "_equals").and.returnValue(false);

        expect(va.equals(vb)).toBe(false);
        expect(va._equals).toHaveBeenCalledWith(vb);
      });
    });

    describe("#_equals(other)", function() {

      it("should return `true` if two distinct values have the same constructor and the same key", function() {
        var va = new Value();
        var vb = new Value();

        // Override/Redefine getter property
        Object.defineProperty(va, "key", {value: "A"});
        Object.defineProperty(vb, "key", {value: "A"});

        expect(va.equals(vb)).toBe(true);
      });

      it("should return `false` if two distinct values have different constructors and the same key", function() {
        var Value2 = Value.extend();
        var va = new Value();
        var vb = new Value2();

        // Override/Redefine getter property
        Object.defineProperty(va, "key", {value: "A"});
        Object.defineProperty(vb, "key", {value: "A"});

        expect(va.equals(vb)).toBe(false);
      });

      it("should return `false` if two distinct values have the same constructor and different keys", function() {
        var va = new Value();
        var vb = new Value();

        // Override/Redefine getter property
        Object.defineProperty(va, "$key", {value: "A"});
        Object.defineProperty(vb, "$key", {value: "B"});

        expect(va.equals(vb)).toBe(false);
      });
    });

    describe("#equalsContent(other)", function() {

      it("should return false", function() {

        expect(new Value().equalsContent(null)).toBe(false);
      });
    });
    // endregion

    // region configure
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

      it("should not call #_configure if the given config is this", function() {
        var va = new Value();
        spyOn(va, "_configure");

        var config = va;
        va.configure(config);
        expect(va._configure).not.toHaveBeenCalled();
      });
    });

    describe("#_configure(config)", function() {

      it("should do nothing if type is not read-only", function() {

        var va = new Value();
        va._configure({});
      });

      it("should throw if type is read-only", function() {

        spyOnProperty(Value.type, "isReadOnly", "get").and.returnValue(true);

        var va = new Value();
        expect(function() {
          va._configure({});
        }).toThrowError(TypeError);
      });
    });
    // endregion
  });
});

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
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  describe("pentaho/type/value -", function() {
    var context = new Context();
    var Value = context.get("pentaho/type/value");

    it("should be a function", function() {
      expect(typeof Value).toBe("function");
    });

    it("should be a sub-class of `Instance`", function() {
      var Instance = context.get("instance");

      expect(Value.prototype instanceof Instance).toBe(true);
    });

    describe(".Type -", function() {
      var valueType = Value.type;

      it("should be a function", function() {
        expect(typeof Value.Type).toBe("function");
      });

      it("should be a sub-class of `Type`", function() {
        var Instance = context.get("instance");
        expect(valueType instanceof Instance.Type).toBe(true);
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

      describe("#isAbstract", function() {
        it("should have `isAbstract` equal to `true`", function () {
          expect(valueType.isAbstract).toBe(true);
        });
      }); // end #isAbstract

      describe("_isEqual(va, vb)", function() {

        it("should return `true` if two distinct values have the same constructor and the same key", function() {
          var va = new Value();
          var vb = new Value();

          // Override/Redefine getter property
          Object.defineProperty(va, "key", {value: "A"});
          Object.defineProperty(vb, "key", {value: "A"});

          expect(va.type._isEqual(va, vb)).toBe(true);
        });

        it("should return `false` if two distinct values have different constructors and the same key", function() {
          var Value2 = Value.extend();
          var va = new Value();
          var vb = new Value2();

          // Override/Redefine getter property
          Object.defineProperty(va, "key", {value: "A"});
          Object.defineProperty(vb, "key", {value: "A"});

          expect(va.type._isEqual(va, vb)).toBe(false);
        });

        it("should return `false` if two distinct values have the same constructor and different keys", function() {
          var va = new Value();
          var vb = new Value();

          // Override/Redefine getter property
          Object.defineProperty(va, "$key", {value: "A"});
          Object.defineProperty(vb, "$key", {value: "B"});

          expect(va.type._isEqual(va, vb)).toBe(false);
        });
      });

      describe("_areEqual(va, vb)", function() {

        it("should call va.type._isEqual if va is a Value", function() {
          var Value2 = Value.extend();

          spyOn(Value2.type, "_isEqual").and.returnValue(true);

          var va = new Value2();
          var vb = new Value2();

          Value.type._areEqual(va, vb);

          expect(va.type._isEqual).toHaveBeenCalledWith(va, vb);
        });

        it("should call vb.type._isEqual if va is not a Value but vb is", function() {
          var Value2 = Value.extend();

          spyOn(Value2.type, "_isEqual").and.returnValue(true);

          var va = "A";
          var vb = new Value2();

          Value.type._areEqual(va, vb);

          expect(vb.type._isEqual).toHaveBeenCalledWith(vb, va);
        });

        it("should return false and not call Value.type._isEqual if neither va nor vb are Value instances", function() {

          spyOn(Value.type, "_isEqual").and.returnValue(true);

          var va = "A";
          var vb = "B";

          expect(Value.type._areEqual(va, vb)).toBe(false);

          expect(Value.type._isEqual).not.toHaveBeenCalled();
        });
      });

      describe("areEqual(va, vb)", function() {
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

        it("should return `true` when given the same value instances and not call the _areEqual method", function() {
          var va = new Value();

          spyOn(va.type, "_areEqual").and.callThrough();

          expect(Value.type.areEqual(va, va)).toBe(true);
          expect(va.type._areEqual).not.toHaveBeenCalled();
        });

        it("should call the _areEqual method when given two distinct, non-nully arguments", function() {
          var va = new Value();
          var vb = new Value();

          spyOn(Value.type, "_areEqual").and.callThrough();

          Value.type.areEqual(va, vb);

          expect(Value.type._areEqual).toHaveBeenCalledWith(va, vb);
        });
      }); // end #areEqual
    }); // "Type"

    describe(".extend({...}) returns a value that -", function() {

      var context = new Context(),
          Instance = context.get("instance"),
          Type = Instance.Type,
          Value = context.get("pentaho/type/value");

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

    }); // .extend({...})

    describe("#$key", function() {
      it("should return the result of toString()", function() {
        var va = new Value();

        spyOn(va, "toString").and.returnValue("FOOO");

        expect(va.$key).toBe("FOOO");
        expect(va.toString).toHaveBeenCalled();
      });
    });// end #$key

    describe("#equals", function() {
      it("should return `true` if given the same value", function() {
        var va = new Value();

        expect(va.equals(va)).toBe(true);
      });

      it("should return `false` if given a nully value", function() {
        var va = new Value();

        expect(va.equals(null)).toBe(false);
        expect(va.equals(undefined)).toBe(false);
      });

      it("should call type._isEqual if not the same value and the other is not null", function() {
        var va = new Value();
        var vb = new Value();

        spyOn(va.type, "_isEqual").and.returnValue(false);

        expect(va.equals(vb)).toBe(false);
        expect(va.type._isEqual).toHaveBeenCalledWith(va, vb);
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

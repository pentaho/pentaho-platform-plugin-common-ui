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
  "pentaho/type/SpecificationContext",
  "pentaho/type/Instance",
  "../util/errorMatch"
], function(SpecificationContext, Instance, errorMatch) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, spyOn:false, jasmine:false*/

  describe("pentaho.type.SpecificationContext", function() {

    beforeEach(function() {
      // J.I.C.
      SpecificationContext.current = null;
    });

    afterEach(function() {
      // J.I.C.
      SpecificationContext.current = null;
    });

    describe("#getIdOf(type)", function() {

      it("should return the id of a type that has an id", function() {
        var id = "foo";
        var Derived = Instance.extend({type: {id: id}});
        var context = new SpecificationContext();

        var result = context.getIdOf(Derived.type);

        expect(result).toBe(id);
      });

      it("should return null for a type has no id and hasn't been added to the context", function() {
        var Derived = Instance.extend();
        var context = new SpecificationContext();

        var result = context.getIdOf(Derived.type);

        expect(result).toBe(null);
      });

      it("should not add a type that has no id to the context", function() {
        var Derived = Instance.extend();
        var context = new SpecificationContext();
        context.getIdOf(Derived.type);

        // 2nd time
        var result = context.getIdOf(Derived.type);

        expect(result).toBe(null);
      });

      it("should return the temporary id for a type has no id and was added to the context before", function() {
        var Derived = Instance.extend();
        var context = new SpecificationContext();
        var tempId = context.add(Derived.type);

        var result = context.getIdOf(Derived.type);

        expect(result).toBe(tempId);
      });

      it("should return the same temporary id for the same type, every time", function() {
        var Derived = Instance.extend();
        var context = new SpecificationContext();
        context.add(Derived.type);

        var result1 = context.getIdOf(Derived.type);
        var result2 = context.getIdOf(Derived.type);

        expect(result1).toBe(result2);
      });

      it("should return different temporary ids for different types", function() {
        var Derived1 = Instance.extend();
        var Derived2 = Instance.extend();
        var context = new SpecificationContext();
        context.add(Derived1.type);
        context.add(Derived2.type);

        var result1 = context.getIdOf(Derived1.type);
        var result2 = context.getIdOf(Derived2.type);

        expect(result1).not.toBe(result2);
      });

      it("should return different temporary ids for the same type, in different contexts", function() {
        var Derived1 = Instance.extend();
        var Derived2 = Instance.extend();
        var contextA = new SpecificationContext();
        var contextB = new SpecificationContext();
        contextA.add(Derived1.type);
        contextA.add(Derived2.type);

        contextB.add(Derived2.type);

        var result1 = contextA.getIdOf(Derived2.type);
        var result2 = contextB.getIdOf(Derived2.type);

        expect(result1).not.toBe(result2);
      });
    });

    describe("#add(type)", function() {

      it("should add a type that has an id and return its id", function() {
        var id = "foo";
        var Derived = Instance.extend({type: {id: id}});
        var context = new SpecificationContext();

        var result = context.add(Derived.type);

        expect(result).toBe(id);
      });

      it("should accept adding a type that has an id multiple times, always returning its id", function() {
        var id = "foo";
        var Derived = Instance.extend({type: {id: id}});
        var context = new SpecificationContext();

        var result1 = context.add(Derived.type);
        var result2 = context.add(Derived.type);

        expect(result1).toBe(id);
        expect(result2).toBe(id);
      });

      it("should add a type that has no id and return a temporary id", function() {
        var Derived = Instance.extend();
        var context = new SpecificationContext();

        var result = context.add(Derived.type);

        expect(typeof result).toBe("string");
        expect(result[0]).toBe("_");
      });

      it("should accept adding a type that has no id multiple times, always returning the same temporary id", function() {
        var Derived = Instance.extend();
        var context = new SpecificationContext();

        var result1 = context.add(Derived.type);
        var result2 = context.add(Derived.type);

        expect(result1).toBe(result2);
      });

      it("should assign different temporary ids to different anonymous types", function() {
        var Derived1 = Instance.extend();
        var Derived2 = Instance.extend();
        var context = new SpecificationContext();

        var result1 = context.add(Derived1.type);
        var result2 = context.add(Derived2.type);

        expect(result1).not.toBe(result2);
      });

      it("should return the id returned by get, for the same anonymous type", function() {
        var Derived = Instance.extend();
        var context = new SpecificationContext();

        var result1 = context.add(Derived.type);
        var result2 = context.getIdOf(Derived.type);

        expect(result1).toBe(result2);
      });

      it("should return the id returned by get, for the same named type", function() {
        var id = "foo";
        var Derived = Instance.extend({type: {id: id}});
        var context = new SpecificationContext();

        var result1 = context.add(Derived.type);
        var result2 = context.getIdOf(Derived.type);

        expect(result1).toBe(result2);
      });
    });

    describe("#dispose", function() {

      it("should stop being the ambient context", function() {
        var context = new SpecificationContext();

        SpecificationContext.current = context;

        context.dispose();

        expect(SpecificationContext.current).toBe(null);
      });

      it("should leave any other ambient context untouched", function() {
        var context1 = new SpecificationContext();
        var context2 = new SpecificationContext();

        SpecificationContext.current = context1;

        context2.dispose();

        expect(SpecificationContext.current).toBe(context1);
      });
    });

    describe(".current", function() {

      it("should get the set context", function() {
        var context = new SpecificationContext();

        SpecificationContext.current = context;

        expect(SpecificationContext.current).toBe(context);
      });

      it("should allow resetting with null", function() {
        var context = new SpecificationContext();

        SpecificationContext.current = context;

        SpecificationContext.current = null;

        expect(SpecificationContext.current).toBe(null);
      });

      it("should allow resetting with undefined", function() {
        var context = new SpecificationContext();

        SpecificationContext.current = context;

        SpecificationContext.current = undefined;

        expect(SpecificationContext.current).toBe(null);
      });

      it("should throw if not set to a SpecificationContext", function() {
        expect(function() {
          SpecificationContext.current = {};
        }).toThrow(errorMatch.argInvalidType("current", "pentaho.type.SpecificationContext", "object"));
      });
    });
  });
});
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
  "pentaho/type/Item"
], function(Item) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.Item -", function() {
    it("is a function", function() {
      expect(typeof Item).toBe("function");
    });

    it("should have .Meta as a different function", function() {
      expect(Item).not.toBe(Item.Meta);
      expect(typeof Item.Meta).toBe("function");
    });

    it("should have .meta be Item.Meta#", function() {
      expect(Item.meta).toBe(Item.Meta.prototype);
    });

    describe("extend({...}) -", function() {
      var Derived;
      beforeEach(function() {
        Derived = Item.extend();
      });

      it("should return a function", function() {
        expect(typeof Derived).toBe("function");
      });

      it("should return a sub-class of Item", function() {
        expect(Derived.prototype instanceof Item).toBe(true);
      });

      it("should have .Meta as a function", function() {
        expect(typeof Derived.Meta).toBe("function");
      });

      it("should have .Meta as a sub-class of Item.Meta", function() {
        expect(Derived.Meta.prototype instanceof Item.Meta).toBe(true);
      });

      it("should have .meta be Derived.Meta#", function() {
        expect(Derived.meta).toBe(Derived.Meta.prototype);
      });

    }); // extend({...})


    describe("get/set meta of a derived class - ", function() {
      var Derived;
      beforeEach(function() {
        Derived = Item.extend({meta: {"someAttribute": "someValue"}});
      });

      it("setting a falsy meta has no consequence", function() {
        ["", null, undefined, false, 0, {}].forEach(function(meta) {
          Derived.meta = meta;
          var item = new Derived();
          expect(item.meta.someAttribute).toBe("someValue");
        });
      });

      it("allows setting a .meta property", function() {
        Derived.meta = {"someAttribute": "someOtherValue"};
        expect(Derived.Meta.someAttribute).toBe("someOtherValue");
      });

    });

    describe("get/set meta of an instance - ", function() {
      var item;
      beforeEach(function() {
        item = new Item();
      });

      it("sets/gets some meta attribute correctly", function() {
        expect(item.meta.someAttribute).toBeUndefined();
        item.meta = {someAttribute: "someValue"};
        expect(item.meta.someAttribute).toBe("someValue");
      });

      it("setting meta to a falsy value has no consequence", function() {
        ["", null, undefined, false, 0].forEach(function(value) {
          item.meta = value;
          expect(item.meta).not.toBeFalsy();
        });
      });

      it("setting meta to an empty object has no consequence", function() {
        var id = item.meta.id;
        item.meta = {};
        expect(item.meta).not.toBeFalsy();
        expect(item.meta.id).toBe(id);
      });
    });

    describe("#extendProto -", function() {
      var derivedProto;
      beforeEach(function() {
        derivedProto = Item.extendProto(null, {}, {});
      });

      it("derived classes have the proper 'ancestor'", function() {
        expect(derivedProto.meta).not.toBe(Item.meta);
        expect(derivedProto.meta.ancestor).toBe(Item.meta);
        expect(derivedProto.meta.is(Item)).toBe(false);
      });

      it("can be invoked without arguments", function() {
        expect(Item.extendProto().meta.ancestor).toBe(Item.meta);
        expect(Item.extendProto(null).meta.ancestor).toBe(Item.meta);
        expect(Item.extendProto(null, {}).meta.ancestor).toBe(Item.meta);
      });

      it("does not return a constructor", function() {
        expect(typeof derivedProto).not.toBe("function");
      });

      it("returns an instance whose constructor is the same as the extended class", function() {
        expect(derivedProto.constructor).toBe(Item);
        expect(derivedProto.constructor).toBe(Item.prototype.constructor);
        expect(derivedProto instanceof Item).toBe(true);
      });

      it("accepts keyArgs", function() {
        var Derived = Item.extendProto(null, {}, {
          isRoot: true
        });
        expect(Item.meta.isRoot).toBe(false);
        expect(Derived.meta.isRoot).toBe(true);
      });

    });

  }); // pentaho/type/Item
});

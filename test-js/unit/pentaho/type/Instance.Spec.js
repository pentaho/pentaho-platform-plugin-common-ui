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
  "pentaho/type/Instance"
], function(Instance) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var Type = Instance.Type;

  describe("pentaho.type.Instance -", function() {
    it("is a function", function() {
      expect(typeof Instance).toBe("function");
    });

    it("should have .Type as a different function", function() {
      expect(Instance).not.toBe(Type);
      expect(typeof Type).toBe("function");
    });

    it("should have .type be Type#", function() {
      expect(Instance.type).toBe(Type.prototype);
    });

    describe("extend({...}) -", function() {
      var Derived;
      beforeEach(function() {
        Derived = Instance.extend();
      });

      it("should return a function", function() {
        expect(typeof Derived).toBe("function");
      });

      it("should return a sub-class of Instance", function() {
        expect(Derived.prototype instanceof Instance).toBe(true);
      });

      it("should have .Type as a function", function() {
        expect(typeof Derived.Type).toBe("function");
      });

      it("should have .Type as a sub-class of Type", function() {
        expect(Derived.Type.prototype instanceof Type).toBe(true);
      });

      it("should have .type be Derived.Type#", function() {
        expect(Derived.type).toBe(Derived.Type.prototype);
      });

    }); // extend({...})


    describe("get/set type of a derived class - ", function() {
      var Derived;
      beforeEach(function() {
        Derived = Instance.extend({type: {"someAttribute": "someValue"}});
      });

      it("setting a falsy type has no consequence", function() {
        ["", null, undefined, false, 0, {}].forEach(function(type) {
          Derived.type = type;
          var inst = new Derived();
          expect(inst.type.someAttribute).toBe("someValue");
        });
      });

      it("allows setting a .type property", function() {
        Derived.type = {"someAttribute": "someOtherValue"};
        expect(Derived.Type.someAttribute).toBe("someOtherValue");
      });

    });

    describe("get/set type of an instance - ", function() {
      var inst;
      beforeEach(function() {
        inst = new Instance();
      });

      it("sets/gets some type attribute correctly", function() {
        expect(inst.type.someAttribute).toBeUndefined();
        inst.type = {someAttribute: "someValue"};
        expect(inst.type.someAttribute).toBe("someValue");
      });

      it("setting type to a falsy value has no consequence", function() {
        ["", null, undefined, false, 0].forEach(function(value) {
          inst.type = value;
          expect(inst.type).not.toBeFalsy();
        });
      });

      it("setting type to an empty object has no consequence", function() {
        var id = inst.type.id;
        inst.type = {};
        expect(inst.type).not.toBeFalsy();
        expect(inst.type.id).toBe(id);
      });
    });

    describe("#extendProto -", function() {
      var derivedProto;
      beforeEach(function() {
        derivedProto = Instance.extendProto(null, {}, {});
      });

      it("derived classes have the proper 'ancestor'", function() {
        expect(derivedProto.type).not.toBe(Instance.type);
        expect(derivedProto.type.ancestor).toBe(Instance.type);
        expect(derivedProto.type.is(Instance)).toBe(false);
      });

      it("can be invoked without arguments", function() {
        expect(Instance.extendProto().type.ancestor).toBe(Instance.type);
        expect(Instance.extendProto(null).type.ancestor).toBe(Instance.type);
        expect(Instance.extendProto(null, {}).type.ancestor).toBe(Instance.type);
      });

      it("does not return a constructor", function() {
        expect(typeof derivedProto).not.toBe("function");
      });

      it("returns an instance whose constructor is the same as the extended class", function() {
        expect(derivedProto.constructor).toBe(Instance);
        expect(derivedProto.constructor).toBe(Instance.prototype.constructor);
        expect(derivedProto instanceof Instance).toBe(true);
      });

      it("accepts keyArgs", function() {
        var Derived = Instance.extendProto(null, {}, {
          isRoot: true
        });
        expect(Instance.type.isRoot).toBe(false);
        expect(Derived.type.isRoot).toBe(true);
      });

    });

  }); // pentaho/type/Instance
});

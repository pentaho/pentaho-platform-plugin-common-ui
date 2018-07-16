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
  "pentaho/type/Instance"
], function(Instance) {

  "use strict";

  /* eslint max-nested-callbacks: 0 */

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

    describe(".extend({...}) -", function() {

      it("should return a function", function() {
        var Derived = Instance.extend();
        expect(typeof Derived).toBe("function");
      });

      it("should return a sub-class of Instance", function() {
        var Derived = Instance.extend();
        expect(Derived.prototype instanceof Instance).toBe(true);
      });

      it("should have .Type as a function", function() {
        var Derived = Instance.extend();
        expect(typeof Derived.Type).toBe("function");
      });

      it("should have .Type as a sub-class of Type", function() {
        var Derived = Instance.extend();
        expect(Derived.Type.prototype instanceof Type).toBe(true);
      });

      it("should have .type be DerivedType#", function() {
        var Derived = Instance.extend();
        expect(Derived.type).toBe(Derived.Type.prototype);
      });

      it("should accept a given name", function() {
        var Derived = Instance.extend("foo");
        expect(Derived.name || Derived.displayName).toBe("foo");
      });

      it("should set the corresponding type constructor name by suffixing '.Type' to the name " +
         "of the instance constructor", function() {
        var Derived = Instance.extend("foo");
        expect(Derived.Type.name || Derived.Type.displayName).toBe("foo.Type");
      });

      it("should have name receive the type `id` when name is not specified", function() {
        var Derived = Instance.extend({$type: {id: "foo"}});
        expect(Derived.name || Derived.displayName).toBe("foo");
      });

      it("should set the corresponding type constructor name by suffixing '.Type' when " +
          "the name name of the instance constructor is defaulted from the id", function() {
        var Derived = Instance.extend({$type: {id: "foo"}});
        expect(Derived.Type.name || Derived.Type.displayName).toBe("foo.Type");
      });

      it("should have name receive the type's `sourceId` when name is not specified", function() {
        var Derived = Instance.extend({$type: {sourceId: "foo"}});
        expect(Derived.name || Derived.displayName).toBe("foo");
      });

      it("should respect name when specified and not use the type's `id` or `sourceId`", function() {
        var Derived = Instance.extend("foo", {$type: {id: "bar"}});

        expect(Derived.name || Derived.displayName).toBe("foo");

        // ----

        Derived = Instance.extend("foo", {$type: {sourceId: "bar"}});

        expect(Derived.name || Derived.displayName).toBe("foo");
      });

      it("should allow a type factory module id to default the type name", function() {
        var Derived = Instance.extend({$type: {id: "my/special/Model"}});
        expect(Derived.name || Derived.displayName).toBe("my.special.Model");
      });
    });

    describe("get/set type of an instance - ", function() {

      var inst;

      beforeEach(function() {
        inst = new Instance();
      });

      it("sets/gets some type attribute correctly", function() {
        expect(inst.$type.someAttribute).toBeUndefined();
        inst.$type = {someAttribute: "someValue"};
        expect(inst.$type.someAttribute).toBe("someValue");
      });

      it("setting type to a falsy value has no consequence", function() {
        ["", null, undefined, false, 0].forEach(function(value) {
          inst.$type = value;
          expect(inst.$type).not.toBeFalsy();
        });
      });

      it("setting type to an empty object has no consequence", function() {
        var id = inst.$type.id;
        inst.$type = {};
        expect(inst.$type).not.toBeFalsy();
        expect(inst.$type.id).toBe(id);
      });
    });
  });
});

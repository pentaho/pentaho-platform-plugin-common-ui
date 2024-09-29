/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

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

    describe(".configure(spec)", function() {

      it("should call implement with the given spec", function() {

        var Derived = Instance.extend();

        Derived.implement = jasmine.createSpy("Derived.implement").and.callFake(function() {
          return this;
        });

        var config = {};
        var result = Derived.configure(config);

        expect(Derived.implement).toHaveBeenCalledTimes(1);
        expect(Derived.implement).toHaveBeenCalledWith(config);
        expect(result).toBe(Derived);
      });

      it("should call implement with undefined when the type is anonymous and spec is not specified", function() {

        var Derived = Instance.extend();

        Derived.implement = jasmine.createSpy("Derived.implement").and.callFake(function() {
          return this;
        });

        var result = Derived.configure();

        expect(Derived.implement).toHaveBeenCalledTimes(1);
        expect(Derived.implement).toHaveBeenCalledWith(undefined);
        expect(result).toBe(Derived);
      });

      describe("when called with no arguments", function() {
        var localRequire;
        var WithConfig;
        var WithoutConfig;

        beforeEach(function() {
          localRequire = require.new();

          localRequire.define("test/withConfig", [
            "pentaho/module!_",
            "pentaho/type/Instance"
          ], function(module, Instance) {

            var WithConfig = Instance.extend({
              $type: {
                id: module.id
              }
            });

            WithConfig.implement = jasmine.createSpy("WithConfig.implement").and.callFake(function() {
              return this;
            });

            return WithConfig;
          });

          localRequire.define("test/withoutConfig", [
            "pentaho/module!_",
            "pentaho/type/Instance"
          ], function(module, Instance) {

            var WithoutConfig = Instance.extend({
              $type: {
                id: module.id
              }
            });

            WithoutConfig.implement = jasmine.createSpy("WithoutConfig.implement").and.callFake(function() {
              return this;
            });

            return WithoutConfig;
          });

          localRequire.config({
            config: {
              "pentaho/modules": {
                "test/withConfig": {
                  config: {
                    "a": "a"
                  }
                }
              }
            }
          });

          return localRequire.promise([
            "test/withConfig",
            "test/withoutConfig"
          ])
          .then(function(deps) {
            WithConfig = deps[0];
            WithoutConfig = deps[1];
          });
        });

        afterEach(function() {
          localRequire.dispose();
        });

        it("should use the existing module's configuration when it is not anonymous", function() {

          var result = WithConfig.configure();

          expect(WithConfig.implement).toHaveBeenCalledTimes(1);
          expect(WithConfig.implement).toHaveBeenCalledWith({$type: {"a": "a"}});
          expect(result).toBe(WithConfig);
        });

        it("should use null when a non-anonymous module has no configuration", function() {

          var result = WithoutConfig.configure();

          expect(WithoutConfig.implement).toHaveBeenCalledTimes(1);
          expect(WithoutConfig.implement).toHaveBeenCalledWith(null);
          expect(result).toBe(WithoutConfig);
        });
      });
    });
  });
});

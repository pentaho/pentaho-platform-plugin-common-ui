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
  "pentaho/_core/module/InstanceMeta",
  "pentaho/lang/Base",
  "pentaho/shim/es6-promise"
], function(instanceMetaFactory, Base) {

  "use strict";

  describe("pentaho._core.module.InstanceMeta", function() {

    var id = "test/foo/bar";
    var typeId = "test/foo/bar/type";
    var type2Id = "test/foo/bar/type2";

    var ModuleMeta = Base.extend({
      constructor: function(id) {
        this.id = id;
      }
    });

    var typeMeta;
    var moduleResolver;
    var InstanceMeta;

    beforeEach(function() {
      typeMeta = createTypeMetaMock(typeId);
      moduleResolver = createModuleResolver(typeMeta);
      InstanceMeta = instanceMetaFactory(createCoreMock());
    });

    function createCoreMock() {
      return {
        ModuleMeta: ModuleMeta
      };
    }

    function createTypeMetaMock(id) {
      var typeMeta = jasmine.createSpyObj("typeMeta", ["__addInstance", "isSubtypeOf"]);
      typeMeta.id = id;
      typeMeta.isSubtypeOf.and.callFake(function(other) {
        return this === other || this.ancestor === other;
      });

      return typeMeta;
    }

    function createModuleResolver(typeMeta) {
      return jasmine.createSpy("moduleResolver").and.returnValue(typeMeta);
    }

    describe("new InstanceMeta(id, spec, moduleResolver)", function() {

      // Calls base class test.
      it("should call the base constructor", function() {
        var spec = {type: typeId};

        InstanceMeta.prototype.base = jasmine.createSpy("base");

        var meta = new InstanceMeta(id, spec, moduleResolver);

        expect(InstanceMeta.prototype.base).toHaveBeenCalledTimes(1);
        expect(InstanceMeta.prototype.base).toHaveBeenCalledWith(id, spec, moduleResolver);
      });

      // ---

      it("should allow `spec.type` not to be specified", function() {
        var spec = {};

        var meta = new InstanceMeta(id, spec, moduleResolver);

        expect(meta.type).toBe(null);
      });

      it("should resolve the specified `spec.type` value", function() {
        var spec = {type: typeId};
        var meta = new InstanceMeta(id, spec, moduleResolver);

        expect(moduleResolver).toHaveBeenCalledTimes(1);
        expect(moduleResolver).toHaveBeenCalledWith(typeId, "type");
      });

      it("should expose the resolved `spec.type` value", function() {
        var spec = {type: typeId};
        var meta = new InstanceMeta(id, spec, moduleResolver);

        expect(meta.type).toBe(typeMeta);
      });

      it("should call the resolved type's __addInstance method", function() {
        var spec = {type: typeId};
        var meta = new InstanceMeta(id, spec, moduleResolver);

        expect(typeMeta.__addInstance).toHaveBeenCalledTimes(1);
        expect(typeMeta.__addInstance).toHaveBeenCalledWith(meta);
      });
    });

    describe("#kind", function() {
      it("should have value `instance`", function() {
        var spec = {type: typeId};
        var meta = new InstanceMeta(id, spec, moduleResolver);

        expect(meta.kind).toBe("instance");
      });
    });

    describe("#isInstanceOf(typeMeta)", function() {

      it("should return true when given its type", function() {
        var spec = {type: typeId};
        var meta = new InstanceMeta(id, spec, moduleResolver);

        expect(meta.isInstanceOf(typeMeta)).toBe(true);
      });

      it("should return true when given its type's base type", function() {
        var spec = {type: typeId};
        var meta = new InstanceMeta(id, spec, moduleResolver);

        var type2Meta = createTypeMetaMock(type2Id);
        typeMeta.ancestor = type2Meta;

        expect(meta.isInstanceOf(type2Meta)).toBe(true);
      });

      it("should return false when given an unrelated type", function() {
        var spec = {type: typeId};
        var meta = new InstanceMeta(id, spec, moduleResolver);

        var type2Meta = createTypeMetaMock(type2Id);

        expect(meta.isInstanceOf(type2Meta)).toBe(false);
      });
    });
  });
});

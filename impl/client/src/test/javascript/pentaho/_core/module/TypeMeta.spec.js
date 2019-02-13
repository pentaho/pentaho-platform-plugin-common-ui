/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/_core/module/TypeMeta",
  "pentaho/lang/Base",
  "pentaho/shim/es6-promise"
], function(typeMetaFactory, Base) {

  "use strict";

  describe("pentaho._core.module.TypeMeta", function() {

    var id = "test/foo/bar";
    var baseTypeId = "test/foo/abc";

    var ModuleMeta = Base.extend({
      constructor: function(id) {
        this.id = id;
        this._isValueLoaded = false;
      },

      get isLoaded() {
        return this._isValueLoaded;
      }
    });

    var baseTypeMeta;
    var moduleResolver;
    var TypeMeta;

    beforeEach(function() {
      baseTypeMeta = createTypeMetaMock(baseTypeId);
      moduleResolver = createModuleResolver(baseTypeMeta);
      TypeMeta = typeMetaFactory(createCoreMock());
    });

    function createCoreMock() {
      return {
        ModuleMeta: ModuleMeta
      };
    }

    function createTypeMetaMock(id) {
      var typeMeta = jasmine.createSpyObj("baseTypeMeta", ["__addSubtype"]);
      typeMeta.id = id;
      return typeMeta;
    }

    function createInstanceMetaMock(id) {
      var instanceMeta = {};
      instanceMeta.id = id;
      return instanceMeta;
    }

    function createModuleResolver(typeMeta) {
      return jasmine.createSpy("moduleResolver").and.callFake(function(id) {
        if(id === typeMeta.id) return typeMeta;
        throw new Error("Unexpected type id '" + id + "'.");
      });
    }

    describe("new TypeMeta(id, spec, moduleResolver)", function() {

      // Calls base class test.
      it("should call the base constructor", function() {
        var spec = {ancestor: baseTypeId};

        TypeMeta.prototype.base = jasmine.createSpy("base");

        var meta = new TypeMeta(id, spec, moduleResolver);

        expect(TypeMeta.prototype.base).toHaveBeenCalledTimes(1);
        expect(TypeMeta.prototype.base).toHaveBeenCalledWith(id, spec, moduleResolver);
      });

      // ---

      describe("#ancestor", function() {

        it("should default ancestor to null if neither `spec.ancestor` or `spec.base` are specified", function() {
          var spec = {};

          var meta = new TypeMeta(id, spec, moduleResolver);

          expect(meta.ancestor).toBe(null);
        });

        it("should resolve the specified `spec.ancestor` value", function() {
          var spec = {ancestor: baseTypeId};
          var meta = new TypeMeta(id, spec, moduleResolver);

          expect(moduleResolver).toHaveBeenCalledTimes(1);
          expect(moduleResolver).toHaveBeenCalledWith(baseTypeId, "type");
        });

        it("should expose the resolved `spec.ancestor` value", function() {
          var spec = {ancestor: baseTypeId};
          var meta = new TypeMeta(id, spec, moduleResolver);

          expect(meta.ancestor).toBe(baseTypeMeta);
        });

        it("should ignore `spec.base` if `spec.ancestor` is specified", function() {
          var spec = {base: "missing", ancestor: baseTypeId};

          var meta = new TypeMeta(id, spec, moduleResolver);

          expect(meta.ancestor).toBe(baseTypeMeta);
        });

        it("should resolve `spec.base` if `spec.ancestor` is not specified", function() {
          var spec = {base: baseTypeId};

          var meta = new TypeMeta(id, spec, moduleResolver);

          expect(meta.ancestor).toBe(baseTypeMeta);
        });

        it("should call the resolved ancestor type's __addSubtype method", function() {
          var spec = {ancestor: baseTypeId};
          var meta = new TypeMeta(id, spec, moduleResolver);

          expect(baseTypeMeta.__addSubtype).toHaveBeenCalledTimes(1);
          expect(baseTypeMeta.__addSubtype).toHaveBeenCalledWith(meta);
        });
      });
    });

    describe("#kind", function() {
      it("should have value `type`", function() {
        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        expect(meta.kind).toBe("type");
      });
    });

    describe("#subtypes", function() {

      it("should default to an empty list", function() {

        var spec = {};
        var meta = new TypeMeta(id, spec, moduleResolver);

        expect(meta.subtypes).toEqual([]);
      });

      it("should contain the existing subtypes", function() {

        var spec = {};
        var meta = new TypeMeta(id, spec, moduleResolver);

        moduleResolver = createModuleResolver(meta);

        spec = {ancestor: id};
        var subMeta1 = new TypeMeta(id + "/child1", spec, moduleResolver);

        spec = {ancestor: id};
        var subMeta2 = new TypeMeta(id + "/child2", spec, moduleResolver);

        expect(meta.subtypes).toEqual([subMeta1, subMeta2]);
      });
    });

    describe("#instances", function() {

      it("should default to an empty list", function() {

        var spec = {};
        var meta = new TypeMeta(id, spec, moduleResolver);

        expect(meta.instances).toEqual([]);
      });

      it("should contain the existing instances", function() {

        var spec = {};
        var meta = new TypeMeta(id, spec, moduleResolver);

        moduleResolver = createModuleResolver(meta);

        var instanceMeta1 = createInstanceMetaMock(id + "/inst1");
        var instanceMeta2 = createInstanceMetaMock(id + "/inst2");

        meta.__addInstance(instanceMeta1);
        meta.__addInstance(instanceMeta2);

        expect(meta.instances).toEqual([instanceMeta1, instanceMeta2]);
      });
    });
  });
});

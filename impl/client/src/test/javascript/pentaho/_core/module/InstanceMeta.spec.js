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
  "pentaho/_core/module/InstanceMeta",
  "pentaho/lang/Base",
  "pentaho/shim/es6-promise"
], function(instanceMetaFactory, Base) {

  "use strict";

  describe("pentaho._core.module.InstanceMeta", function() {

    var id = "test/foo/bar";
    var typeId = "test/foo/bar/type";

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
      var typeMeta = jasmine.createSpyObj("typeMeta", ["__addInstance"]);
      typeMeta.id = id;
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
  });
});

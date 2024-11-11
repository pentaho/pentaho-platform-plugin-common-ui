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
        this.isPrepared = false;
      },

      get isLoaded() {
        return this._isValueLoaded;
      },

      prepareAsync: function() {

        return this._prepareCoreAsync();
      },

      _prepareCoreAsync: function() {

        return Promise.resolve().then(function() {
          this.isPrepared = true;
        }.bind(this));
      },

      hasAnnotation: function(annotationId, keyArgs) {

        return this._hasAnnotationCore(annotationId, keyArgs);
      },

      __hasAnnotationResult: false,

      _hasAnnotationCore: function() {
        return this.__hasAnnotationResult;
      },

      getAnnotation: function(annotationId, keyArgs) {

        var annotationResult = this._getAnnotationResult(annotationId, keyArgs);
        if(annotationResult == null) {
          return null;
        }

        if(annotationResult.error !== null) {
          throw annotationResult.error;
        }

        return annotationResult.value;
      },

      __annotationResult: null,

      _getAnnotationResult: function() {
        return this.__annotationResult;
      },

      getAnnotationAsync: function(Annotation, keyArgs) {
        return Promise.resolve(this._getAnnotationCoreAsync(Annotation, Annotation.id, keyArgs));
      },

      __getAnnotationAsyncResult: null,

      _getAnnotationCoreAsync: function(Annotation, annotationId, keyArgs) {
        return this.__getAnnotationAsyncResult;
      },

      __getAnnotationsIdsResult: null,

      getAnnotationsIds: function(keyArgs) {
        return this.__getAnnotationsIdsResult;
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

      var core = {
        configService: jasmine.createSpyObj("configService", [
          "selectAsync",
          "getAnnotationsIds",
          "hasAnnotation"
        ]),
        ModuleMeta: ModuleMeta
      };

      return core;
    }

    function createTypeMetaMock(id) {
      var typeMeta = jasmine.createSpyObj("typeMeta", ["__addSubtype", "isSubtypeOf"]);
      typeMeta.id = id;
      typeMeta.ancestor = null;

      typeMeta.isSubtypeOf.and.callFake(function(other) {
        return this === other || this.ancestor === other;
      });
      return typeMeta;
    }

    function createInstanceMetaMock(id) {
      var instanceMeta = {};
      instanceMeta.id = id;
      return instanceMeta;
    }

    function createModuleResolver(typeMeta) {
      return jasmine.createSpy("moduleResolver").and.callFake(function(id) {
        if(typeMeta && id === typeMeta.id) return typeMeta;
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

    describe("#isSubtypeOf(baseTypeMeta)", function() {

      it("should return true when given itself", function() {
        var spec = {};
        var meta = new TypeMeta(id, spec, moduleResolver);

        expect(meta.isSubtypeOf(meta)).toBe(true);
      });

      it("should return true when given its base type", function() {

        baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        expect(meta.isSubtypeOf(baseTypeMeta)).toBe(true);
      });

      it("should return false when given an unrelated type", function() {
        var otherTypeMeta = new TypeMeta("test/foo/bar/other", {}, createModuleResolver(null));

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        expect(meta.isSubtypeOf(otherTypeMeta)).toBe(false);
      });
    });

    describe("#prepareAsync()", function() {

      it("should prepare ancestor types", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        return meta.prepareAsync().then(function() {

          expect(meta.isPrepared).toBe(true);
          expect(baseTypeMeta.isPrepared).toBe(true);
        });
      });
    });

    describe("#hasAnnotation(annotationId, {inherit})", function() {

      it("should not call ancestor if annotation exists locally", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta._hasAnnotationCore = jasmine.createSpy("hasAnnotationCore");
        meta.__hasAnnotationResult = true;

        var result = meta.hasAnnotation("foo");

        expect(result).toBe(true);
        expect(baseTypeMeta._hasAnnotationCore).not.toHaveBeenCalled();
      });

      it("should not call ancestor if annotation does not exist locally and inherit is false", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta._hasAnnotationCore = jasmine.createSpy("hasAnnotationCore");

        var result = meta.hasAnnotation("foo");

        expect(result).toBe(false);
        expect(baseTypeMeta._hasAnnotationCore).not.toHaveBeenCalled();
      });

      it("should call ancestor if annotation does not exist locally and inherit is true", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta.__hasAnnotationResult = true;
        meta.__hasAnnotationResult = false;

        var result = meta.hasAnnotation("foo", {inherit: true});

        expect(result).toBe(true);
      });

      it("should not call ancestor if there is no ancestor and annotation does not exist locally " +
        "and inherit is true", function() {

        var moduleResolver = createModuleResolver(null);
        var spec = {ancestor: null};
        var meta = new TypeMeta(id, spec, moduleResolver);

        meta.__hasAnnotationResult = false;

        var result = meta.hasAnnotation("foo", {inherit: true});

        expect(result).toBe(false);
      });
    });

    describe("#getAnnotation(annotationId, {inherit})", function() {

      it("should not call ancestor if annotation exists locally", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta._getAnnotationResult = jasmine.createSpy("_getAnnotationResult").and.returnValue(null);
        meta.__annotationResult = {value: "a", error: null};

        var result = meta.getAnnotation("foo");

        expect(result).toBe("a");
        expect(baseTypeMeta._getAnnotationResult).not.toHaveBeenCalled();
      });

      it("should not call ancestor if annotation does not exist locally and inherit is false", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta._getAnnotationResult = jasmine.createSpy("_getAnnotationResult").and.returnValue(null);
        meta.__annotationResult = null;

        var result = meta.getAnnotation("foo");

        expect(result).toBe(null);
        expect(baseTypeMeta._getAnnotationResult).not.toHaveBeenCalled();
      });

      it("should call ancestor if annotation does not exist locally and inherit is true", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta._getAnnotationResult = jasmine.createSpy("_getAnnotationResult")
          .and.returnValue({value: "a", error: null});
        meta.__annotationResult = null;

        var result = meta.getAnnotation("foo", {inherit: true});

        expect(result).toBe("a");
        expect(baseTypeMeta._getAnnotationResult).toHaveBeenCalled();
      });
    });

    describe("#getAnnotationAsync(annotationId, {inherit})", function() {

      it("should not call ancestor if annotation exists locally", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);
        var annotation = {};

        baseTypeMeta._getAnnotationCoreAsync = jasmine.createSpy("_getAnnotationCoreAsync").and.returnValue(null);
        meta.__getAnnotationAsyncResult = Promise.resolve(annotation);

        var Annotation = {id: "foo"};

        return meta.getAnnotationAsync(Annotation).then(function(result) {
          expect(result).toBe(annotation);
          expect(baseTypeMeta._getAnnotationCoreAsync).not.toHaveBeenCalled();
        });
      });

      it("should not call ancestor if annotation does not exist locally and inherit is false", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta._getAnnotationCoreAsync = jasmine.createSpy("_getAnnotationCoreAsync").and.returnValue(null);
        meta.__getAnnotationAsyncResult = null;

        var Annotation = {id: "foo"};

        return meta.getAnnotationAsync(Annotation).then(function(result) {
          expect(result).toBe(null);
          expect(baseTypeMeta._getAnnotationCoreAsync).not.toHaveBeenCalled();
        });
      });

      it("should call ancestor if annotation does not exist locally and inherit is true", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);
        var annotation = {};

        baseTypeMeta._getAnnotationCoreAsync = jasmine.createSpy("_getAnnotationCoreAsync")
          .and.returnValue(Promise.resolve(annotation));

        meta.__getAnnotationAsyncResult = null;

        var Annotation = {id: "foo"};

        return meta.getAnnotationAsync(Annotation, {inherit: true}).then(function(result) {
          expect(result).toBe(annotation);
          expect(baseTypeMeta._getAnnotationCoreAsync).toHaveBeenCalled();
        });
      });
    });

    describe("#getAnnotationsIds({inherit})", function() {

      it("should not call ancestor if inherit is false and there are no local annotations", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta.getAnnotationsIds = jasmine.createSpy("getAnnotationsIds").and.returnValue(null);
        meta.__getAnnotationsIdsResult = null;

        var result = meta.getAnnotationsIds();
        expect(result).toBe(null);
        expect(baseTypeMeta.getAnnotationsIds).not.toHaveBeenCalled();
      });

      it("should not call ancestor if inherit is false and there are local annotations", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta.getAnnotationsIds = jasmine.createSpy("getAnnotationsIds").and.returnValue(null);
        meta.__getAnnotationsIdsResult = ["a"];

        var result = meta.getAnnotationsIds();
        expect(result).toEqual(["a"]);
        expect(baseTypeMeta.getAnnotationsIds).not.toHaveBeenCalled();
      });

      it("should call ancestor if inherit is true", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta.getAnnotationsIds = jasmine.createSpy("getAnnotationsIds").and.returnValue(null);
        meta.__getAnnotationsIdsResult = null;

        var result = meta.getAnnotationsIds({inherit: true});
        expect(result).toEqual(null);
        expect(baseTypeMeta.getAnnotationsIds).toHaveBeenCalled();
      });

      it("should call ancestor if inherit is true and there are local annotations but not inherited", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta.getAnnotationsIds = jasmine.createSpy("getAnnotationsIds").and.returnValue(null);
        meta.__getAnnotationsIdsResult = ["a"];

        var result = meta.getAnnotationsIds({inherit: true});
        expect(result).toEqual(["a"]);
        expect(baseTypeMeta.getAnnotationsIds).toHaveBeenCalled();
      });

      it("should call ancestor if inherit is true and there are no local annotations but inherited yes", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta.getAnnotationsIds = jasmine.createSpy("getAnnotationsIds").and.returnValue(["b"]);
        meta.__getAnnotationsIdsResult = null;

        var result = meta.getAnnotationsIds({inherit: true});
        expect(result).toEqual(["b"]);
        expect(baseTypeMeta.getAnnotationsIds).toHaveBeenCalled();
      });

      it("should call ancestor if inherit is true and there are local and inherited annotations", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta.getAnnotationsIds = jasmine.createSpy("getAnnotationsIds").and.returnValue(["b"]);
        meta.__getAnnotationsIdsResult = ["a"];

        var result = meta.getAnnotationsIds({inherit: true});
        expect(result).toEqual(["a", "b"]);
        expect(baseTypeMeta.getAnnotationsIds).toHaveBeenCalled();
      });

      it("should remove duplicate inherited values", function() {

        var baseTypeMeta = new TypeMeta(baseTypeId, {}, createModuleResolver(null));
        moduleResolver = createModuleResolver(baseTypeMeta);

        var spec = {ancestor: baseTypeId};
        var meta = new TypeMeta(id, spec, moduleResolver);

        baseTypeMeta.getAnnotationsIds = jasmine.createSpy("getAnnotationsIds").and.returnValue(["b", "a"]);
        meta.__getAnnotationsIdsResult = ["a"];

        var result = meta.getAnnotationsIds({inherit: true});
        expect(result).toEqual(["a", "b"]);
        expect(baseTypeMeta.getAnnotationsIds).toHaveBeenCalled();
      });
    });
  });
});

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
  "pentaho/shim/es6-promise"
], function() {

  "use strict";

  var RULESET_TYPE_ID = "pentaho/config/spec/IRuleSet";
  var EXTERNAL_CONFIG_ANNOTATION_ID = "pentaho/config/ExternalAnnotation";

  describe("pentaho._core.Core", function() {

    var localRequire;

    beforeEach(function() {
      localRequire = require.new();
    });

    afterEach(function() {
      localRequire.dispose();
    });

    // region Mocks
    function moduleMetaFactoryMock(core) {

      function Meta(id, spec) {
        this.id = id;
        this.alias = spec.alias;
        this.isVirtual = !!spec.isVirtual;
        this.__index = spec.index;
        this.ranking = spec.ranking || 0;
        this.__configSpec = spec.config || null;
      }

      Meta.prototype.getAnnotationsIds = jasmine.createSpy("getAnnotationsIds").and.returnValue(null);
      Meta.prototype.loadAsync = jasmine.createSpy("loadAsync").and.returnValue(Promise.resolve(null));
      Meta.prototype.__loadAnnotationsAsync = function(annotationIds) {

        var module = this;

        return Promise.all(annotationIds.map(function(annotationId) {
          return core.moduleMetaService.get(annotationId).loadAsync()
            .then(function(Annotation) {
              return module.getAnnotationAsync(Annotation);
            });
        }));
      };
      Meta.prototype.isSubtypeOf = jasmine.createSpy("isSubtypeOf").and.returnValue(false);
      Meta.prototype.isInstanceOf = jasmine.createSpy("isSubtypeOf").and.returnValue(false);

      return Meta;
    }

    function moduleTypeMetaFactoryMock(core) {

      function TypeMeta(id, spec, moduleResolver) {

        core.ModuleMeta.call(this, id, spec);

        this.kind = "type";

        var ancestorId = spec.ancestor || spec.base || null;
        this.ancestor = ancestorId ? moduleResolver(ancestorId, "type") : null;
        this.subtypes = [];
        this.instances = [];

        if(this.ancestor) {
          this.ancestor.subtypes.push(this);
        }
      }

      TypeMeta.prototype = Object.create(core.ModuleMeta.prototype);
      TypeMeta.prototype.constructor = TypeMeta;

      return TypeMeta;
    }

    function moduleInstanceMetaFactoryMock(core) {

      function InstanceMeta(id, spec, moduleResolver) {

        core.ModuleMeta.call(this, id, spec);

        this.kind = "instance";
        this.type = spec.type ? moduleResolver(spec.type, "type") : null;
        if(this.type) {
          this.type.instances.push(this);
        }
      }

      return InstanceMeta;
    }

    function moduleMetaServiceFactoryMock(core) {

      function MetaService() {
      }

      MetaService.prototype.configure = jasmine.createSpy();
      MetaService.prototype.getInstancesOf = jasmine.createSpy().and.callFake(function() { return []; });
      MetaService.prototype.get = jasmine.createSpy().and.returnValue(null);

      return MetaService;
    }

    function configurationServiceFactoryMock(core) {

      function ConfigurationService(environment, selectExternalAsync) {

        this.__environment = environment || {};
        this.__selectExternalAsync = selectExternalAsync ? jasmine.createSpy().and.callFake(selectExternalAsync) : null;
      }

      ConfigurationService.prototype.add = jasmine.createSpy();
      ConfigurationService.prototype.selectAsync = jasmine.createSpy().and.callFake(function(moduleId) {

        if(this.__selectExternalAsync !== null) {
          return this.__selectExternalAsync(moduleId).then(function(prioritizedConfigs) {
            return null;
          });
        }

        return Promise.resolve(null);
      });

      return ConfigurationService;
    }

    function createModuleServiceMock() {

      function ModuleService(metaService) {
        this.__metaService = metaService;
      }

      return ModuleService;
    }

    function createEnvironmentMock() {
      return {};
    }
    // endregion

    describe(".createAsync(environment)", function() {

      var Core;
      var moduleMetaFactory;
      var moduleTypeMetaFactory;
      var moduleInstanceMetaFactory;
      var moduleMetaServiceFactory;
      var configServiceFactory;
      var environment;

      beforeEach(function() {
        environment = createEnvironmentMock();
        moduleMetaFactory = jasmine.createSpy().and.callFake(moduleMetaFactoryMock);
        moduleTypeMetaFactory = jasmine.createSpy().and.callFake(moduleTypeMetaFactoryMock);
        moduleInstanceMetaFactory = jasmine.createSpy().and.callFake(moduleInstanceMetaFactoryMock);
        moduleMetaServiceFactory = jasmine.createSpy().and.callFake(moduleMetaServiceFactoryMock);
        configServiceFactory = jasmine.createSpy().and.callFake(configurationServiceFactoryMock);

        localRequire = require.new();

        localRequire
          .define("pentaho/_core/module/Meta", function() { return moduleMetaFactory; })
          .define("pentaho/_core/module/TypeMeta", function() { return moduleTypeMetaFactory; })
          .define("pentaho/_core/module/InstanceMeta", function() { return moduleInstanceMetaFactory; })
          .define("pentaho/_core/module/MetaService", function() { return moduleMetaServiceFactory; })
          .define("pentaho/_core/module/Service", function() { return createModuleServiceMock(); })
          .define("pentaho/_core/config/Service", function() { return configServiceFactory; });

        return localRequire.promise([
          "pentaho/_core/Core"
        ])
        .then(function(deps) {
          Core = deps[0];
        });
      });

      it("should return a promise", function() {

        var result = Core.createAsync(environment);

        expect(result instanceof Promise);

        return result;
      });

      it("should return a promise that resolves to a core instance", function() {

        var promise = Core.createAsync(environment);

        return promise.then(function(core) {
          expect(core instanceof Core).toBe(true);
        });
      });

      it("should expose the specified environment", function() {

        var promise = Core.createAsync(environment);

        return promise.then(function(core) {
          expect(core.environment).toBe(environment);
        });
      });

      it("should call the moduleMetaFactory and expose the ModuleMeta", function() {

        var promise = Core.createAsync(environment);

        return promise.then(function(core) {
          expect(moduleMetaFactory).toHaveBeenCalledTimes(1);
          expect(moduleMetaFactory).toHaveBeenCalledWith(core);
          expect(core.ModuleMeta).toBe(moduleMetaFactory.calls.first().returnValue);
        });
      });

      it("should call the moduleTypeMetaFactory and expose the TypeModuleMeta", function() {

        var promise = Core.createAsync(environment);

        return promise.then(function(core) {
          expect(moduleTypeMetaFactory).toHaveBeenCalledTimes(1);
          expect(moduleTypeMetaFactory).toHaveBeenCalledWith(core);
          expect(core.TypeModuleMeta).toBe(moduleTypeMetaFactory.calls.first().returnValue);
        });
      });

      it("should call the moduleInstanceMetaFactory and expose the InstanceModuleMeta", function() {

        var promise = Core.createAsync(environment);

        return promise.then(function(core) {
          expect(moduleInstanceMetaFactory).toHaveBeenCalledTimes(1);
          expect(moduleInstanceMetaFactory).toHaveBeenCalledWith(core);
          expect(core.InstanceModuleMeta).toBe(moduleInstanceMetaFactory.calls.first().returnValue);
        });
      });

      it("should call the moduleMetaServiceFactory and expose an instance of it in moduleMetaService", function() {

        var promise = Core.createAsync(environment);

        return promise.then(function(core) {
          expect(moduleMetaServiceFactory).toHaveBeenCalledTimes(1);
          expect(moduleMetaServiceFactory).toHaveBeenCalledWith(core);

          var ModuleMetaService = moduleMetaServiceFactory.calls.first().returnValue;
          expect(core.moduleMetaService instanceof ModuleMetaService).toBe(true);
        });
      });

      it("should create an instance of module/Service and expose an instance of it in moduleService", function() {

        return localRequire.promise(["pentaho/_core/module/Service"]).then(function(deps) {

          var ModuleService = deps[0];

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {
            expect(core.moduleService instanceof ModuleService).toBe(true);
          });
        });
      });

      it("should call the configServiceFactory and expose the ConfigurationService", function() {

        var promise = Core.createAsync(environment);

        return promise.then(function(core) {
          expect(configServiceFactory).toHaveBeenCalledTimes(1);
          expect(configServiceFactory).toHaveBeenCalledWith(core);
          expect(core.ConfigurationService).toBe(configServiceFactory.calls.first().returnValue);
        });
      });

      it("should create and expose an instance of ConfigurationService in configService", function() {

        var promise = Core.createAsync(environment);

        return promise.then(function(core) {
          expect(core.configService instanceof core.ConfigurationService).toBe(true);
        });
      });

      it("should create configService with the same environment", function() {

        var promise = Core.createAsync(environment);

        return promise.then(function(core) {
          expect(core.configService.__environment).toBe(environment);
        });
      });

      describe("RuleSet modules", function() {

        it("should get all rule set modules from moduleMetaService", function() {

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {
            expect(core.moduleMetaService.getInstancesOf).toHaveBeenCalledTimes(1);
            expect(core.moduleMetaService.getInstancesOf).toHaveBeenCalledWith("pentaho/config/spec/IRuleSet");
          });
        });

        it("should add each of the registered rule set modules to the configuration service", function() {

          var ruleSet1 = {rules: []};
          var ruleSet2 = {rules: []};
          var ruleSet3 = {rules: []};

          moduleMetaServiceFactory.and.callFake(function(core) {

            var MetaService = moduleMetaServiceFactoryMock(core);

            MetaService.prototype.getInstancesOf.and.callFake(function() {

              var InstanceMeta = core.InstanceModuleMeta;

              var ruleSetTypeMeta = new core.TypeModuleMeta(RULESET_TYPE_ID, {ancestor: null});

              var moduleResolver = function(id) {
                return id === RULESET_TYPE_ID ? ruleSetTypeMeta : null;
              };

              var ruleSetMeta1 = new InstanceMeta("test/ruleSet1", {type: RULESET_TYPE_ID}, moduleResolver);
              ruleSetMeta1.loadAsync = jasmine.createSpy().and.returnValue(Promise.resolve(ruleSet1));

              var ruleSetMeta2 = new InstanceMeta("test/ruleSet2", {type: RULESET_TYPE_ID}, moduleResolver);
              ruleSetMeta2.loadAsync = jasmine.createSpy().and.returnValue(Promise.resolve(ruleSet2));

              var ruleSetMeta3 = new InstanceMeta("test/ruleSet3", {type: RULESET_TYPE_ID}, moduleResolver);
              ruleSetMeta3.loadAsync = jasmine.createSpy().and.returnValue(Promise.resolve(ruleSet3));

              return [ruleSetMeta2, ruleSetMeta1, ruleSetMeta3];
            });

            return MetaService;
          });

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {

            expect(core.configService.add).toHaveBeenCalledTimes(3);
            expect(core.configService.add).toHaveBeenCalledWith(ruleSet1);
            expect(core.configService.add).toHaveBeenCalledWith(ruleSet2);
            expect(core.configService.add).toHaveBeenCalledWith(ruleSet3);
          });
        });

        it("should add each of the registered rule set modules " +
          "to the configuration service in module id order", function() {

          var ruleSet1 = {rules: []};
          var ruleSet2 = {rules: []};
          var ruleSet3 = {rules: []};

          var index = 0;
          var ruleSetIndex1;
          var ruleSetIndex2;
          var ruleSetIndex3;

          moduleMetaServiceFactory.and.callFake(function(core) {

            var MetaService = moduleMetaServiceFactoryMock(core);

            MetaService.prototype.getInstancesOf.and.callFake(function() {

              var ruleSetTypeId = "pentaho/config/spec/IRuleSet";

              var InstanceMeta = core.InstanceModuleMeta;

              var ruleSetTypeMeta = new core.TypeModuleMeta(ruleSetTypeId, {ancestor: null});

              var moduleResolver = function(id) {
                return id === ruleSetTypeId ? ruleSetTypeMeta : null;
              };

              var ruleSetMeta1 = new InstanceMeta("test/ruleSet1", {type: ruleSetTypeId}, moduleResolver);
              ruleSetMeta1.loadAsync = jasmine.createSpy().and.returnValue(Promise.resolve(ruleSet1));

              var ruleSetMeta2 = new InstanceMeta("test/ruleSet2", {type: ruleSetTypeId}, moduleResolver);
              ruleSetMeta2.loadAsync = jasmine.createSpy().and.returnValue(Promise.resolve(ruleSet2));

              var ruleSetMeta3 = new InstanceMeta("test/ruleSet3", {type: ruleSetTypeId}, moduleResolver);
              ruleSetMeta3.loadAsync = jasmine.createSpy().and.returnValue(Promise.resolve(ruleSet3));

              return [ruleSetMeta2, ruleSetMeta1, ruleSetMeta3];
            });

            return MetaService;
          });

          configServiceFactory.and.callFake(function(core) {

            var ConfigurationService = configurationServiceFactoryMock(core);

            ConfigurationService.prototype.add.and.callFake(function(ruleSet) {

              switch(ruleSet) {
                case ruleSet1: ruleSetIndex1 = ++index; break;
                case ruleSet2: ruleSetIndex2 = ++index; break;
                case ruleSet3: ruleSetIndex3 = ++index; break;
                default: break;
              }
            });

            return ConfigurationService;
          });

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {

            expect(ruleSetIndex1).toBeLessThan(ruleSetIndex2);
            expect(ruleSetIndex2).toBeLessThan(ruleSetIndex3);
          });
        });

        it("should add each of the registered rule set modules to the " +
          "configuration service except the ones whose loading failed", function() {

          var ruleSet1 = {rules: []};

          moduleMetaServiceFactory.and.callFake(function(core) {

            var MetaService = moduleMetaServiceFactoryMock(core);

            MetaService.prototype.getInstancesOf.and.callFake(function() {

              var ruleSetTypeId = "pentaho/config/spec/IRuleSet";

              var InstanceMeta = core.InstanceModuleMeta;

              var ruleSetTypeMeta = new core.TypeModuleMeta(ruleSetTypeId, {ancestor: null});

              var moduleResolver = function(id) {
                return id === ruleSetTypeId ? ruleSetTypeMeta : null;
              };

              var ruleSetMeta1 = new InstanceMeta("test/ruleSet1", {type: ruleSetTypeId}, moduleResolver);
              ruleSetMeta1.loadAsync = jasmine.createSpy().and.returnValue(Promise.resolve(ruleSet1));

              var ruleSetMeta2 = new InstanceMeta("test/ruleSet2", {type: ruleSetTypeId}, moduleResolver);
              ruleSetMeta2.loadAsync =
                jasmine.createSpy().and.returnValue(Promise.reject(new Error("Failed loading.")));

              return [ruleSetMeta2, ruleSetMeta1];
            });

            return MetaService;
          });

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {

            expect(core.configService.add).toHaveBeenCalledTimes(1);
            expect(core.configService.add).toHaveBeenCalledWith(ruleSet1);
          });
        });
      });

      describe("pentaho/modules configuration", function() {

        it("should ask the configuration service for the 'pentaho/modules' configuration", function() {

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {

            expect(core.configService.selectAsync).toHaveBeenCalledWith("pentaho/modules");
          });
        });

        it("should ask the configuration service for the 'pentaho/modules' configuration " +
          "after finishing the configuration of the configuration service", function() {

          var ruleSet1 = {rules: []};

          moduleMetaServiceFactory.and.callFake(function(core) {

            var MetaService = moduleMetaServiceFactoryMock(core);

            MetaService.prototype.getInstancesOf.and.callFake(function() {

              var ruleSetTypeId = "pentaho/config/spec/IRuleSet";

              var InstanceMeta = core.InstanceModuleMeta;

              var ruleSetTypeMeta = new core.TypeModuleMeta(ruleSetTypeId, {ancestor: null});

              var moduleResolver = function(id) {
                return id === ruleSetTypeId ? ruleSetTypeMeta : null;
              };

              var ruleSetMeta1 = new InstanceMeta("test/ruleSet1", {type: ruleSetTypeId}, moduleResolver);
              ruleSetMeta1.loadAsync = jasmine.createSpy().and.returnValue(Promise.resolve(ruleSet1));

              return [ruleSetMeta1];
            });

            return MetaService;
          });

          var index = 0;
          var indexAdd;
          var indexSelect;

          configServiceFactory.and.callFake(function(core) {

            var ConfigurationService = configurationServiceFactoryMock(core);

            ConfigurationService.prototype.add.and.callFake(function(ruleSet) {
              indexAdd = ++index;
            });

            ConfigurationService.prototype.selectAsync.and.callFake(function() {
              indexSelect = ++index;
              return Promise.resolve(null);
            });

            return ConfigurationService;
          });

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {

            expect(indexAdd).toBeLessThan(indexSelect);
          });
        });

        it("should configure the modules service with the 'pentaho/modules' configuration", function() {

          var modulesMap = {};

          configServiceFactory.and.callFake(function(core) {

            var ConfigurationService = configurationServiceFactoryMock(core);

            ConfigurationService.prototype.selectAsync.and.callFake(function(id) {
              return Promise.resolve(id === "pentaho/modules" ? modulesMap : null);
            });

            return ConfigurationService;
          });

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {

            expect(core.moduleMetaService.configure).toHaveBeenCalledWith(modulesMap);
          });
        });

        it("should configure moduleMetaService with what the configService returns", function() {

          var globalModuleMap = {};

          configServiceFactory.and.callFake(function(core) {

            var ConfigurationService = configurationServiceFactoryMock(core);

            ConfigurationService.prototype.selectAsync.and.callFake(function(moduleId) {
              if(moduleId === "pentaho/modules") {
                return Promise.resolve(globalModuleMap);
              }

              return Promise.resolve(null);
            });

            return ConfigurationService;
          });

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {
            expect(core.moduleMetaService.configure).toHaveBeenCalledTimes(1);
            expect(core.moduleMetaService.configure).toHaveBeenCalledWith(globalModuleMap);
          });
        });

        it("should provide to the configService the RequireJS configuration of pentaho/modules", function() {

          var globalRequireJSModulesConfig = {
            "a": {},
            "c": {}
          };

          localRequire.config({
            "config": {
              "pentaho/modules": globalRequireJSModulesConfig
            }
          });

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {
            var selectExternalAsync = core.configService.__selectExternalAsync;

            expect(selectExternalAsync).toHaveBeenCalledTimes(1);
            expect(selectExternalAsync).toHaveBeenCalledWith("pentaho/modules");

            var promiseExternalConfig = selectExternalAsync.calls.first().returnValue;

            expect(promiseExternalConfig.then !== null).toBe(true);

            return promiseExternalConfig.then(function(prioritizedModulesConfigs) {
              expect(Array.isArray(prioritizedModulesConfigs)).toBe(true);
              expect(prioritizedModulesConfigs.length).toBe(1);
              expect(prioritizedModulesConfigs[0].priority).toBe(-Infinity);
              expect(prioritizedModulesConfigs[0].config)
                .toEqual(jasmine.objectContaining(globalRequireJSModulesConfig));
            });
          });
        });
      });

      describe("configuration of other modules", function() {

        it("should provide to the configService each module's global config", function() {

          var configA = {"A": "B"};

          moduleMetaServiceFactory.and.callFake(function(core) {

            var MetaService = moduleMetaServiceFactoryMock(core);

            MetaService.prototype.get.and.callFake(function(moduleId) {
              if(moduleId === "a") {
                return new core.TypeModuleMeta(moduleId, {
                  config: configA
                });
              }

              return null;
            });

            return MetaService;
          });

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {

            var selectExternalAsync = core.configService.__selectExternalAsync;

            expect(selectExternalAsync).toHaveBeenCalledTimes(1);
            expect(selectExternalAsync).toHaveBeenCalledWith("pentaho/modules");

            return core.configService.selectAsync("a").then(function() {

              expect(selectExternalAsync).toHaveBeenCalledTimes(2);
              expect(selectExternalAsync).toHaveBeenCalledWith("a");

              expect(core.moduleMetaService.get).toHaveBeenCalledWith("a");

              var promiseExternalConfig = selectExternalAsync.calls.mostRecent().returnValue;

              expect(promiseExternalConfig.then !== null).toBe(true);

              return promiseExternalConfig.then(function(prioritizedModulesConfigs) {

                expect(Array.isArray(prioritizedModulesConfigs)).toBe(true);
                expect(prioritizedModulesConfigs.length).toBe(1);
                expect(prioritizedModulesConfigs[0].priority).toBe(-Infinity);
                expect(prioritizedModulesConfigs[0].config).toEqual(configA);
              });
            });
          });
        });

        it("should provide to the configService with each module's external config annotations", function() {

          var AAnnotation = function() {
            this.config = {"A": "C"};
          };

          AAnnotation.id = "SomeExternalConfigAnnotation";
          AAnnotation.priority = 5;

          var annotationA = new AAnnotation();

          moduleMetaServiceFactory.and.callFake(function(core) {
            var aMeta;
            var annotationAMeta;
            var externalConfigAnnotationMeta;

            var moduleResolver = function(id) {
              switch(id) {
                case EXTERNAL_CONFIG_ANNOTATION_ID: return externalConfigAnnotationMeta;
                case "SomeExternalConfigAnnotation": return annotationAMeta;
                case "a": return aMeta;
                default: return null;
              }
            };

            aMeta = new core.TypeModuleMeta("a", {
              ancestor: null
            });

            aMeta.getAnnotationsIds.and.returnValue([
              "SomeExternalConfigAnnotation",
              "SomeNotAnExternalConfigAnnotation"
            ]);

            aMeta.getAnnotationAsync = jasmine.createSpy("getAnnotationAsync").and.callFake(function(Annotation) {
              if(Annotation.id === "SomeExternalConfigAnnotation") {
                return Promise.resolve(annotationA);
              }

              return Promise.resolve(null);
            });

            // ---

            externalConfigAnnotationMeta = new core.TypeModuleMeta(EXTERNAL_CONFIG_ANNOTATION_ID, {
              ancestor: null
            });

            annotationAMeta = new core.TypeModuleMeta("a", {
              ancestor: EXTERNAL_CONFIG_ANNOTATION_ID
            }, moduleResolver);

            annotationAMeta.loadAsync.and.returnValue(Promise.resolve(AAnnotation));

            annotationAMeta.isSubtypeOf.and.callFake(function(other) {
              return other === externalConfigAnnotationMeta;
            });

            var MetaService = moduleMetaServiceFactoryMock(core);

            MetaService.prototype.get.and.callFake(function(moduleId) {
              return moduleResolver(moduleId);
            });

            return MetaService;
          });

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {

            var selectExternalAsync = core.configService.__selectExternalAsync;

            expect(selectExternalAsync).toHaveBeenCalledTimes(1);
            expect(selectExternalAsync).toHaveBeenCalledWith("pentaho/modules");

            // ---

            return core.configService.selectAsync("a").then(function() {

              expect(selectExternalAsync).toHaveBeenCalledTimes(2);
              expect(selectExternalAsync).toHaveBeenCalledWith("a");

              expect(core.moduleMetaService.get).toHaveBeenCalledWith("a");

              var promiseExternalConfig = selectExternalAsync.calls.mostRecent().returnValue;

              expect(promiseExternalConfig.then !== null).toBe(true);

              return promiseExternalConfig.then(function(prioritizedModulesConfigs) {

                expect(Array.isArray(prioritizedModulesConfigs)).toBe(true);
                expect(prioritizedModulesConfigs.length).toBe(1);
                expect(prioritizedModulesConfigs[0].priority).toBe(AAnnotation.priority);
                expect(prioritizedModulesConfigs[0].config).toEqual(annotationA.config);
              });
            });
          });
        });

        it("should provide to the configService with each module's global config and " +
          "external config annotations", function() {

          var configA = {"A": "B"};

          var AAnnotation = function() {
            this.config = {"A": "C"};
          };

          AAnnotation.id = "SomeExternalConfigAnnotation";
          AAnnotation.priority = 5;

          var annotationA = new AAnnotation();

          moduleMetaServiceFactory.and.callFake(function(core) {
            var aMeta;
            var annotationAMeta;
            var externalConfigAnnotationMeta;

            var moduleResolver = function(id) {
              switch(id) {
                case EXTERNAL_CONFIG_ANNOTATION_ID: return externalConfigAnnotationMeta;
                case "SomeExternalConfigAnnotation": return annotationAMeta;
                case "a": return aMeta;
                default: return null;
              }
            };

            aMeta = new core.TypeModuleMeta("a", {
              ancestor: null,
              config: configA
            });

            aMeta.getAnnotationsIds.and.returnValue([
              "SomeExternalConfigAnnotation",
              "SomeNotAnExternalConfigAnnotation"
            ]);

            aMeta.getAnnotationAsync = jasmine.createSpy("getAnnotationAsync").and.callFake(function(Annotation) {
              if(Annotation.id === "SomeExternalConfigAnnotation") {
                return Promise.resolve(annotationA);
              }

              return Promise.resolve(null);
            });

            // ---

            externalConfigAnnotationMeta = new core.TypeModuleMeta(EXTERNAL_CONFIG_ANNOTATION_ID, {
              ancestor: null
            });

            annotationAMeta = new core.TypeModuleMeta("a", {
              ancestor: EXTERNAL_CONFIG_ANNOTATION_ID
            }, moduleResolver);

            annotationAMeta.loadAsync.and.returnValue(Promise.resolve(AAnnotation));

            annotationAMeta.isSubtypeOf.and.callFake(function(other) {
              return other === externalConfigAnnotationMeta;
            });

            var MetaService = moduleMetaServiceFactoryMock(core);

            MetaService.prototype.get.and.callFake(function(moduleId) {
              return moduleResolver(moduleId);
            });

            return MetaService;
          });

          var promise = Core.createAsync(environment);

          return promise.then(function(core) {

            var selectExternalAsync = core.configService.__selectExternalAsync;

            expect(selectExternalAsync).toHaveBeenCalledTimes(1);
            expect(selectExternalAsync).toHaveBeenCalledWith("pentaho/modules");

            // ---

            return core.configService.selectAsync("a").then(function() {

              expect(selectExternalAsync).toHaveBeenCalledTimes(2);
              expect(selectExternalAsync).toHaveBeenCalledWith("a");

              expect(core.moduleMetaService.get).toHaveBeenCalledWith("a");

              var promiseExternalConfig = selectExternalAsync.calls.mostRecent().returnValue;

              expect(promiseExternalConfig.then !== null).toBe(true);

              return promiseExternalConfig.then(function(prioritizedModulesConfigs) {

                expect(Array.isArray(prioritizedModulesConfigs)).toBe(true);
                expect(prioritizedModulesConfigs.length).toBe(2);
                expect(prioritizedModulesConfigs[0].priority).toBe(-Infinity);
                expect(prioritizedModulesConfigs[0].config).toEqual(configA);
                expect(prioritizedModulesConfigs[1].priority).toBe(AAnnotation.priority);
                expect(prioritizedModulesConfigs[1].config).toEqual(annotationA.config);
              });
            });
          });
        });
      });
    });
  });
});

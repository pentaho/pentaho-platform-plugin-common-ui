/*!
 * Copyright 2010 - 2019 Hitachi Vantara.  All rights reserved.
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
  "pentaho/visual/Model",
  "pentaho/visual/action/Base",
  "pentaho/visual/action/Select",
  "pentaho/visual/action/Execute",
  "pentaho/visual/action/ModelChangedError",
  "pentaho/data/Table",
  "tests/pentaho/util/errorMatch",
  "pentaho/lang/UserError"
], function(Model, BaseAction, SelectAction, ExecuteAction, ModelChangedError, Table, errorMatch, UserError) {

  "use strict";

  /* eslint dot-notation: 0 */

  describe("pentaho.visual.Model", function() {

    var dataSpec;

    function createValidCleanModel(isAutoUpdate) {
      var model = new Model({
        isAutoUpdate: !!isAutoUpdate,
        data: dataSpec
      });

      expect(model.$isValid).toBe(true);

      model.__changeset = null;

      expect(model.isDirty).toBe(false);

      return model;
    }

    beforeAll(function() {
      var data = {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "sales", type: "number", label: "Sales"}
        ],
        rows: [
          {c: [{v: "Portugal"}, {v: 12000}]},
          {c: [{v: "Ireland"}, {v: 6000}]}
        ]
      };

      dataSpec = {
        v: new Table(data)
      };
    });

    it("can be instantiated with a well-formed spec", function() {
      expect(function() {
        return new Model({
          data: dataSpec
        });
      }).not.toThrowError();
    });

    it("can be instantiated without arguments", function() {
      expect(function() {
        return new Model();
      }).not.toThrowError();
    });

    it("should pre-load all standard visual role related modules", function() {

      require.using(["require", "pentaho/visual/Model"], function(localRequire) {
        localRequire("pentaho/visual/role/Property");
        localRequire("pentaho/visual/role/Mode");
      });
    });

    describe("ModelType#visualKeyType", function() {

      it("should be undefined in the visual Model class", function() {

        expect(Model.type.visualKeyType).toBe(undefined);
      });

      it("should remain undefined in an abstract sub-class", function() {

        var SubModel = Model.extend({
          $type: {isAbstract: true}
        });

        expect(SubModel.type.visualKeyType).toBe(undefined);
      });

      it("should default to 'dataKey' in a non-abstract sub-class", function() {

        var SubModel = Model.extend();

        expect(SubModel.type.visualKeyType).toBe("dataKey");
      });

      it("should be specifiable in an abstract class if not yet defined", function() {

        var SubModel = Model.extend({
          $type: {
            isAbstract: true,
            visualKeyType: "dataOrdinal"
          }
        });

        expect(SubModel.type.visualKeyType).toBe("dataOrdinal");

        SubModel = Model.extend({
          $type: {
            isAbstract: true,
            visualKeyType: "dataKey"
          }
        });

        expect(SubModel.type.visualKeyType).toBe("dataKey");
      });

      it("should preserve the inherited specified value from an abstract base class " +
        "in an abstract subclass", function() {

        var SubModel = Model.extend({
          $type: {
            isAbstract: true,
            visualKeyType: "dataOrdinal"
          }
        });

        var SubModel2 = SubModel.extend({
          $type: {
            isAbstract: true
          }
        });

        expect(SubModel2.type.visualKeyType).toBe("dataOrdinal");
      });

      it("should preserve the inherited specified value from an abstract base class " +
        "in a non-abstract subclass", function() {

        var SubModel = Model.extend({
          $type: {
            isAbstract: true,
            visualKeyType: "dataOrdinal"
          }
        });

        var SubModel2 = SubModel.extend();

        expect(SubModel2.type.visualKeyType).toBe("dataOrdinal");
      });

      it("should preserve the inherited specified value from a non-abstract base class " +
        "in a non-abstract subclass", function() {

        var SubModel = Model.extend({
          $type: {
            visualKeyType: "dataOrdinal"
          }
        });

        var SubModel2 = SubModel.extend();

        expect(SubModel2.type.visualKeyType).toBe("dataOrdinal");
      });

      it("should preserve the inherited specified value from a non-abstract base class " +
        "in an abstract subclass", function() {

        var SubModel = Model.extend({
          $type: {
            visualKeyType: "dataOrdinal"
          }
        });

        var SubModel2 = SubModel.extend({
          $type: {
            isAbstract: true
          }
        });

        expect(SubModel2.type.visualKeyType).toBe("dataOrdinal");
      });

      it("should throw if an invalid value is specified", function() {

        expect(function() {

          Model.extend({
            $type: {
              visualKeyType: "dataFoo"
            }
          });
        }).toThrow(errorMatch.argRange("visualKeyType"));
      });

      it("should throw if specifying a value different from the inherited, specified value", function() {

        var SubModel = Model.extend({
          $type: {
            visualKeyType: "dataOrdinal"
          }
        });

        expect(function() {
          SubModel.extend({
            $type: {
              visualKeyType: "dataKey"
            }
          });
        }).toThrow(errorMatch.operInvalid());
      });

      it("should accept specifying a value equal to the inherited, specified value", function() {

        var SubModel = Model.extend({
          $type: {
            visualKeyType: "dataOrdinal"
          }
        });

        var SubModel2 = SubModel.extend({
          $type: {
            visualKeyType: "dataOrdinal"
          }
        });

        expect(SubModel2.type.visualKeyType).toBe("dataOrdinal");
      });
    });

    describe("#configure(config)", function() {

      it("should not emit change events if configured with its current spec", function() {

        function config(localRequire) {

          localRequire.define("test/foo/Model", ["pentaho/visual/Model"], function(BaseModel) {

            return BaseModel.extend({
              $type: {
                id: "test/foo/Model",
                props: {
                  a: {valueType: "string"},
                  b: {valueType: "string"}
                }
              }
            });
          });
        }

        return require.using(["test/foo/Model"], config, function(Model) {

          var modelSpec = {
            a: "a1",
            b: "b1",
            data: dataSpec.v,
            selectionFilter: {_: "or", o: [{_: "=", p: "country", v: "Portugal"}]}
          };

          var model = new Model(modelSpec);

          var modelSpec2 = model.toSpec();

          expect(modelSpec2).toEqual(modelSpec);

          var finallyChangeSpy = jasmine.createSpy("change:finally");

          model.on("change", {finally: finallyChangeSpy});

          model.configure(modelSpec);

          expect(finallyChangeSpy).not.toHaveBeenCalled();
        });
      });
    });

    describe("#act", function() {

      var CustomSyncAction;

      beforeAll(function() {
        // Assuming pre-loaded with View
        CustomSyncAction = BaseAction.extend({}, {
          get id() {
            return "my/test/Action";
          }
        });
      });

      it("should call all `_emitActionPhase*Event` methods with the action execution", function() {

        var model = new Model();

        spyOn(model, "_emitActionPhaseInitEvent").and.callThrough();
        spyOn(model, "_emitActionPhaseWillEvent").and.callThrough();
        spyOn(model, "_emitActionPhaseDoEvent").and.callThrough();
        spyOn(model, "_emitActionPhaseFinallyEvent").and.callThrough();

        var actionExecution = model.act(new CustomSyncAction());

        return actionExecution.promise.then(function() {
          expect(model._emitActionPhaseInitEvent).toHaveBeenCalledWith(actionExecution);
          expect(model._emitActionPhaseWillEvent).toHaveBeenCalledWith(actionExecution);
          expect(model._emitActionPhaseDoEvent).toHaveBeenCalledWith(actionExecution);
          expect(model._emitActionPhaseFinallyEvent).toHaveBeenCalledWith(actionExecution);
        });
      });

      it("should call registered view event listeners", function() {

        var observer = {
          init: jasmine.createSpy(),
          will: jasmine.createSpy(),
          "do": jasmine.createSpy(),
          "finally": jasmine.createSpy()
        };

        var model = new Model();
        model.on(CustomSyncAction.id, observer);

        var actionExecution = model.act(new CustomSyncAction());

        return actionExecution.promise.then(function() {
          expect(observer.init).toHaveBeenCalledWith(actionExecution, actionExecution.action);
          expect(observer.will).toHaveBeenCalledWith(actionExecution, actionExecution.action);
          expect(observer["do"]).toHaveBeenCalledWith(actionExecution, actionExecution.action);
          expect(observer["finally"]).toHaveBeenCalledWith(actionExecution, actionExecution.action);
        });
      });

      it("should allow canceling the action in the init phase", function() {

        var observer = {
          init: jasmine.createSpy("init").and.callFake(function(actionExecution) {
            actionExecution.reject();
          }),
          will: jasmine.createSpy("will"),
          "do": jasmine.createSpy("do"),
          "finally": jasmine.createSpy("finally").and.callFake(function(actionExecution) {
            expect(actionExecution.isCanceled).toBe(true);
          })
        };

        var model = new Model();
        model.on(CustomSyncAction.id, observer);

        return model.act(new CustomSyncAction()).promise.then(function() {
          return Promise.reject("Should have been rejected.");
        }, function() {
          expect(observer.init).toHaveBeenCalled();
          expect(observer.will).not.toHaveBeenCalled();
          expect(observer["do"]).not.toHaveBeenCalled();
          expect(observer["finally"]).toHaveBeenCalled();
        });
      });

      it("should allow canceling the action in the will phase", function() {

        var observer = {
          init: jasmine.createSpy("init"),
          will: jasmine.createSpy("will").and.callFake(function(event) {
            event.reject();
          }),
          "do": jasmine.createSpy("do"),
          "finally": jasmine.createSpy("finally").and.callFake(function(event) {
            expect(event.isCanceled).toBe(true);
          })
        };

        var model = new Model();
        model.on(CustomSyncAction.id, observer);

        return model.act(new CustomSyncAction()).promise.then(function() {
          return Promise.reject("Should have been rejected.");
        }, function() {
          expect(observer.init).toHaveBeenCalled();
          expect(observer.will).toHaveBeenCalled();
          expect(observer["do"]).not.toHaveBeenCalled();
          expect(observer["finally"]).toHaveBeenCalled();
        });
      });

      it("should allow executing the action even if the model is dirty", function() {

        var model = new Model();

        var result = model.act(new CustomSyncAction());

        expect(result.isDone).toBe(true);
      });
    });

    // region UPDATE
    describe("#isAutoUpdate", function() {

      it("should default to true", function() {
        var model = new Model();
        expect(model.isAutoUpdate).toBe(true);
      });

      it("should be read-only", function() {
        var model = new Model();
        expect(function() {
          model.isAutoUpdate = false;
        }).toThrowError(TypeError);
      });

      it("should respect the specified viewSpec.isAutoUpdate", function() {

        var model = new Model({isAutoUpdate: false});
        expect(model.isAutoUpdate).toBe(false);

        model = new Model({isAutoUpdate: true});
        expect(model.isAutoUpdate).toBe(true);
      });

      it("should not call #update when #isAutoUpdate is `false` and the properties change", function() {

        var model = createValidCleanModel(false);

        spyOn(model, "update").and.returnValue(Promise.resolve());

        model.width = 200;

        expect(model.update).not.toHaveBeenCalled();
      });

      it("should call #update when #isAutoUpdate is `true` and the properties change", function() {

        var model = createValidCleanModel(true);

        spyOn(model, "update").and.returnValue(Promise.resolve());

        model.width = 200;

        expect(model.update).toHaveBeenCalled();
      });

      // Coverage.
      // TODO: should test that logger.warn is called.
      it("should log the rejected case of an auto-update", function() {

        var model = createValidCleanModel(true);

        spyOn(model, "update").and.returnValue(Promise.reject(new Error("Something went wrong...")));

        model.width = 200;

        expect(model.update).toHaveBeenCalled();
      });
    });

    describe("#isUpdating", function() {

      var model;

      beforeEach(function() {
        model = new Model({
          width: 100,
          height: 100,
          data: dataSpec
        });

        expect(model.isDirty).toBe(true);
      });

      it("should be `false` when the model is created", function() {
        expect(model.isUpdating).toBe(false);
      });

      it("should be read-only", function() {
        expect(function() {
          model.isUpdating = false;
        }).toThrowError(TypeError);
      });

      it("should be `true` when 'update:{init,will,do,finally}' are called", function() {
        var listeners = {
          init: jasmine.createSpy("init").and.callFake(function() {
            expect(model.isUpdating).toBe(true);
          }),
          will: jasmine.createSpy("will").and.callFake(function() {
            expect(model.isUpdating).toBe(true);
          }),
          do: jasmine.createSpy("do").and.callFake(function() {
            expect(model.isUpdating).toBe(true);
          }),
          finally: jasmine.createSpy("finally").and.callFake(function() {
            expect(model.isUpdating).toBe(true);
          })
        };

        model.on("pentaho/visual/action/Update", listeners);

        return model.update().then(function() {
          expect(listeners.init).toHaveBeenCalledTimes(1);
          expect(listeners.will).toHaveBeenCalledTimes(1);
          expect(listeners.do).toHaveBeenCalledTimes(1);
          expect(listeners.finally).toHaveBeenCalledTimes(1);
        });
      });

      it("should be `false` after a successful update", function() {

        return model.update().then(function() {
          expect(model.isUpdating).toBe(false);
        });
      });

      it("should be `false` after a rejected update", function() {

        model.on("pentaho/visual/action/Update", {"do": function(ae) { ae.reject(); }});

        return model.update()
          .then(function() {
            expect(false).toBe(true);
          }, function() {
            expect(model.isUpdating).toBe(false);
          });
      });
    });

    describe("#isDirty", function() {

      var model;

      beforeEach(function() {
        model = new Model({
          isAutoUpdate: false,
          width: 100,
          height: 100,
          data: dataSpec
        });
      });

      it("should be `true` when the model is created", function() {
        expect(model.isDirty).toBe(true);
      });

      it("should be read-only", function() {
        expect(function() {
          model.isDirty = false;
        }).toThrowError(TypeError);
      });

      it("should be `true` when 'pentaho/visual/action/Update:{init,will,do,finally}' is called", function() {

        var listeners = {
          init: jasmine.createSpy("init").and.callFake(function() {
            expect(model.isDirty).toBe(true);
          }),
          will: jasmine.createSpy("will").and.callFake(function() {
            expect(model.isDirty).toBe(true);
          }),
          do: jasmine.createSpy("do").and.callFake(function() {
            expect(model.isDirty).toBe(true);
          }),
          finally: jasmine.createSpy("finally").and.callFake(function() {
            expect(model.isDirty).toBe(true);
          })
        };

        model.on("pentaho/visual/action/Update", listeners);

        return model.update().then(function() {
          expect(listeners.init).toHaveBeenCalledTimes(1);
          expect(listeners.will).toHaveBeenCalledTimes(1);
          expect(listeners.do).toHaveBeenCalledTimes(1);
          expect(listeners.finally).toHaveBeenCalledTimes(1);
        });
      });

      it("should be `false` after a successful update", function() {

        expect(model.isDirty).toBe(true);

        return model.update().then(function() {

          expect(model.isDirty).toBe(false);
        });
      });

      it("should mark the model as dirty when 'isAutoUpdate' is `false` and a change has taken place", function() {

        model.__changeset = null;

        expect(model.isDirty).toBe(false);
        expect(model.isAutoUpdate).toBe(false);

        model.width = 200;

        expect(model.isDirty).toBe(true);
      });

      it("should be `true` during a model change event", function() {

        model.__changeset = null;

        expect(model.isDirty).toBe(false);
        expect(model.isAutoUpdate).toBe(false);

        var finallyChangeHandler = jasmine.createSpy().and.callFake(function() {
          expect(model.isDirty).toBe(true);
        });

        model.on("change", {finally: finallyChangeHandler});

        model.selectionFilter = {_: "true"}; // Marks the model as dirty

        expect(finallyChangeHandler).toHaveBeenCalled();
      });
    });

    describe("#update()", function() {

      it("should call 'update:{init,will,do,finally}'", function() {
        var model = new Model({
          data: dataSpec
        });

        expect(model.isDirty).toBe(true);

        var listeners = {
          init: jasmine.createSpy("init"),
          will: jasmine.createSpy("will"),
          do: jasmine.createSpy("do"),
          finally: jasmine.createSpy("finally")
        };

        model.on("pentaho/visual/action/Update", listeners);

        return model.update()
          .then(function() {
            expect(listeners.init).toHaveBeenCalledTimes(1);
            expect(listeners.will).toHaveBeenCalledTimes(1);
            expect(listeners.do).toHaveBeenCalledTimes(1);
            expect(listeners.finally).toHaveBeenCalledTimes(1);
          });
      });

      it("should call validate after the init phase", function() {

        var model = new Model({
          data: dataSpec
        });

        expect(model.isDirty).toBe(true);

        var listeners = {
          init: jasmine.createSpy("init").and.callFake(function() {
            expect(model.validate).not.toHaveBeenCalled();
          }),
          will: jasmine.createSpy("will").and.callFake(function() {
            expect(model.validate).toHaveBeenCalledTimes(1);
          }),
          do: jasmine.createSpy("do").and.callFake(function() {
            expect(model.validate).toHaveBeenCalledTimes(1);
          }),
          finally: jasmine.createSpy("finally").and.callFake(function() {
            expect(model.validate).toHaveBeenCalledTimes(1);
          })
        };

        spyOn(model, "validate").and.callThrough();

        model.on("pentaho/visual/action/Update", listeners);

        return model.update().then(function() {
          expect(listeners.init).toHaveBeenCalledTimes(1);
          expect(listeners.will).toHaveBeenCalledTimes(1);
          expect(listeners.do).toHaveBeenCalledTimes(1);
          expect(listeners.finally).toHaveBeenCalledTimes(1);
        });
      });

      it("should not proceed to the will phase if validate returns errors", function() {

        var model = new Model({
          data: dataSpec
        });

        expect(model.isDirty).toBe(true);

        var listeners = {
          init: jasmine.createSpy("init").and.callFake(function() {
            expect(model.validate).not.toHaveBeenCalled();
          }),
          will: jasmine.createSpy("will"),
          do: jasmine.createSpy("do"),
          finally: jasmine.createSpy("finally")
        };

        spyOn(model, "validate").and.returnValue([new Error("validation error")]);

        model.on("pentaho/visual/action/Update", listeners);

        return model.update().then(function() {
          return Promise.reject("Should have been rejected.");
        }, function() {
          expect(listeners.init).toHaveBeenCalledTimes(1);
          expect(model.validate).toHaveBeenCalledTimes(1);
          expect(listeners.will).not.toHaveBeenCalled();
          expect(listeners.do).not.toHaveBeenCalled();
          expect(listeners.finally).toHaveBeenCalledTimes(1);
        });
      });

      it("should return a (resolved) promise and not become isUpdating if not dirty and not isUpdating", function() {

        var model = new Model({
          data: dataSpec
        });

        model.__changeset = null;

        expect(model.isDirty).toBe(false);
        expect(model.isUpdating).toBe(false);

        var promise = model.update();

        // No way to observe that the promise is already resolved, however,
        // we can check that isUpdating is false.

        expect(model.isUpdating).toBe(false);

        return promise;
      });

      it("should return a promise and become isUpdating sync if dirty and not isUpdating", function() {

        var model = new Model({
          data: dataSpec
        });

        expect(model.isDirty).toBe(true);
        expect(model.isUpdating).toBe(false);

        var promise = model.update();

        // No way to observe that the promise is already resolved, however,
        // we can check that isUpdating is false.

        expect(model.isUpdating).toBe(true);

        return promise;
      });

      describe("when an update is ongoing", function() {

        it("should return the first promise if no new changes exist and update is called again", function() {

          var model = new Model({
            isAutoUpdate: false,
            data: dataSpec
          });

          expect(model.isDirty).toBe(true);
          expect(model.isUpdating).toBe(false);

          var resolveUpdate;
          var promise0 = new Promise(function(resolve) {
            resolveUpdate = resolve;
          });

          model.on("pentaho/visual/action/Update", {
            "do": jasmine.createSpy("do").and.returnValue(promise0)
          });

          var promise1 = model.update();

          var promise2 = model.update();

          expect(promise1).toBe(promise2);

          resolveUpdate();

          return promise1;
        });

        it("should return a second promise if new changes exist and update is called again", function() {

          var model = new Model({
            isAutoUpdate: false,
            data: dataSpec
          });

          expect(model.isDirty).toBe(true);
          expect(model.isUpdating).toBe(false);

          var resolveUpdates;
          var promise0 = new Promise(function(resolve) {
            resolveUpdates = resolve;
          });

          model.on("pentaho/visual/action/Update", {
            "do": jasmine.createSpy("do").and.returnValue(promise0)
          });

          var log = "";

          var promise1 = model.update();

          var promise1_0 = promise1.then(function() {
            log += "1 ";
          });

          model.width += 200;

          var promise2 = model.update();

          var promise2_0 = promise2.then(function() {
            log += "2 ";
          });

          expect(promise1).not.toBe(promise2);

          resolveUpdates();

          return Promise.all([promise1, promise1_0, promise2, promise2_0]).then(function() {
            expect(log).toBe("1 2 ");
          });
        });

        it("should fire update:{finally} events before the respective promises resolve", function() {

          var model = new Model({
            isAutoUpdate: false,
            data: dataSpec
          });

          expect(model.isDirty).toBe(true);
          expect(model.isUpdating).toBe(false);

          var resolveUpdates;

          var promise0 = new Promise(function(resolve) {
            resolveUpdates = resolve;
          });

          var log = "";
          model.on("pentaho/visual/action/Update", {
            "do": jasmine.createSpy("do").and.returnValue(promise0),
            "finally": jasmine.createSpy("finally").and.callFake(function() {
              log += "finally ";
            })
          });

          // Creates current.
          var promise1 = model.update();

          var promise1_0 = promise1.then(function() {
            log += "1 ";
          });

          // Creates changeset.
          model.width += 200;

          // Creates next.
          var promise2 = model.update();

          var promise2_0 = promise2.then(function() {
            log += "2 ";
          });

          expect(promise1).not.toBe(promise2);

          resolveUpdates();

          return Promise.all([promise1, promise1_0, promise2, promise2_0]).then(function() {
            expect(log).toBe("finally 1 finally 2 ");
          });
        });

        it("should perform the second update even if the first one is rejected", function() {

          var model = new Model({
            isAutoUpdate: false,
            data: dataSpec
          });

          expect(model.isDirty).toBe(true);
          expect(model.isUpdating).toBe(false);

          var rejectUpdate0_0;
          var promise0_0 = new Promise(function(resolve, reject) {
            rejectUpdate0_0 = reject;
          });

          var resolveUpdate0_1;
          var promise0_1 = new Promise(function(resolve) {
            resolveUpdate0_1 = resolve;
          });

          var log = "";
          var counter = 0;
          model.on("pentaho/visual/action/Update", {
            "do": jasmine.createSpy("do").and.callFake(function() {
              counter++;
              if(counter === 1) {
                return promise0_0;
              }

              if(counter === 2) {
                return promise0_1;
              }

              throw new Error("Bad programmer.");
            }),
            "finally": jasmine.createSpy("finally").and.callFake(function(ae) {
              log += (ae.isDone ? ("E-done-" + counter) : ("E-rejected-" + counter)) + " ";
            })
          });

          // Creates current.
          var promise1 = model.update();

          var promise1_0 = promise1
            .then(function() { log += "P-done-1 "; }, function() { log += "P-rejected-1 "; });

          // Creates changeset.
          model.width += 200;

          // Creates next.
          var promise2 = model.update();

          var promise2_0 = promise2
            .then(function() { log += "P-done-2 "; }, function() { log += "P-rejected-2 "; });

          expect(promise1).not.toBe(promise2);

          rejectUpdate0_0();
          resolveUpdate0_1();

          function ok() {}

          return Promise.all([promise1.then(ok, ok), promise1_0, promise2.then(ok, ok), promise2_0]).then(function() {
            expect(log).toBe("E-rejected-1 P-rejected-1 E-done-2 P-done-2 ");
          });
        });

        it("should return the second promise, the third time, if no new changes exist since the second", function() {

          var model = new Model({
            isAutoUpdate: false,
            data: dataSpec
          });

          expect(model.isDirty).toBe(true);
          expect(model.isUpdating).toBe(false);

          var promise1 = model.update();

          model.width += 200;

          var promise2 = model.update();

          var promise3 = model.update();

          expect(promise1).not.toBe(promise2);
          expect(promise3).toBe(promise2);

          return promise3;
        });

        it("should return the second promise, the third time, if new changes exist since the second", function() {

          var model = new Model({
            isAutoUpdate: false,
            data: dataSpec
          });

          expect(model.isDirty).toBe(true);
          expect(model.isUpdating).toBe(false);

          var promise1 = model.update();

          model.width += 200;

          var promise2 = model.update();

          model.height += 200;

          var promise3 = model.update();

          expect(promise1).not.toBe(promise2);
          expect(promise3).toBe(promise2);

          return promise3;
        });
      });

      describe("rejection", function() {

        it("should restore the previous changeset when *canceled*", function() {

          var model = new Model({
            isAutoUpdate: false,
            data: dataSpec
          });

          model.__changeset = null;

          expect(model.isDirty).toBe(false);
          expect(model.isUpdating).toBe(false);

          model.on("pentaho/visual/action/Update", {
            "do": jasmine.createSpy("do").and.returnValue(Promise.reject(new UserError("Canceled Test Error")))
          });

          // Creates changeset.
          model.width += 200;

          expect(model.isDirty).toBe(true);
          var changeset = model.__changeset;

          return model.update()
            .then(function() {
              return Promise.reject("Rejection expected");
            }, function() {
              expect(model.isDirty).toBe(true);
              expect(model.__changeset).toBe(changeset);
            });
        });

        it("should restore the FULL changeset when *failed*", function() {

          var model = new Model({
            isAutoUpdate: false,
            data: dataSpec
          });

          var fullChangeset = model.__changeset;

          model.__changeset = null;

          expect(model.isDirty).toBe(false);
          expect(model.isUpdating).toBe(false);

          model.on("pentaho/visual/action/Update", {
            "do": jasmine.createSpy("do").and.returnValue(Promise.reject(new Error("Fail Test Error")))
          });

          // Creates changeset.
          model.width += 200;

          expect(model.isDirty).toBe(true);
          var changeset = model.__changeset;
          expect(changeset).not.toBe(fullChangeset);

          return model.update()
            .then(function() {
              return Promise.reject("Rejection expected");
            }, function() {
              expect(model.isDirty).toBe(true);
              expect(model.__changeset).toBe(fullChangeset);
            });
        });
      });
    });
    // endregion

    describe("#select(selectSpec)", function() {

      it("should transform the given select action specification into selection filter", function() {

        var model = createValidCleanModel();

        var selectionFilter = model.selectionFilter;

        expect(selectionFilter.toDnf().kind).toBe("false");

        model.select({dataFilter: {_: "=", p: "country", v: "Portugal"}});

        var selectionFilter2 = model.selectionFilter;

        expect(selectionFilter2.toDnf().kind).not.toBe("false");

        expect(selectionFilter).not.toBe(selectionFilter2);
      });

      it("should transform the given select action instance into selection filter", function() {

        var model = createValidCleanModel();

        var selectionFilter1 = model.selectionFilter;

        expect(selectionFilter1.toDnf().kind).toBe("false");

        model.select(new SelectAction({dataFilter: {_: "=", p: "country", v: "Portugal"}}));

        var selectionFilter2 = model.selectionFilter;

        expect(selectionFilter2.toDnf().kind).not.toBe("false");

        expect(selectionFilter1).not.toBe(selectionFilter2);
      });

      it("should use the current selectionFilter and the action's dataFilter for combination", function() {

        var model = createValidCleanModel();

        var resultSelectionFilter = null;

        var selectionFilter1 = model.selectionFilter;

        var selectionMode = jasmine.createSpy("selectionMode").and.callFake(function(a, b) {

          resultSelectionFilter = a.or(b);

          return resultSelectionFilter;
        });

        var action = new SelectAction({
          dataFilter: {_: "=", p: "country", v: "Portugal"},
          selectionMode: selectionMode
        });

        model.select(action);

        var selectionFilter2 = model.selectionFilter;

        expect(selectionMode).toHaveBeenCalledTimes(1);
        expect(selectionMode).toHaveBeenCalledWith(selectionFilter1, action.dataFilter);
        expect(selectionMode.calls.mostRecent().object).toBe(model);
        expect(selectionFilter2.toDnf().$contentKey).toBe(resultSelectionFilter.toDnf().$contentKey);
      });

      it("should respect if the select action execution is marked done and not apply the default", function() {

        var model = createValidCleanModel();

        model.on("pentaho/visual/action/Select", {
          do: function(ae) {
            ae.done();
          }
        });

        var selectionFilter1 = model.selectionFilter;

        model.select({
          dataFilter: {_: "=", p: "country", v: "Portugal"}
        });

        var selectionFilter2 = model.selectionFilter;

        expect(selectionFilter1).toBe(selectionFilter2);
      });

      it("should reject if the model is dirty when the action starts", function() {

        var model = createValidCleanModel();

        // Make change.
        model.width += 200;

        var ae = model.select({
          dataFilter: {_: "=", p: "country", v: "Portugal"}
        });

        expect(ae.isCanceled).toBe(true);
        expect(ae.error).toEqual(jasmine.any(ModelChangedError));
      });

      it("should reject if the model is dirty when the action starts", function() {

        var model = createValidCleanModel();

        model.on("pentaho/visual/action/Select", {
          init: function() {
            // Make change.
            model.width += 200;
          }
        });

        var ae = model.select({
          dataFilter: {_: "=", p: "country", v: "Portugal"}
        });

        expect(ae.isCanceled).toBe(true);
        expect(ae.error).toEqual(jasmine.any(ModelChangedError));
      });
    });

    describe("#execute(executeSpec)", function() {

      it("should execute with the given action execution specification", function() {

        var model = createValidCleanModel();

        var doSpy = jasmine.createSpy("do");
        model.on("pentaho/visual/action/Execute", {
          do: doSpy
        });

        var action = new ExecuteAction({
          dataFilter: {_: "=", p: "country", v: "Portugal"}
        });

        model.execute({
          dataFilter: action.dataFilter
        });

        expect(doSpy).toHaveBeenCalledTimes(1);
        expect(doSpy).toHaveBeenCalledWith(jasmine.any(Object), jasmine.objectContaining({
          dataFilter: action.dataFilter
        }));
      });

      it("should execute with the given action execution instance", function() {

        var model = createValidCleanModel();

        var doSpy = jasmine.createSpy("do");
        model.on("pentaho/visual/action/Execute", {
          do: doSpy
        });

        var action = new ExecuteAction({
          dataFilter: {_: "=", p: "country", v: "Portugal"}
        });

        model.execute(action);

        expect(doSpy).toHaveBeenCalledTimes(1);
        expect(doSpy).toHaveBeenCalledWith(jasmine.any(Object), action);
      });

      it("should reject if the model is dirty when the action starts", function() {

        var model = createValidCleanModel();

        // Make change.
        model.width += 200;

        var ae = model.execute({
          dataFilter: {_: "=", p: "country", v: "Portugal"}
        });

        expect(ae.isCanceled).toBe(true);
        expect(ae.error).toEqual(jasmine.any(ModelChangedError));
      });

      it("should reject if the model is dirty when the action starts", function() {

        var model = createValidCleanModel();

        model.on("pentaho/visual/action/Execute", {
          init: function() {
            // Make change.
            model.width += 200;
          }
        });

        var ae = model.execute({
          dataFilter: {_: "=", p: "country", v: "Portugal"}
        });

        expect(ae.isCanceled).toBe(true);
        expect(ae.error).toEqual(jasmine.any(ModelChangedError));
      });
    });
  });
});

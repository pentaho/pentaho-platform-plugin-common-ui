/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/Context",
  "pentaho/visual/base",
  "pentaho/type/filter/or",
  "pentaho/type/filter/and",
  "pentaho/lang/UserError",
  "pentaho/visual/base/events/WillSelect",
  "pentaho/visual/base/events/DidSelect",
  "pentaho/visual/base/events/RejectedSelect",
  "pentaho/visual/base/events/WillExecute",
  "pentaho/visual/base/events/DidExecute",
  "pentaho/visual/base/events/RejectedExecute",
  "pentaho/visual/role/mapping"
], function(Context, modelFactory, orFilterFactory, andFilterFactory,
            UserError,
            WillSelect, DidSelect, RejectedSelect,
            WillExecute, DidExecute, RejectedExecute, mappingFactory) {
  "use strict";

  /* global jasmine:false, console:false, expect:false */

  describe("pentaho.visual.base.Model", function() {
    var context;
    var Model;
    var dataSpec;
    var OrFilter;
    var AndFilter;

    beforeEach(function() {
      context = new Context();
      Model = context.get(modelFactory);
      OrFilter = context.get(orFilterFactory);
      AndFilter = context.get(andFilterFactory);

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
        v: data
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
      function expectIt(lid) {
        expect(function() {
          expect(typeof require("pentaho/visual/role/" + lid)).toBe("function");
        }).not.toThrow();
      }

      expectIt("mapping");
      expectIt("quantitative");
      expectIt("ordinal");
      expectIt("nominal");
      expectIt("level");
      expectIt("aggregation");
    });

    describe("events - ", function() {
      var model;
      beforeEach(function() {
        model = new Model();
      });

      it("should have a default selectionMode", function() {
        var selectionMode = model.getv("selectionMode");

        expect(selectionMode).toBeDefined();
        expect(typeof selectionMode).toBe("function");
      });

      describe("selectAction - ", function() {
        var newSelection;

        var listeners;

        beforeEach(function() {
          newSelection = new OrFilter();

          listeners = jasmine.createSpyObj('listeners', [
            'willSelect', 'willSelectSecond',
            'didSelect',
            'rejectedSelect',
            'didChangeSelection'
          ]);
        });

        describe("default - ", function() {
          beforeEach(function() {
            model.on("will:select", listeners.willSelect);
            model.on("did:select", listeners.didSelect);
            model.on("rejected:select", listeners.rejectedSelect);

            model.on("did:change", listeners.didChangeSelection);

            model.selectAction(newSelection);
          });

          it("should call the will select listener", function() {
            expect(listeners.willSelect).toHaveBeenCalled();
          });

          it("should call the did select listener", function() {
            expect(listeners.didSelect).toHaveBeenCalled();
          });

          it("should not call the rejected select listener", function() {
            expect(listeners.rejectedSelect).not.toHaveBeenCalled();
          });

          xit("should call the did change selection listener", function() {
            expect(listeners.didChangeSelection).toHaveBeenCalled();
          });
        });

        describe("default - no listeners (performance check) - ", function() {
          beforeEach(function() {
            spyOn(model, "_emitSafe");

            model.selectAction(newSelection);
          });

          it("should not call _emitSafe function", function() {
            expect(model._emitSafe).not.toHaveBeenCalled();
          });
        });

        describe("custom selectionMode through keyArgs - ", function() {
          var selectionMode;
          beforeEach(function() {
            selectionMode = jasmine.createSpy('selectionMode');

            model.on("will:select", listeners.willSelect);
            model.on("did:select", listeners.didSelect);
            model.on("rejected:select", listeners.rejectedSelect);

            model.on("did:change", listeners.didChangeSelection);

            model.selectAction(newSelection, {selectionMode: selectionMode});
          });

          it("should call the custom selectionMode function", function() {
            expect(selectionMode).toHaveBeenCalled();
          });

          it("should call the will select listener", function() {
            expect(listeners.willSelect).toHaveBeenCalled();
          });

          it("should call the did select listener", function() {
            expect(listeners.didSelect).toHaveBeenCalled();
          });

          it("should not call the rejected select listener", function() {
            expect(listeners.rejectedSelect).not.toHaveBeenCalled();
          });

          xit("should call the did change selection listener", function() {
            expect(listeners.didChangeSelection).toHaveBeenCalled();
          });
        });

        describe("change selection in will event - ", function() {
          var alternativeSelection;
          var selectionMode;
          beforeEach(function() {
            alternativeSelection = new AndFilter();

            selectionMode = jasmine.createSpy('selectionMode');

            model.on("will:select", listeners.willSelect.and.callFake(function(willEvent) {
              willEvent.dataFilter = alternativeSelection;
            }));
            model.on("will:select", listeners.willSelectSecond);
            model.on("did:select", listeners.didSelect);
            model.on("rejected:select", listeners.rejectedSelect);

            model.on("did:change", listeners.didChangeSelection);

            model.selectAction(newSelection, {selectionMode: selectionMode});
          });

          it("should call the custom selectionMode function", function() {
            expect(selectionMode).toHaveBeenCalled();
          });

          it("should call the first will select listener", function() {
            expect(listeners.willSelect).toHaveBeenCalled();
          });

          it("should call the second will select listener", function() {
            expect(listeners.willSelectSecond).toHaveBeenCalled();
            expect(listeners.willSelectSecond.calls.mostRecent().args[0].dataFilter).toBe(alternativeSelection);
          });

          it("should call the did select listener", function() {
            expect(listeners.didSelect).toHaveBeenCalled();
            expect(listeners.didSelect.calls.mostRecent().args[0].dataFilter).toBe(alternativeSelection);
          });

          it("should not call the rejected select listener", function() {
            expect(listeners.rejectedSelect).not.toHaveBeenCalled();
          });

          xit("should call the did change selection listener", function() {
            expect(listeners.didChangeSelection).toHaveBeenCalled();
          });
        });

        describe("custom selectionMode through will event - ", function() {
          var selectionMode;
          beforeEach(function() {
            selectionMode = jasmine.createSpy('selectionMode');

            model.on("will:select", listeners.willSelect.and.callFake(function(willEvent) {
              willEvent.selectionMode = selectionMode;
            }));
            model.on("did:select", listeners.didSelect);
            model.on("rejected:select", listeners.rejectedSelect);

            model.on("did:change", listeners.didChangeSelection);

            model.selectAction(newSelection);
          });

          it("should call the custom selectionMode function", function() {
            expect(selectionMode).toHaveBeenCalled();
          });

          it("should call the will select listener", function() {
            expect(listeners.willSelect).toHaveBeenCalled();
          });

          it("should call the did select listener", function() {
            expect(listeners.didSelect).toHaveBeenCalled();
          });

          it("should not call the rejected select listener", function() {
            expect(listeners.rejectedSelect).not.toHaveBeenCalled();
          });

          xit("should call the did change selection listener", function() {
            expect(listeners.didChangeSelection).toHaveBeenCalled();
          });
        });

        [
          {label: "no reason", reason: undefined, message: "canceled"},
          {label: "string reason", reason: "Just cancel it!", message: "Just cancel it!"},
          {label: "User error reason", reason: new UserError("My error"), message: "My error"}
        ].forEach(function(motive) {
            describe("canceled on will - " + motive.label, function() {
              var selectionMode;
              beforeEach(function() {
                selectionMode = jasmine.createSpy('selectionMode');

                model.on("will:select", listeners.willSelect.and.callFake(function(willEvent) {
                  expect(function() {
                    willEvent.cancel(motive.reason);
                  }).not.toThrow(); // listener's errors are swallowed.
                }));
                model.on("will:select", listeners.willSelectSecond);
                model.on("did:select", listeners.didSelect);
                model.on("rejected:select", listeners.rejectedSelect);

                model.on("did:change", listeners.didChangeSelection);

                model.selectAction(newSelection, {selectionMode: selectionMode});
              });

              it("should not reach the selectionMode function", function() {
                expect(selectionMode).not.toHaveBeenCalled();
              });

              it("should call the first will select listener", function() {
                expect(listeners.willSelect).toHaveBeenCalled();
              });

              it("should not call the second will select listener", function() {
                expect(listeners.willSelectSecond).not.toHaveBeenCalled();
              });

              it("should not call the did select listener", function() {
                expect(listeners.didSelect).not.toHaveBeenCalled();
              });

              it("should call the rejected select listener", function() {
                expect(listeners.rejectedSelect).toHaveBeenCalled();

                var reason = listeners.rejectedSelect.calls.mostRecent().args[0];
                expect(reason instanceof RejectedSelect).toBe(true);
                expect(reason.error instanceof UserError).toBe(true);
                expect(reason.error.message).toBe(motive.message);
              });

              it("should not call the did change selection listener", function() {
                expect(listeners.didChangeSelection).not.toHaveBeenCalled();
              });
            });
          }
        );

        describe("exception on will - ", function() {
          var selectionMode;
          beforeEach(function() {
            selectionMode = jasmine.createSpy("selectionMode");

            model.on("will:select", listeners.willSelect.and.callFake(function(willEvent) {
              console.log("TEST: expect console error.");
              throw new Error("will:select listener error");
            }));
            model.on("will:select", listeners.willSelectSecond);
            model.on("did:select", listeners.didSelect);
            model.on("rejected:select", listeners.rejectedSelect);

            model.on("did:change", listeners.didChangeSelection);

            model.selectAction(newSelection, {selectionMode: selectionMode});
          });

          it("should reach the selectionMode function", function() {
            expect(selectionMode).toHaveBeenCalled();
          });

          it("should call the first will:select listener", function() {
            expect(listeners.willSelect).toHaveBeenCalled();
          });

          it("should call the second will:select listener", function() {
            expect(listeners.willSelectSecond).toHaveBeenCalled();
          });

          it("should call the did select listener", function() {
            expect(listeners.didSelect).toHaveBeenCalled();
          });

          it("should not call the rejected select listener", function() {
            expect(listeners.rejectedSelect).not.toHaveBeenCalled();
          });

          xit("should call the did change selection listener", function() {
            expect(listeners.didChangeSelection).toHaveBeenCalled();
          });
        });

        describe("exception on selectionMode - ", function() {
          var errorMsg = "selectionMode handler error";
          var selectionMode;

          beforeEach(function() {
            selectionMode = jasmine.createSpy("selectionMode").and.callFake(function() {
              throw new Error(errorMsg);
            });

            model.on("will:select", listeners.willSelect);
            model.on("did:select", listeners.didSelect);
            model.on("rejected:select", listeners.rejectedSelect);

            model.on("did:change", listeners.didChangeSelection);

            model.selectAction(newSelection, {selectionMode: selectionMode});
          });

          it("should reach the selectionMode function", function() {
            expect(selectionMode).toHaveBeenCalled();
          });

          it("should call the will select listener", function() {
            expect(listeners.willSelect).toHaveBeenCalled();
          });

          it("should not call the did select listener", function() {
            expect(listeners.didSelect).not.toHaveBeenCalled();
          });

          it("should call the rejected select listener", function() {
            expect(listeners.rejectedSelect).toHaveBeenCalled();

            var reason = listeners.rejectedSelect.calls.mostRecent().args[0];
            expect(reason instanceof RejectedSelect).toBe(true);
            expect(reason.error instanceof Error).toBe(true);
            expect(reason.error.message).toBe(errorMsg);
          });

          it("should not call the did change selection listener", function() {
            expect(listeners.didChangeSelection).not.toHaveBeenCalled();
          });
        });
      });

      describe("executeAction - ", function() {
        var newSelection;

        var listeners;

        beforeEach(function() {
          newSelection = new OrFilter();

          listeners = jasmine.createSpyObj('listeners', [
            'willExecute', 'willExecuteSecond',
            'didExecute',
            'rejectedExecute'
          ]);
        });

        describe("default - ", function() {
          beforeEach(function() {
            model.on("will:execute", listeners.willExecute);
            model.on("did:execute", listeners.didExecute);
            model.on("rejected:execute", listeners.rejectedExecute);

            model.executeAction(newSelection);
          });

          it("should call the will execute listener", function() {
            expect(listeners.willExecute).toHaveBeenCalled();
          });

          it("should not call the did execute listener", function() {
            expect(listeners.didExecute).not.toHaveBeenCalled();
          });

          it("should call the rejected execute listener", function() {
            expect(listeners.rejectedExecute).toHaveBeenCalled();

            var reason = listeners.rejectedExecute.calls.mostRecent().args[0];
            expect(reason instanceof RejectedExecute).toBe(true);
            expect(reason.error instanceof UserError).toBe(true);
            expect(reason.error.message).toBe("Action is not defined");
          });
        });

        describe("default - no listeners (performance check) - ", function() {
          beforeEach(function() {
            spyOn(model, "_emitSafe");

            model.executeAction(newSelection);
          });

          it("should not call _emitSafe function", function() {
            expect(model._emitSafe).not.toHaveBeenCalled();
          });
        });

        describe("custom doExecute through keyArgs - ", function() {
          var doExecute;
          beforeEach(function() {
            doExecute = jasmine.createSpy('doExecute');

            model.on("will:execute", listeners.willExecute);
            model.on("did:execute", listeners.didExecute);
            model.on("rejected:execute", listeners.rejectedExecute);

            model.executeAction(newSelection, {doExecute: doExecute});
          });

          it("should call the custom doExecute function", function() {
            expect(doExecute).toHaveBeenCalled();
          });

          it("should call the will execute listener", function() {
            expect(listeners.willExecute).toHaveBeenCalled();
          });

          it("should call the did execute listener", function() {
            expect(listeners.didExecute).toHaveBeenCalled();
          });

          it("should not call the rejected execute listener", function() {
            expect(listeners.rejectedExecute).not.toHaveBeenCalled();
          });
        });

        describe("change selection in will event - ", function() {
          var alternativeSelection;
          var doExecute;
          beforeEach(function() {
            alternativeSelection = new AndFilter();

            doExecute = jasmine.createSpy('doExecute');

            model.on("will:execute", listeners.willExecute.and.callFake(function(willEvent) {
              expect(function() {
                willEvent.dataFilter = alternativeSelection;
              }).not.toThrow(); // listener's errors are swallowed.
            }));
            model.on("will:execute", listeners.willExecuteSecond);
            model.on("did:execute", listeners.didExecute);
            model.on("rejected:execute", listeners.rejectedExecute);

            model.executeAction(newSelection, {doExecute: doExecute});
          });

          it("should call the custom doExecute function", function() {
            expect(doExecute).toHaveBeenCalled();
          });

          it("should call the first will execute listener", function() {
            expect(listeners.willExecute).toHaveBeenCalled();
          });

          it("should call the second will execute listener", function() {
            expect(listeners.willExecuteSecond).toHaveBeenCalled();
            expect(listeners.willExecuteSecond.calls.mostRecent().args[0].dataFilter).toBe(alternativeSelection);
          });

          it("should call the did execute listener", function() {
            expect(listeners.didExecute).toHaveBeenCalled();
            expect(listeners.didExecute.calls.mostRecent().args[0].dataFilter).toBe(alternativeSelection);
          });

          it("should not call the rejected execute listener", function() {
            expect(listeners.rejectedExecute).not.toHaveBeenCalled();
          });
        });

        describe("custom doExecute through will event - ", function() {
          var doExecute;
          beforeEach(function() {
            doExecute = jasmine.createSpy('doExecute');

            model.on("will:execute", listeners.willExecute.and.callFake(function(willEvent) {
              expect(function() {
                willEvent.doExecute = doExecute;
              }).not.toThrow(); // listener's errors are swallowed.
            }));
            model.on("did:execute", listeners.didExecute);
            model.on("rejected:execute", listeners.rejectedExecute);

            model.executeAction(newSelection);
          });

          it("should call the custom doExecute function", function() {
            expect(doExecute).toHaveBeenCalled();
          });

          it("should call the will execute listener", function() {
            expect(listeners.willExecute).toHaveBeenCalled();
          });

          it("should call the did execute listener", function() {
            expect(listeners.didExecute).toHaveBeenCalled();
          });

          it("should not call the rejected execute listener", function() {
            expect(listeners.rejectedExecute).not.toHaveBeenCalled();
          });
        });

        [
          {label: "no reason", reason: undefined, message: "canceled"},
          {label: "string reason", reason: "Just cancel it!", message: "Just cancel it!"},
          {label: "User error reason", reason: new UserError("My error"), message: "My error"}
        ].forEach(function(motive) {
            describe("canceled on will - " + motive.label, function() {
              var doExecute;
              beforeEach(function() {
                doExecute = jasmine.createSpy('doExecute');

                model.on("will:execute", listeners.willExecute.and.callFake(function(willEvent) {
                  expect(function() {
                    willEvent.cancel(motive.reason);
                  }).not.toThrow(); // listener's errors are swallowed.
                }));
                model.on("will:execute", listeners.willExecuteSecond);
                model.on("did:execute", listeners.didExecute);
                model.on("rejected:execute", listeners.rejectedExecute);

                model.executeAction(newSelection, {doExecute: doExecute});
              });

              it("should not reach the doExecute function", function() {
                expect(doExecute).not.toHaveBeenCalled();
              });

              it("should call the first will execute listener", function() {
                expect(listeners.willExecute).toHaveBeenCalled();
              });

              it("should not call the second will execute listener", function() {
                expect(listeners.willExecuteSecond).not.toHaveBeenCalled();
              });

              it("should not call the did execute listener", function() {
                expect(listeners.didExecute).not.toHaveBeenCalled();
              });

              it("should call the rejected execute listener", function() {
                expect(listeners.rejectedExecute).toHaveBeenCalled();

                var reason = listeners.rejectedExecute.calls.mostRecent().args[0];
                expect(reason instanceof RejectedExecute).toBe(true);
                expect(reason.error instanceof UserError).toBe(true);
                expect(reason.error.message).toBe(motive.message);
              });
            });
          }
        );

        describe("exception on will - ", function() {
          var doExecute;
          beforeEach(function() {
            doExecute = jasmine.createSpy('doExecute');

            model.on("will:execute", listeners.willExecute.and.callFake(function(willEvent) {
              console.log("TEST: expect console error.");
              throw new Error("will:execute listener error");
            }));
            model.on("will:execute", listeners.willExecuteSecond);
            model.on("did:execute", listeners.didExecute);
            model.on("rejected:execute", listeners.rejectedExecute);

            model.executeAction(newSelection, {doExecute: doExecute});
          });

          it("should reach the doExecute function", function() {
            expect(doExecute).toHaveBeenCalled();
          });

          it("should call the first 'will:execute' listener", function() {
            expect(listeners.willExecute).toHaveBeenCalled();
          });

          it("should call the second 'will:execute' listener", function() {
            expect(listeners.willExecuteSecond).toHaveBeenCalled();
          });

          it("should call the 'did:execute' listener", function() {
            expect(listeners.didExecute).toHaveBeenCalled();
          });

          it("should not call the 'rejected:execute' listener", function() {
            expect(listeners.rejectedExecute).not.toHaveBeenCalled();
          });
        });

        describe("exception on doExecute - ", function() {
          var errorMsg = "non-user error";
          var doExecute;
          beforeEach(function() {
            doExecute = jasmine.createSpy('doExecute').and.callFake(function(willEvent) {
              throw new Error(errorMsg);
            });

            model.on("will:execute", listeners.willExecute);
            model.on("did:execute", listeners.didExecute);
            model.on("rejected:execute", listeners.rejectedExecute);

            model.executeAction(newSelection, {doExecute: doExecute});
          });

          it("should reach the doExecute function", function() {
            expect(doExecute).toHaveBeenCalled();
          });

          it("should call the will execute listener", function() {
            expect(listeners.willExecute).toHaveBeenCalled();
          });

          it("should not call the did execute listener", function() {
            expect(listeners.didExecute).not.toHaveBeenCalled();
          });

          it("should call the rejected execute listener", function() {
            expect(listeners.rejectedExecute).toHaveBeenCalled();

            var reason = listeners.rejectedExecute.calls.mostRecent().args[0];
            expect(reason instanceof RejectedExecute).toBe(true);
            expect(reason.error instanceof Error).toBe(true);
            expect(reason.error.message).toBe(errorMsg);
          });
        });
      });
    });

    describe("#validate()", function() {

      function specValidityShouldBe(spec, bool) {
        if (arguments.length !== 2) {
          throw Error("specValidityShouldBe was not invoked properly");
        }
        var model = new Model(spec);
        if (bool) {
          expect(model.validate()).toBeNull();
        } else {
          expect(model.validate()).not.toBeNull();
        }
      }

      function validSpec(spec) {
        specValidityShouldBe(spec, true);
      }

      function invalidSpec(spec) {
        specValidityShouldBe(spec, false);
      }

      it("a model spec is valid if all (declared) properties (required and optional) are properly defined", function() {
        validSpec({
          data: dataSpec
        });
      });

      it("a model spec is invalid if at least one required property is omitted", function() {
        invalidSpec();
        invalidSpec({});
      });

    });

    describe("#toJSON()", function() {
      it("should not serialize the `data` property by default", function() {
        var model = new Model({
          data: {v: {}}
        });

        expect(!!model.get("data")).toBe(true);

        var json = model.toJSON();

        expect(json instanceof Object).toBe(true);
        expect("data" in json).toBe(false);
      });

      it("should serialize the `data` property if keyArgs.omitProps.data = false", function() {
        var model = new Model({
          data: {v: {}}
        });

        expect(!!model.get("data")).toBe(true);

        var json = model.toSpec({isJson: true, omitProps: {data: false}});

        expect(json instanceof Object).toBe(true);
        expect("data" in json).toBe(true);
      });
    });

    describe("#toSpec()", function() {
      it("should serialize the `data` property", function() {
        var model = new Model({
          data: {v: {}}
        });

        expect(!!model.get("data")).toBe(true);

        var json = model.toSpec();

        expect(json instanceof Object).toBe(true);
        expect("data" in json).toBe(true);
      });
    });

    describe(".Type", function() {

      describe("#isVisualRole()", function() {
        it("should return true if type is a Mapping", function() {
          var Mapping = context.get(mappingFactory);
          var SubMapping = Mapping.extend({type: {levels: ["nominal"]}});

          expect(Model.type.isVisualRole(Mapping.type)).toBe(true);
          expect(Model.type.isVisualRole(SubMapping.type)).toBe(true);
        });

        it("should return false if type is not a Mapping", function() {
          var NotMapping = context.get("complex");

          expect(Model.type.isVisualRole(NotMapping.type)).toBe(false);
        });
      });

      describe("#eachVisualRole()", function() {
        var Mapping;
        var DerivedMapping;

        var DerivedModel;

        var forEachSpy;
        var forEachContext;

        beforeEach(function() {
          Mapping = context.get(mappingFactory);

          DerivedMapping = Mapping.extend({type: {levels: ["nominal"]}});

          DerivedModel = Model.extend({type: {
            props: [
              {name: "vr1", type: DerivedMapping},
              {name: "vr2", type: DerivedMapping},
              {name: "vr3", type: DerivedMapping}
            ]
          }});

          forEachSpy = jasmine.createSpy('forEachSpy');
          forEachContext = {};
        });

        it("should call function for each defined visual role property", function() {
          DerivedModel.type.eachVisualRole(forEachSpy);

          expect(forEachSpy).toHaveBeenCalledTimes(3);

          expect(forEachSpy).toHaveBeenCalledWith(DerivedModel.type.get("vr1"), 0, DerivedModel.type);
          expect(forEachSpy).toHaveBeenCalledWith(DerivedModel.type.get("vr2"), 1, DerivedModel.type);
          expect(forEachSpy).toHaveBeenCalledWith(DerivedModel.type.get("vr3"), 2, DerivedModel.type);
        });

        it("should break iteration if function returns false", function() {
          forEachSpy.and.returnValues(true, false);

          DerivedModel.type.eachVisualRole(forEachSpy);

          expect(forEachSpy).toHaveBeenCalledTimes(2);

          expect(forEachSpy).toHaveBeenCalledWith(DerivedModel.type.get("vr1"), 0, DerivedModel.type);
          expect(forEachSpy).toHaveBeenCalledWith(DerivedModel.type.get("vr2"), 1, DerivedModel.type);
        });

        it("should set context object on which the function is called", function() {
          DerivedModel.type.eachVisualRole(forEachSpy, forEachContext);

          forEachSpy.calls.all().forEach(function(info) {
            expect(info.object).toBe(forEachContext);
          });
        });
      });
    });
  });
});

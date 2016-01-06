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
define(["pentaho/visual/type/helper"], function(singletonTypeHelper) {

  describe("Visual Type Helper -", function() {

    describe("#getRequirements(type)", function() {
      it("should be a function", function() {
        expect(typeof singletonTypeHelper.getRequirements).toBe("function");
      });

      it("should throw if not given a non-nully type", function() {
        expect(function() {
          singletonTypeHelper.getRequirements();
        }).toThrow();
      });

      it("should get all the requirements of the first requirement set", function() {
        var type = {
          type: "ccc_bar",
          dataReqs: [{reqs: []}]
        };

        var resp = singletonTypeHelper.getRequirements(type);

        expect(resp).toBe(type.dataReqs[0].reqs);
      });

      it("should tolerate incomplete visual types and return `null`", function() {
        var resp;

        resp = singletonTypeHelper.getRequirements({});
        expect(resp).toBe(null);

        resp = singletonTypeHelper.getRequirements({dataReqs: []});
        expect(resp).toBe(null);

        resp = singletonTypeHelper.getRequirements({dataReqs: [{}]});
        expect(resp).toBe(null);

        resp = singletonTypeHelper.getRequirements({dataReqs: [{reqs: undefined}]});
        expect(resp).toBe(null);
      });
    });

    describe("#mapGeneralRequirements(type, fun)", function() {
      it("should be a function", function() {
        expect(typeof singletonTypeHelper.mapGeneralRequirements).toBe("function");
      });

      it("should throw if not given a non-nully type", function() {
        expect(function() {
          singletonTypeHelper.mapGeneralRequirements();
        }).toThrow();
      });

      it("should throw if not given a non-nully mapper function", function() {
        expect(function() {
          singletonTypeHelper.mapGeneralRequirements({}, null);
        }).toThrow();
      });

      it("should map all general requirements of the first requirement set", function() {
        var reqs = [
            {id: "A", dataStructure: "row"},
            {id: "B"},
            {id: "C"}
          ];
        var type = {
          type: "ccc_bar",
          dataReqs: [{reqs: reqs}]
        };

        var itemsById = {};
        var count = 0;
        singletonTypeHelper.mapGeneralRequirements(type, function(item) {
          itemsById[item.id] = item;
          count++;
        });

        expect(count).toBe(2);
        expect(itemsById.B).toBe(reqs[1]);
        expect(itemsById.C).toBe(reqs[2]);
      });

      it("should ignore requirements having as id a standard spec property name", function() {
        var reqs = [
            {id: "type"},
            {id: "state"}
          ];
        var type = {
          type: "ccc_bar",
          dataReqs: [{reqs: reqs}]
        };

        var count = 0;
        singletonTypeHelper.mapGeneralRequirements(type, function(item) {
          count++;
        });

        expect(count).toBe(0);
      });
    });

    describe("#mapGeneralRequirements(type, fun, ctx)", function() {
      it("should call `fun` with `ctx` as this JS context", function() {
        var type = {
          type: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "B"},
            {id: "C"}
          ]}]
        };

        var count = 0;
        var x = {};
        singletonTypeHelper.mapGeneralRequirements(type, function(item) {
          expect(this).toBe(x);
          count++;
        }, x);

        expect(count).toBeGreaterThan(0);
      });
    });

    describe("#mapVisualRoleRequirements(type, fun)", function() {
      it("should be a function", function() {
        expect(typeof singletonTypeHelper.mapVisualRoleRequirements).toBe("function");
      });

      it("should throw if not given a non-nully type", function() {
        expect(function() {
          singletonTypeHelper.mapVisualRoleRequirements();
        }).toThrow();
      });

      it("should throw if not given a non-nully mapper function", function() {
        expect(function() {
          singletonTypeHelper.mapVisualRoleRequirements({}, null);
        }).toThrow();
      });

      it("should map all visual role requirements of the first requirement set", function() {
        var reqs = [
            {id: "A"},
            {id: "B", dataStructure: "row"},
            {id: "C", dataStructure: "column"}
          ];
        var type = {
          type: "ccc_bar",
          dataReqs: [{reqs: reqs}]
        };

        var itemsById = {};
        var count = 0;
        singletonTypeHelper.mapVisualRoleRequirements(type, function(item) {
          itemsById[item.id] = item;
          count++;
        });

        expect(count).toBe(2);
        expect(itemsById.B).toBe(reqs[1]);
        expect(itemsById.C).toBe(reqs[2]);
      });

      it("should ignore requirements having as id a standard spec property name", function() {
        var reqs = [
            {id: "type", dataStructure: "row"},
            {id: "state", dataStructure: "row"}
          ];
        var type = {
          type: "ccc_bar",
          dataReqs: [{reqs: reqs}]
        };

        var count = 0;
        singletonTypeHelper.mapVisualRoleRequirements(type, function(item) {
          count++;
        });

        expect(count).toBe(0);
      });
    });

    describe("#createInstance(createOptions) -", function() {

      it("should throw when `createOptions` is nully", function() {
        expect(function() {
          singletonTypeHelper.createInstance();
        }).toThrow();
      });

      it("should throw when `createOptions.type` is nully", function() {
        expect(function() {
          singletonTypeHelper.createInstance({domElement: {}});
        }).toThrow();
      });

      it("should throw when `createOptions.domElement` is nully", function() {
        expect(function() {
          singletonTypeHelper.createInstance({type: {id: "foo", factory: "foo"}});
        }).toThrow();
      });

      it("should throw when `createOptions.type.factory` and `createOptions.type.class` are nully", function() {
        expect(function() {
          singletonTypeHelper.createInstance({type: {id: "foo"}, domElement: {}});
        }).toThrow();
      });

      describe("when `type.factory` is defined -", function() {

        it("should return a promise that resolves to an instance of the given visual type", function(done) {
          var theVisual = {};
          var instFactory = jasmine.createSpy("visualFactory")
                  .and
                  .returnValue(theVisual);

          require.undef("fooInstModule");
          define("fooInstModule", function() { return instFactory; });

          var type = {
            id: "ccc_bar",
            factory: "fooInstModule"
          };

          var createOptions = {type: type, domElement: {}};
          var result = singletonTypeHelper.createInstance(createOptions);

          // Is a "thenable"
          expect(result instanceof Object).toBe(true);
          if(!result) {
            done();
          } else {
            expect(typeof result.then).toBe("function");

            result
            .then(function(visual) {
              expect(instFactory).toHaveBeenCalledWith(createOptions);

              expect(visual).toBe(theVisual);

              done();
            }, function() {
              expect(true).toBe(false);
              done();
            });
          }
        });

        it("should return a promise that is rejected when the factory module's function returns nully", function(done) {
          var instFactory = jasmine.createSpy("visualFactory")
                  .and
                  .returnValue(null);

          require.undef("fooInstModule");
          define("fooInstModule", function() { return instFactory; });

          var type = {
            id: "ccc_bar",
            factory: "fooInstModule"
          };

          var createOptions = {type: type, domElement: {}};
          var result = singletonTypeHelper.createInstance(createOptions);

          // Is a "thenable"
          result
          .then(function(visual) {
            expect(true).toBe(false);
            done();
          }, function(error) {
            expect(error instanceof Error).toBe(true);
            done();
          });
        });

        it("should return a promise that is rejected when the factory module's function throws", function(done) {
          var instFactory = function() {
              throw new Error("Invalid factory");
            };

          require.undef("fooInstModule");
          define("fooInstModule", function() { return instFactory; });

          var type = {
            id: "ccc_bar",
            factory: "fooInstModule"
          };

          var createOptions = {type: type, domElement: {}};
          var result = singletonTypeHelper.createInstance(createOptions);

          // Is a "thenable"
          result
          .then(function(visual) {
            expect(true).toBe(false);
            done();
          }, function(error) {
            expect(error instanceof Error).toBe(true);
            done();
          });
        });

        it("should return a promise that is rejected when the factory module is not defined or times out", function(done) {
          require.undef("fooInstModule");
          var type = {
            id: "ccc_bar",
            factory: "fooInstModule"
          };

          console.log("Follows an error message saying there's no timestamp for module 'fooInstModule'.");
          var createOptions = {type: type, domElement: {}};
          var result = singletonTypeHelper.createInstance(createOptions);

          // Is a "thenable"
          result
          .then(function(visual) {
            expect(true).toBe(false);
            done();
          }, function(error) {
            expect(error instanceof Error).toBe(true);
            done();
          });
        });
      });

      describe("when `type.class` is defined -", function() {
        var global, type, calledCount;

        function VisualKlass(arg) {
          this.arg = arg;
          calledCount++;
        }

        beforeEach(function() {
          global = (function() { return this; }());
          global.my = {VisualKlass: VisualKlass};

          type = {
            id: "ccc_bar",
            "class": "my.VisualKlass"
          };

          calledCount = 0;
        });

        afterEach(function() {
          delete global.my;
        });

        it("should return a promise that resolves to an instance of the class", function(done) {
          var createOptions = {type: type, domElement: {}};
          var result = singletonTypeHelper.createInstance(createOptions);

          // Is a "thenable"
          expect(result instanceof Object).toBe(true);
          if(!result) {
            done();
          } else {
            expect(typeof result.then).toBe("function");

            result
            .then(function(visual) {

              expect(calledCount).toBe(1);

              expect(visual instanceof VisualKlass).toBe(true);

              done();
            }, function(ex) {
              console.log("error: " + ex);
              expect(true).toBe(false);
              done();
            });
          }
        });

        it("should call the class constructor with the domElement create option", function(done) {
          var domElem = {};
          var createOptions = {type: type, domElement: domElem};
          var result = singletonTypeHelper.createInstance(createOptions);

          result
            .then(function(visual) {
              expect(visual.arg).toBe(domElem);
              done();
            }, function(ex) {
              console.log("error: " + ex);
              expect(true).toBe(false);
              done();
            });
        });

        it("should return a promise that is rejected when the class constructor throws", function(done) {
          function VisualKlassFake(arg) {
            throw new Error("Buggy");
          }
          global.my.VisualKlass = VisualKlassFake;

          var createOptions = {type: type, domElement: {}};
          var result = singletonTypeHelper.createInstance(createOptions);

          result
            .then(function(visual) {
              expect(true).toBe(false);
              done();
            }, function(reason) {
              expect(reason instanceof Error).toBe(true);
              done();
            });
        });

        it("should return a promise that is rejected when the class constructor is not defined", function(done) {
          global.my.VisualKlass = null;

          var createOptions = {type: type, domElement: {}};
          var result = singletonTypeHelper.createInstance(createOptions);

          result
            .then(function(visual) {
              expect(true).toBe(false);
              done();
            }, function(reason) {
              expect(reason instanceof Error).toBe(true);
              done();
            });
        });

        it("should return a promise that is rejected when the class constructor is not defined (ii)", function(done) {
          delete global.my;

          var createOptions = {type: type, domElement: {}};
          var result = singletonTypeHelper.createInstance(createOptions);

          result
            .then(function(visual) {
              expect(true).toBe(false);
              done();
            }, function(reason) {
              expect(reason instanceof Error).toBe(true);
              done();
            });
        });
      });
    });
  });
});

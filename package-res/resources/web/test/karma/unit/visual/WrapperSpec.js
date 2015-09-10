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
define([
  "pentaho/visual/type/registryMock",
  "pentaho/visual/color/paletteRegistry",
  "pentaho/visual/data/Table"
], function(typeRegistryMock, paletteRegistry, DataTable) {

  describe("VisualWrapper —", function() {
    var Aux, VisualWrapper;

    // Initialization.
    // Only performed on the first test.
    // Installs a type/registry mock in requirejs and re-loads the VisualWrapper module.
    // Defines an Aux class that allows creating "VisualWrapper" instances without
    // running the constructor.
    beforeEach(function(done) {
      if(Aux) return done();

      require.undef("pentaho/visual/type/registry");
      require.undef("pentaho/visual/Wrapper");

      // Install type registry mock
      define("pentaho/visual/type/registry", typeRegistryMock);

      require(["pentaho/visual/Wrapper"], function(_VisualWrapper_) {
        VisualWrapper = _VisualWrapper_;

        Aux = function() {};
        Aux.prototype = VisualWrapper.prototype;

        // Clear to allow reloading of original definitions.
        require.undef("pentaho/visual/type/registry");
        require.undef("pentaho/visual/Wrapper");

        done();
      });
    });

    beforeEach(function() {
      typeRegistryMock.reset();
    });

    describe("Constructor(domElem, containerTypeId) -", function() {
      it("should be a function", function() {
        expect(typeof VisualWrapper).toBe("function");
      });

      it("should return an instance of it, when called", function() {
        var inst = new VisualWrapper(document.createElement("div"));
        expect(inst instanceof VisualWrapper).toBe(true);
      });

      it("should throw if called with no `domElem`", function() {
        expect(function() {
          new VisualWrapper();
        }).toThrow();
      });

      it("should store the given `containerTypeId` in `containerTypeId`", function() {
        var domElem = document.createElement("div");
        var wrapper = new VisualWrapper(domElem, "myContainer");

        expect(wrapper.containerTypeId).toBe("myContainer");
      });

      it("should call `_setDomElem`", function() {
        spyOn(VisualWrapper.prototype, "_setDomElem");

        var domElem = document.createElement("div");
        var wrapper = new VisualWrapper(domElem);

        expect(VisualWrapper.prototype._setDomElem).toHaveBeenCalledWith(domElem);
      });

      it("should be created with an empty highlights array", function() {
        var domElem = document.createElement("div");
        var wrapper = new VisualWrapper(domElem);

        expect(wrapper.highlights).toEqual([]);
      });

      it("should be created in a non-async state", function() {
        var domElem = document.createElement("div");
        var wrapper = new VisualWrapper(domElem);
        expect(function() {
          wrapper._checkAsyncState();
        }).not.toThrow();
      });
    });

    describe("#_setDomElem(domElem)", function() {
      var wrapper, domElem;

      beforeEach(function() {
        wrapper = new Aux();
        domElem = document.createElement("div");
      });

      it("should store the given `domElem` in `domELement`", function() {
        wrapper._setDomElem(domElem);
        expect(wrapper.domElement).toBe(domElem);
      });

      it("should call `_resetDomElem`", function() {

        spyOn(wrapper, "_resetDomElem");

        wrapper._setDomElem(domElem);

        expect(wrapper._resetDomElem).toHaveBeenCalled();
      });
    });

    describe("#_resetDomElem()", function() {
      var wrapper, domElem;

      beforeEach(function() {
        wrapper = new Aux();
        domElem = wrapper.domElement = document.createElement("div");
      });

      it("should create `visualElement`", function() {
        wrapper._resetDomElem();

        expect(wrapper.visualElement != null).toBe(true);
        expect(wrapper.visualElement).not.toBe(domElem);
      });

      it("should create `visualElement` as a child of `domElement`", function() {
        wrapper._resetDomElem();

        expect(wrapper.visualElement.parentNode).toBe(domElem);
        expect(domElem.childNodes.length).toBe(1);
      });

      it("should clear the contents of `domElement`", function() {
        domElem.appendChild(document.createElement("div"));
        domElem.appendChild(document.createElement("div"));
        domElem.appendChild(document.createElement("div"));
        expect(domElem.childNodes.length).toBe(3);

        wrapper._resetDomElem();

        expect(domElem.childNodes.length).toBe(1);
      });

      it("should create `visualElement` with the same width and height as `domElement`", function() {
        // Must add to the document, or layout won't happen and
        // read measures will all be "0px".
        document.body.appendChild(domElem);

        try {
          domElem.setAttribute("style", "width:100px;height:300px;");

          wrapper._resetDomElem();

          expect(wrapper.visualElement.style.width ).toBe("100px");
          expect(wrapper.visualElement.style.height).toBe("300px");
        } finally {
          document.body.removeChild(domElem);
        }
      });

      it("should create `visualElement` with the css class 'visual-element'", function() {
        wrapper._resetDomElem();

        expect(wrapper.visualElement.className).toBe("visual-element");
      });

      it("should create `visualElement` of tag name svg when `domElement` is svg", function() {
        domElem = wrapper.domElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        wrapper._resetDomElem();

        expect(wrapper.visualElement.tagName).toBe("svg");
      });
    });

    describe("#data", function() {
      it("should accept setting to a DataTable", function() {
        var wrapper = new Aux();
        var data = new DataTable();
        wrapper.data = data;
        expect(wrapper.data).toBe(data);
      });

      it("should accept setting to a JSON string", function() {
        var wrapper = new Aux();
        wrapper.data = JSON.stringify({cols: [], rows: []});
        expect(wrapper.data instanceof DataTable).toBe(true);
      });

      it("should throw if set to nully", function() {
        var wrapper = new Aux();
        expect(function() {
          wrapper.data = null;
        }).toThrow();
      });
    });

    describe("#visualSpec", function() {
      it("should accept setting to nully", function() {
        var wrapper = new Aux();
        expect(function() {
          wrapper.visualSpec = null;
        }).not.toThrow();
      });

      it("should accept setting to a plain object spec", function() {
        var wrapper = new Aux();
        var spec = {type: "ccc_bar"};
        var type = {id:   "ccc_bar"};

        typeRegistryMock.add(type);

        wrapper.visualSpec = spec;
        expect(wrapper.visualSpec).toBe(spec);
      });

      it("should call `typeRegistry.get` to resolve the given type", function() {
        var wrapper = new Aux();
        var spec = {type: "ccc_bar"};
        var type = {id:   "ccc_bar"};

        typeRegistryMock.add(type);

        spyOn(typeRegistryMock, "get").and.callThrough();

        wrapper.containerTypeId = "foo";
        wrapper.visualSpec = spec;

        expect(typeRegistryMock.get).toHaveBeenCalledWith(type.id, "foo", true);
      });

      it("should set `visualType` to the resolved visual type", function() {
        var wrapper = new Aux();
        var spec = {type: "ccc_bar"};
        var type = {id:   "ccc_bar"};

        typeRegistryMock.add(type);

        wrapper.containerTypeId = "foo";
        wrapper.visualSpec = spec;

        expect(wrapper.visualType).toBe(type);
      });

      it("should throw if the given type is not defined or is disabled", function() {
        var wrapper = new Aux();
        expect(function(){
          wrapper.visualSpec = {type: "ccc_bar"};
        }).toThrow();
      });

      it("should do nothing if set to the same type object", function() {
        var wrapper = new Aux();
        var spec = {type: "ccc_bar"};
        var type = {id:   "ccc_bar"};

        typeRegistryMock.add(type);

        spyOn(typeRegistryMock, "get").and.callThrough();

        wrapper.containerTypeId = "foo";

        wrapper.visualSpec = spec;

        wrapper.visualSpec = spec;

        expect(typeRegistryMock.get.calls.count()).toBe(1);
        expect(wrapper.visualSpec).toBe(spec);
      });

      it("should dispose an existing visual when set to null", function() {
        typeRegistryMock.add({id: "ccc_bar"});

        var wrapper = new Aux();

        spyOn(wrapper, "_disposeVisual");

        wrapper.visualSpec = {type: "ccc_bar"};

        // set to null

        wrapper.visualSpec = null;

        expect(wrapper._disposeVisual).toHaveBeenCalled();
      });

      it("should clear the current visual type when set to null", function() {
        typeRegistryMock.add({id: "ccc_bar"});

        var wrapper = new Aux();

        wrapper.visualSpec = {type: "ccc_bar"};

        // set to null

        wrapper.visualSpec = null;

        expect(wrapper.visualType).toBe(null);
      });

      it("should dispose an existing visual when set to a spec of a different visual type", function() {
        typeRegistryMock.add({id: "ccc_bar"});
        typeRegistryMock.add({id: "ccc_foo"});

        var wrapper = new Aux();

        spyOn(wrapper, "_disposeVisual");

        wrapper.visualSpec = {type: "ccc_bar"};

        wrapper.visualSpec = {type: "ccc_foo"};

        expect(wrapper._disposeVisual).toHaveBeenCalled();
      });

      it("should assume the new visual type when set to a spec of a different visual type", function() {
        typeRegistryMock.add({id: "ccc_bar"});
        var typeFoo = {id: "ccc_foo"};
        typeRegistryMock.add(typeFoo);

        var wrapper = new Aux();

        spyOn(wrapper, "_disposeVisual");

        wrapper.visualSpec = {type: "ccc_bar"};

        wrapper.visualSpec = {type: "ccc_foo"};

        expect(wrapper.visualType).toBe(typeFoo);
      });

      it("should maintain the existing visual when set to a different spec of the same visual type", function() {
        var typeBar = {id: "ccc_bar"};

        typeRegistryMock.add(typeBar);

        var wrapper = new Aux();

        spyOn(wrapper, "_disposeVisual");

        wrapper.visualSpec = {type: "ccc_bar"};

        expect(wrapper._disposeVisual.calls.count()).toBe(0);

        wrapper.visualSpec = {type: "ccc_bar"};

        expect(wrapper._disposeVisual.calls.count()).toBe(0);
      });

      it("should maintain the existing visual type when set to a different spec of the same visual type", function() {
        var typeBar = {id: "ccc_bar"};

        typeRegistryMock.add(typeBar);

        spyOn(typeRegistryMock, "get").and.callThrough();

        var wrapper = new Aux();

        wrapper.visualSpec = {type: "ccc_bar"};

        expect(typeRegistryMock.get.calls.count()).toBe(1);
        expect(wrapper.visualType).toBe(typeBar);

        wrapper.visualSpec = {type: "ccc_bar"};

        expect(typeRegistryMock.get.calls.count()).toBe(1);
        expect(wrapper.visualType).toBe(typeBar);
      });
    });

    describe("#update()", function() {
      // Blank visualization
      it(
        "should return a resolved promise with value `undefined` when there is no visual spec",
        function(done) {
          var domElem = document.createElement("div");
          var wrapper = new VisualWrapper(domElem);
          var result  = wrapper.update();

          expect(result != null).toBe(true);
          expect(typeof result.then).toBe("function");
          result.then(function(value) {
            expect(value).toBe(undefined);
            done();
          }, function() {
            expect(true).toBe(false);
          });
        });

      // Visualization but no data.
      it("should throw a synchronous error if data is not specified", function() {
        var type = {id: "ccc_bar"};
        typeRegistryMock.add(type);

        var domElem = document.createElement("div");
        var wrapper = new VisualWrapper(domElem);
        wrapper.visualSpec = {type: "ccc_bar"};
        expect(function() {

          wrapper.update();

        }).toThrow();
      });

      it("should create a visual and call its draw method", function(done) {

        var theVisual = {
          draw: jasmine.createSpy("draw")
        };

        var instFactory = jasmine.createSpy("visualFactory")
                .and
                .returnValue(theVisual);

        require.undef("fooBarModule");
        define("fooBarModule", function() {
          return instFactory;
        });

        var type = {
          id: "ccc_bar",
          factory: "fooBarModule"
        };
        typeRegistryMock.add(type);

        var domElem = document.createElement("div");
        var wrapper = new VisualWrapper(domElem);

        wrapper.visualSpec = {type: "ccc_bar"};
        wrapper.data = {cols: [], rows: []};

        wrapper.update().then(function() {
          expect(instFactory).toHaveBeenCalled();
          expect(wrapper.visual).toBe(theVisual);
          expect(theVisual.draw).toHaveBeenCalled();

          require.undef("fooBarModule");
          done();
        }, function() {
          expect(true).toBe(false);
        });
      });

      it("should call visual.draw with correct arguments", function(done) {
        var theVisual = {
          draw: jasmine.createSpy("draw")
        };

        var instFactory = jasmine.createSpy("visualFactory")
                .and
                .returnValue(theVisual);

        require.undef("fooBarModule");
        define("fooBarModule", function() {
          return instFactory;
        });

        var type = {
          id: "ccc_bar",
          factory: "fooBarModule"
        };
        typeRegistryMock.add(type);

        var domElem = document.createElement("div");
        var wrapper = new VisualWrapper(domElem);

        wrapper.visualSpec = {type: "ccc_bar"};
        wrapper.data = {cols: [], rows: []};

        wrapper.update().then(function() {
          var args = theVisual.draw.calls.first().args;

          var data = args[0];
          expect(data).toBe(wrapper.data);

          var drawSpec = args[1];
          expect(drawSpec instanceof Object).toBe(true);
          expect(drawSpec.type).toBe("ccc_bar");
          expect(typeof drawSpec.width ).toBe("number");
          expect(typeof drawSpec.height).toBe("number");
          expect(drawSpec.highlights).toBe(wrapper.highlights);
          expect(drawSpec.palette).toBe(wrapper.palette);

          require.undef("fooBarModule");
          done();
        }, function() {
          expect(true).toBe(false);
        });
      });
    });
  });
});

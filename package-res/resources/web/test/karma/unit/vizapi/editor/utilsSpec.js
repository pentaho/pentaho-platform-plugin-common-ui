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
define(["pentaho/visual/editor/utils"], function(singletonEditorUtils) {

  function MapEditorProps(dict) {
    this.get = function(p) {
      return dict.hasOwnProperty(p) ? dict[p] : null;
    };

    this.forEach = function(f, x) {
      for(var p in dict)
        if(dict.hasOwnproperty(p))
          f.call(x, p);
    };
  }

  function EditModel(dict) {

    this.byId = function(id) {
      var item = {};
      item.id = id;
      item.value = dict[id];
      return item;
    };
  }

  describe("Visual Editor Utils -", function() {

    describe("#translateEditorProperties(type, editorTypeId, editorProps, filterPropsList)", function() {
      it("should be a function", function() {
        expect(typeof singletonEditorUtils.translateEditorProperties).toBe("function");
      });

      it("should throw if `type` is not specified", function() {
        expect(function() {
          singletonEditorUtils.translateEditorProperties();
        }).toThrow();
      });

      it("should throw if `editorTypeId` is not specified", function() {
        expect(function() {
          singletonEditorUtils.translateEditorProperties({});
        }).toThrow();
      });

      it("should throw if `editorProps` is not specified", function() {
        expect(function() {
          singletonEditorUtils.translateEditorProperties({}, "fooo");
        }).toThrow();
      });

      describe("type/config specifies `translateEditorProperties`", function() {
        it("should call `translateEditorProperties` with `type` as `this` JS context", function() {
          var type = {
            id: "ccc_bar",
            translateEditorProperties: function() {}
          };

          var editorTypeId = "analyzer";
          var editorProps = {};

          spyOn(type, "translateEditorProperties");

          singletonEditorUtils.translateEditorProperties(type, editorTypeId, editorProps);

          expect(type.translateEditorProperties).toHaveBeenCalled();
          expect(type.translateEditorProperties.calls.first().object).toBe(type);
        });

        it("should call `translateEditorProperties` with all the expected arguments", function() {
          var type = {
            id: "ccc_bar",
            translateEditorProperties: function() {}
          };

          var editorTypeId = "analyzer";
          var editorProps = {};
          var filterPropsList = ["foo", "bar"];

          spyOn(type, "translateEditorProperties");

          singletonEditorUtils.translateEditorProperties(type, editorTypeId, editorProps, filterPropsList);

          expect(type.translateEditorProperties).toHaveBeenCalled();

          var call = type.translateEditorProperties.calls.first();

          expect(call.args.length).toBe(4);

          expect(call.args[0]).toBe(editorTypeId);
          expect(call.args[1]).toBe(editorProps);
          expect(call.args[2]).toBe(filterPropsList);

          var filterPropsMap = call.args[3];
          expect(filterPropsMap instanceof Object).toBe(true);
          filterPropsList.forEach(function(p) {
            expect(filterPropsMap[p]).toBe(true);
          });
        });

        it("should return an empty object if `translateEditorProperties` returns nully", function() {
          var type = {
            id: "ccc_bar",
            translateEditorProperties: function() {}
          };

          var editorTypeId = "analyzer";
          var editorProps = {};

          var result = singletonEditorUtils.translateEditorProperties(type, editorTypeId, editorProps);

          expect(result).toEqual({});
        });

        it("should filter the result of `translateEditorProperties` to respect `filterPropsList`", function() {
          var type = {
            id: "ccc_bar",
            translateEditorProperties: function() { return {"foo": 1, "bar": 2, "dudu": 3}; }
          };

          var editorTypeId = "analyzer";
          var editorProps = {};
          var filterPropsList = ["foo", "bar"];

          var result = singletonEditorUtils.translateEditorProperties(type, editorTypeId, editorProps, filterPropsList);

          expect(result.foo).toBe(1);
          expect(result.bar).toBe(2);
          expect("dudu" in result).toBe(false);
        });
      });

      describe("type/config does not specify translateEditorProperties", function() {

        it("should copy defined editor props that have the name of a general data req", function() {
          var type = {
              id: "ccc_bar",
              dataReqs: [{reqs: [
                {id: "zas", dataStructure: "row"},
                {id: "foo"},
                {id: "bar"}
              ]}]
            };
          var editorTypeId = "analyzer";
          var editorProps = new MapEditorProps({
              foo: 1,
              bar: undefined,
              zas: 3,
            });

          var visualProps = singletonEditorUtils.translateEditorProperties(type, editorTypeId, editorProps);

          expect(visualProps instanceof Object).toBe(true);
          expect(visualProps.foo).toBe(1);
          expect('bar' in visualProps).toBe(false);
          expect('zas' in visualProps).toBe(false);
        });

        it("should only include properties in `filterPropsList`, when specified", function() {
          var type = {
              id: "ccc_bar",
              dataReqs: [{reqs: [
                {id: "zas"},
                {id: "foo"},
                {id: "bar"}
              ]}]
            };
          var editorTypeId = "analyzer";
          var editorProps = new MapEditorProps({
              foo: 1,
              bar: 2,
              zas: 3,
            });
          var filterPropsList = ["foo", "zas"];

          var visualProps = singletonEditorUtils.translateEditorProperties(type, editorTypeId, editorProps, filterPropsList);

          expect(visualProps instanceof Object).toBe(true);
          expect(visualProps.foo).toBe(1);
          expect("bar" in visualProps).toBe(false);
          expect(visualProps.zas).toBe(3);
        });
      });
    });

    describe("#processEditModelChange(type, spec, editModel, changedProp)", function() {
      it("should be a function", function() {
        expect(typeof singletonEditorUtils.processEditModelChange).toBe("function");
      });

      it("should throw if `type` is not specified", function() {
        expect(function() {
          singletonEditorUtils.processEditModelChange();
        }).toThrow();
      });

      it("should throw if `spec` is not specified", function() {
        expect(function() {
          singletonEditorUtils.processEditModelChange({});
        }).toThrow();
      });

      it("should throw if `editModel` is not specified", function() {
        expect(function() {
          singletonEditorUtils.processEditModelChange({}, {});
        }).toThrow();
      });

      it("should return `undefined`", function() {
        var type = {
              id: "ccc_bar"
            };
        var spec = {
              type: "ccc_bar"
            };

        var editModel = {};
        var result = singletonEditorUtils.processEditModelChange(type, spec, editModel);

        expect(result).toBe(undefined);
      });

      it("should call `type.updateEditModel` if it is implemented", function() {
        var type = {
              id: "ccc_bar",
              updateEditModel: function() {}
            };

        var spec = {
              type: "ccc_bar"
            };

        var editModel = {
            };

        var changedProp = "foo";

        spyOn(type, "updateEditModel");

        singletonEditorUtils.processEditModelChange(type, spec, editModel, changedProp);

        expect(type.updateEditModel).toHaveBeenCalled();
        expect(type.updateEditModel).toHaveBeenCalledWith(editModel, changedProp);
        expect(type.updateEditModel.calls.first().object).toBe(type);
      });

      it("should store `editModel` changes, for general requirements, in the `spec`", function() {
        var type = {
              id: "ccc_bar",
              dataReqs: [{reqs: [
                {id: "zas"},
                {id: "foo"},
                {id: "bar"}
              ]}]
            };

        var spec = {
              type: "ccc_bar"
            };

        var editModel = new EditModel({
              foo: 1,
              bar: 2,
              zas: 3
            });

        singletonEditorUtils.processEditModelChange(type, spec, editModel);

        expect(spec.foo).toBe(1);
        expect(spec.bar).toBe(2);
        expect(spec.zas).toBe(3);
      });
    });

  });
});

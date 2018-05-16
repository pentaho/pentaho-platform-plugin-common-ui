/*!
 * Copyright 2017 Hitachi Vantara.  All rights reserved.
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
  "pentaho/visual/action/Base",
  "pentaho/visual/action/Select",
  "pentaho/visual/action/SelectionModes",
  "tests/pentaho/util/errorMatch"
], function(BaseAction, SelectAction, SelectionModes, errorMatch) {

  "use strict";

  describe("pentaho.visual.action.Select", function() {

    var customSelectionMode = function() {};

    it("should be defined", function() {

      expect(typeof SelectAction).toBe("function");
    });

    it("should extend visual.action.Base", function() {

      expect(SelectAction.prototype instanceof BaseAction).toBe(true);
    });

    it("should mix in visual.action.mixins.Positioned", function() {
      // Unfortunately, there's no better way to do test this, now.
      expect("position" in SelectAction.prototype).toBe(true);
    });

    it("should mix in visual.action.mixins.Data", function() {
      // Unfortunately, there's no better way to do test this, now.
      expect("dataFilter" in SelectAction.prototype).toBe(true);
    });

    describe("new ({selectionMode})", function() {

      describe("spec.selectionMode", function() {

        it("should respect a specified function", function() {
          var selectAction = new SelectAction({selectionMode: customSelectionMode});

          expect(selectAction.selectionMode).toBe(customSelectionMode);
        });

        it("should accept specifying any of the standard mode names", function() {

          Object.keys(SelectionModes).forEach(function(name) {

            var selectAction = new SelectAction({selectionMode: name});

            expect(selectAction.selectionMode).toBe(SelectionModes[name]);
          });
        });

        it("should throw when specifying an unknown mode name", function() {

          expect(function() {
            var selectAction = new SelectAction({selectionMode: "foo"});
          }).toThrow(errorMatch.argInvalid("selectionMode"));
        });

        it("should throw when specifying something other than a string or a function", function() {

          expect(function() {
            var selectAction = new SelectAction({selectionMode: 1});
          }).toThrow(errorMatch.argInvalidType("selectionMode", ["string", "function"], "number"));
        });
      });
    });

    describe("#selectionMode", function() {

      it("should respect a set function", function() {
        var selectAction = new SelectAction();

        selectAction.selectionMode = customSelectionMode;

        expect(selectAction.selectionMode).toBe(customSelectionMode);
      });

      it("should accept specifying any of the standard mode names", function() {

        Object.keys(SelectionModes).forEach(function(name) {

          var selectAction = new SelectAction();

          selectAction.selectionMode = name;

          expect(selectAction.selectionMode).toBe(SelectionModes[name]);
        });
      });

      it("should throw when specifying an unknown mode name", function() {

        var selectAction = new SelectAction();

        expect(function() {
          selectAction.selectionMode = "foo";
        }).toThrow(errorMatch.argInvalid("selectionMode"));
      });

      it("should throw when specifying something other than a string or a function", function() {

        var selectAction = new SelectAction();

        expect(function() {
          selectAction.selectionMode = 1;
        }).toThrow(errorMatch.argInvalidType("selectionMode", ["string", "function"], "number"));
      });

      it("should default to defaultSelectionMode when set to a nully value", function() {

        return require.using(["pentaho/visual/action/Select"], function(SelectAction) {

          var customDefaultSelectionMode = function() {};

          SelectAction.type.defaultSelectionMode = customDefaultSelectionMode;

          // ---

          var selectAction = new SelectAction();

          selectAction.selectionMode = customSelectionMode;

          selectAction.selectionMode = null;

          expect(selectAction.selectionMode).toBe(customDefaultSelectionMode);

          // ---

          selectAction.selectionMode = customSelectionMode;

          selectAction.selectionMode = undefined;

          expect(selectAction.selectionMode).toBe(customDefaultSelectionMode);
        });
      });

      // region Serialization
      it("should not serialize when reset", function() {

        var selectAction = new SelectAction();

        selectAction.selectionMode = null;

        var spec = selectAction.toSpec();

        expect("selectionMode" in spec).toBe(false);
      });

      it("should serialize the selection mode name when given as a name", function() {

        var selectAction = new SelectAction();

        selectAction.selectionMode = "add";

        var spec = selectAction.toSpec();

        expect(spec.selectionMode).toBe("add");
      });

      it("should serialize a selection mode function as spec", function() {

        var selectAction = new SelectAction();

        selectAction.selectionMode = customSelectionMode;

        var spec = selectAction.toSpec();

        expect(spec.selectionMode).toBe(customSelectionMode);
      });

      it("should serialize a selection mode function as json", function() {

        var selectAction = new SelectAction();

        selectAction.selectionMode = customSelectionMode;

        var spec = selectAction.toSpec({isJson: true});

        expect(spec.selectionMode).toBe(customSelectionMode.toString());
      });
      // endregion
    });

    describe(".Type", function() {
      var localRequire;

      var SelectAction;
      var SelectionModes;
      var selectActionType;
      var errorMatch;

      beforeEach(function() {

        localRequire = require.new();

        return localRequire.promise([
          "pentaho/visual/action/Select",
          "pentaho/visual/action/SelectionModes",
          "tests/pentaho/util/errorMatch"
        ])
        .then(function(deps) {
          SelectAction = deps[0];
          selectActionType = SelectAction.type;
          SelectionModes = deps[1];
          errorMatch = deps[2];
        });
      });

      afterEach(function() {
        localRequire.dispose();
      });

      describe("#isSync", function() {

        it("should be synchronous", function() {

          expect(selectActionType.isSync).toBe(true);
        });
      });

      describe("#defaultSelectionMode", function() {

        it("should have a default value of SelectionModes.replace", function() {

          expect(selectActionType.defaultSelectionMode).toBe(SelectionModes.replace);
        });

        it("should respect a set function", function() {

          selectActionType.defaultSelectionMode = customSelectionMode;

          expect(selectActionType.defaultSelectionMode).toBe(customSelectionMode);
        });

        it("should reset when set to a nully value", function() {

          selectActionType.defaultSelectionMode = customSelectionMode;

          selectActionType.defaultSelectionMode = null;

          expect(selectActionType.defaultSelectionMode).toBe(SelectionModes.replace);

          // ---

          selectActionType.defaultSelectionMode = customSelectionMode;

          selectActionType.defaultSelectionMode = undefined;

          expect(selectActionType.defaultSelectionMode).toBe(SelectionModes.replace);
        });

        it("should accept any of the standard selection mode names", function() {

          Object.keys(SelectionModes).forEach(function(name) {

            selectActionType.defaultSelectionMode = null;

            selectActionType.defaultSelectionMode = name;

            expect(selectActionType.defaultSelectionMode).toBe(SelectionModes[name]);
          });
        });

        it("should throw if given an unknown mode name", function() {

          expect(function() {
            selectActionType.defaultSelectionMode = "foo";
          }).toThrow(errorMatch.argInvalid("defaultSelectionMode"));
        });

        it("should throw if given something other than a string or a function", function() {

          expect(function() {
            selectActionType.defaultSelectionMode = 1;
          }).toThrow(errorMatch.argInvalidType("defaultSelectionMode", ["string", "function"], "number"));
        });

        // region Serialization
        it("should not serialize when reset", function() {

          selectActionType.defaultSelectionMode = null;

          var spec = selectActionType.toSpec();

          expect("defaultSelectionMode" in spec).toBe(false);
        });

        it("should serialize the selection mode name when given as a name", function() {

          selectActionType.defaultSelectionMode = "add";

          var spec = selectActionType.toSpec();

          expect(spec.defaultSelectionMode).toBe("add");
        });

        it("should serialize a selection mode function as spec", function() {

          selectActionType.defaultSelectionMode = customSelectionMode;

          var spec = selectActionType.toSpec();

          expect(spec.defaultSelectionMode).toBe(customSelectionMode);
        });

        it("should serialize a selection mode function as json", function() {

          selectActionType.defaultSelectionMode = customSelectionMode;

          var spec = selectActionType.toSpec({isJson: true});

          expect(spec.defaultSelectionMode).toBe(customSelectionMode.toString());
        });
        // endregion
      });
    });
  });
});

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
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  var context;
  var BaseAction;
  var PositionedActionMixin;
  var CustomPositionedAction;

  beforeAll(function(done) {

    Context.createAsync()
        .then(function(_context) {

          context = _context;

          return context.getDependencyAsync({
            BaseAction: "pentaho/visual/action/base",
            PositionedActionMixin: "pentaho/visual/action/mixins/positioned"
          });
        })
        .then(function(types) {
          BaseAction = types.BaseAction;
          PositionedActionMixin = types.PositionedActionMixin;

          // Non-abstract, empty action, mixed-in with positioned mixin.
          CustomPositionedAction = BaseAction.extend({
            $type: {
              mixins: [PositionedActionMixin]
            }
          });
        })
        .then(done, done.fail);
  });

  describe("pentaho.visual.action.mixins.Positioned", function() {

    it("should be defined", function() {

      expect(typeof PositionedActionMixin).toBe("function");
    });

    describe("#_init({position})", function() {

      it("should accept spec.position", function() {

        var position = {x: 0, y: 0};

        // ---

        var action = new CustomPositionedAction({position: position});

        // ---

        expect(action.position).toBe(position);
      });

      it("should convert spec.position undefined to null", function() {

        var action = new CustomPositionedAction({position: undefined});

        // ---

        expect(action.position).toBe(null);
      });

      it("should default to null", function() {

        var action = new CustomPositionedAction();

        // ---

        expect(action.position).toBe(null);
      });
    });

    describe("#position", function() {

      it("should respect a given position", function() {

        var position = {x: 0, y: 0};

        // ---

        var action = new CustomPositionedAction();
        action.position = position;

        // ---

        expect(action.position).toBe(position);
      });

      it("should allow setting to nully", function() {

        var position = {x: 0, y: 0};

        var action = new CustomPositionedAction();

        action.position = position;

        // ---

        action.position = null;

        // ---

        expect(action.position).toBe(null);

        // ---
        // ---

        action.position = position;

        // ---

        action.position = undefined;

        // ---

        expect(action.position).toBe(null);
      });

      describe("#toSpecInContext()", function() {

        it("should not serialize a null position", function() {

          var action = new CustomPositionedAction();

          // ---

          var spec = action.toSpec();

          // ---

          expect("position" in spec).toBe(false);
        });

        it("should serialize a non-null position", function() {

          var position = {x: 0, y: 0};
          var action = new CustomPositionedAction({position: position});

          // ---

          var spec = action.toSpec();

          // ---

          expect(spec.position).not.toBe(position);
          expect(spec.position).toEqual(position);
        });
      });
    });
  });
});

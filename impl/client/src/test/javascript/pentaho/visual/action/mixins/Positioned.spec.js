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
  "pentaho/visual/action/Base",
  "pentaho/visual/action/mixins/Positioned"
], function(BaseAction, PositionedActionMixin) {

  "use strict";

  var CustomPositionedAction;

  beforeAll(function() {

    // Non-abstract, empty action, mixed-in with positioned mixin.
    CustomPositionedAction = BaseAction.extend().mix(PositionedActionMixin);
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

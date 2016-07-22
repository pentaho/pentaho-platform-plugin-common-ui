/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/lang/Event",
  "pentaho/visual/base/events/DidCreate",
  "pentaho/type/Context",
  "pentaho/visual/base/View",
  "pentaho/visual/base"
], function(Event, DidCreate,
            Context, View, modelFactory) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.visual.base.events.DidCreate -", function() {
    var model, Model;

    beforeEach(function() {
      var context = new Context();
      Model = context.get(modelFactory);
      model = new Model();
    });

    it("should extend Event", function() {
      expect(DidCreate.prototype instanceof Event).toBe(true);
    });

    it("static property type should return full type name", function() {
      expect(DidCreate.type).toBe("did:create");
    });

    it("static property type should be read-only", function() {
      expect(function() {
        DidCreate.type = "New Name";
      }).toThrowError(TypeError);
    });

    describe("instances -", function() {
      var event, element;

      beforeEach(function() {
        element = document.createElement("div");
        var DerivedView = View.extend({
          get domNode() { return element; }
        });
        event = new DidCreate(new DerivedView(model));
      });

      it("should extend Event", function() {
        expect(event instanceof Event).toBe(true);
      });

      it("should not be cancelable", function() {
        expect(event.isCancelable).toBe(false);
      });

      it("domNode property should be accessible from source", function() {
        expect(event.source.domNode).toBe(element);
      });

      it("domNode property should be accessible from `domNode` alias", function() {
        expect(event.domNode).toBe(element);
      });

      it("domNode property alias should return a DOM node", function() {
        expect(event.domNode instanceof Node).toBe(true);
      });

      it("domNode property alias should be read-only", function() {
        expect(function() {
          event.domNode = "other";
        }).toThrowError(TypeError);
      });
      
    });

  }); // #pentaho.visual.base.events.DidCreate
});

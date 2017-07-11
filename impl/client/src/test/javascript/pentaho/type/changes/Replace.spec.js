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
  "pentaho/type/Context",
  "pentaho/type/changes/Replace"
], function(Context, Replace) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  describe("pentaho.type.changes.Replace", function() {

    var context, Derived, ComplexOfComplex, propY;

    beforeEach(function() {
      context = new Context();
      Derived = context.get({props: ["x"]});

      ComplexOfComplex = context.get({props: [{name: "y", valueType: Derived}]});
      propY = ComplexOfComplex.type.get("y");
    });

    it("should be defined", function() {
      expect(typeof Replace).toBeDefined();
    });

    describe("#type", function() {
      it("should return a string with the value `replace`", function() {
        expect(Replace.prototype.type).toBe("replace");
      });
    });

    describe("#_apply", function() {

      var scope;

      beforeEach(function() {
        scope = context.enterChange();
      });

      afterEach(function() {
        scope.dispose();
      });

      it("should replace the property value and be visible as ambient value", function() {

        var derived = new Derived({x: "0"});

        // ---

        expect(derived.x).toBe("0");

        // ---

        derived.x = "1";

        // ---

        expect(derived.x).toBe("1");
      });

      it("should reuse a Replace change object when set twice", function() {

        var derived = new Derived({x: "0"});

        // ---

        derived.x = "1";

        var change1 = derived.$changeset.getChange("x");

        derived.x = "2";

        var change2 = derived.$changeset.getChange("x");

        // ---

        expect(change2).toBe(change1);
      });

      it("should replace the property value and remain changed when committed", function() {

        var derived = new Derived({x: "0"});

        // ---

        derived.x = "1";

        // ---

        scope.accept();

        // ---

        expect(derived.x).toBe("1");
      });

      it("should replace the property value but have the original value when rejected", function() {

        var derived = new Derived({x: "0"});

        // ---

        derived.x = "1";

        // ---

        try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

        // ---

        expect(derived.x).toBe("0");
      });

      it("should replace the property value but have the original value when exited", function() {

        var derived = new Derived({x: "0"});

        // ---

        derived.x = "1";

        // ---

        scope.exit();

        // ---

        expect(derived.x).toBe("0");
      });

      it("should replace the property value but have the original value if changes cleared, as ambient value",
      function() {

        var derived = new Derived({x: "0"});

        // ---

        derived.x = "1";

        // ---

        derived.$changeset.clearChanges();

        // ---

        expect(derived.x).toBe("0");
      });

      it("should replace the property value but have the original value if changes cleared and committed",
      function() {

        var derived = new Derived({x: "0"});

        // ---

        derived.x = "1";

        // ---

        derived.$changeset.clearChanges();
        scope.accept();

        // ---

        expect(derived.x).toBe("0");
      });
    });

    describe("references", function() {
      function expectSingleRefTo(elem, to, prop) {
        var refs = elem.$references;

        expect(refs.length).toBe(1);
        expect(refs[0].container).toBe(to);
        expect(refs[0].property).toBe(prop);
      }

      function expectNoRefs(elem) {
        var refs = elem.$references;

        expect(!refs || !refs.length).toBe(true);
      }

      var scope;

      beforeEach(function() {
        scope = context.enterChange();
      });

      afterEach(function() {
        scope.dispose();
      });

      // coverage
      describe("when element is simple", function() {

        it("should not try to add or remove references", function() {

          var owner = new Derived({x: "1"});

          // ---

          owner.x = "2";
        });

        it("should not try to cancel removed references when changes are cleared", function() {

          var owner = new Derived({x: "1"});

          // ---

          owner.x = "2";

          // ---

          owner.$changeset.clearChanges();
        });
      });

      describe("when element is complex", function() {

        it("should remove add and remove references as soon as the change is made, as ambient values", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});

          expectSingleRefTo(elem1, owner, propY);
          expectNoRefs(elem2);

          // ---

          owner.y = elem2;

          // ---

          expectNoRefs(elem1);
          expectSingleRefTo(elem2, owner, propY);
        });

        it("should add and remove references but should have no effect if rejected", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});

          // ---

          owner.y = elem2;

          // ---

          try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

          // ---

          expectSingleRefTo(elem1, owner, propY);
          expectNoRefs(elem2);
        });

        it("should add and remove references but should have no effect if exited from", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});

          // ---

          owner.y = elem2;

          // ---

          scope.exit();

          // ---

          expectSingleRefTo(elem1, owner, propY);
          expectNoRefs(elem2);
        });

        it("should really add and remove references if committed", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});

          // ---

          owner.y = elem2;

          // ---

          scope.accept();

          // ---

          expectNoRefs(elem1);
          expectSingleRefTo(elem2, owner, propY);
        });

        it("should cancel added and removed references when changes are cleared, in ambient values", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});

          // ---

          owner.y = elem2;

          // ---

          owner.$changeset.clearChanges();

          // ---

          expectSingleRefTo(elem1, owner, propY);
          expectNoRefs(elem2);
        });

        it("should cancel added and removed references when changes are cleared, and committed", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});

          // ---

          owner.y = elem2;

          // ---

          owner.$changeset.clearChanges();

          scope.accept();

          // ---

          expectSingleRefTo(elem1, owner, propY);
          expectNoRefs(elem2);
        });

        it("should add and remove references, but if the initial element is set again, " +
            "it should restore the changed references and become visible again as ambient values", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});

          // ---

          owner.y = elem2;
          owner.y = elem1;

          // ---

          expectSingleRefTo(elem1, owner, propY);
          expectNoRefs(elem2);
        });

        it("should add and remove references, but if the initial element is set again, " +
            "it should restore the changed references and still be there when committed", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});

          // ---

          owner.y = elem2;
          owner.y = elem1;

          // ---

          scope.accept();

          // ---

          expectSingleRefTo(elem1, owner, propY);
          expectNoRefs(elem2);
        });

        it("should add and remove references, but if the initial element is set again, " +
           "it should restore the changed references and still be there when rejected", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});

          // ---

          owner.y = elem2;
          owner.y = elem1;

          // ---

          try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

          // ---

          expectSingleRefTo(elem1, owner, propY);
          expectNoRefs(elem2);
        });

        it("should add and remove references, but if another value is set, " +
            "references should be changed again, as ambient values", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});
          var elem3 = new Derived({x: "3"});

          // ---

          expectSingleRefTo(elem1, owner, propY);
          expectNoRefs(elem2);
          expectNoRefs(elem3);

          // ---

          owner.y = elem2;

          // ---

          expectNoRefs(elem1);
          expectSingleRefTo(elem2, owner, propY);
          expectNoRefs(elem3);

          // ---

          owner.y = elem3;

          // ---

          expectNoRefs(elem1);
          expectNoRefs(elem2);
          expectSingleRefTo(elem3, owner, propY);
        });

        it("should add and remove references, but if another value is set, " +
           "references should be changed again, and still be there if committed", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});
          var elem3 = new Derived({x: "3"});

          // ---

          owner.y = elem2;
          owner.y = elem3;

          // ---

          scope.accept();

          // ---

          expectNoRefs(elem1);
          expectNoRefs(elem2);
          expectSingleRefTo(elem3, owner, propY);
        });

        it("should add and remove references, but if another value is set, " +
           "references should be changed again, but be forgotten if rejected", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});
          var elem3 = new Derived({x: "3"});

          // ---

          owner.y = elem2;
          owner.y = elem3;

          // ---

          try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

          // ---

          expectSingleRefTo(elem1, owner, propY);
          expectNoRefs(elem2);
          expectNoRefs(elem3);
        });

        it("should add and remove references, but if another value is set, " +
            "references should be changed again, but be forgotten if changes cleared, as ambient values", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});
          var elem3 = new Derived({x: "3"});

          // ---

          owner.y = elem2;
          owner.y = elem3;

          // ---

          owner.$changeset.clearChanges();

          // ---

          expectSingleRefTo(elem1, owner, propY);
          expectNoRefs(elem2);
          expectNoRefs(elem3);
        });

        it("should add and remove references, but if another value is set, " +
            "references should be changed again, but be forgotten if changes cleared, and committed", function() {

          var owner = new ComplexOfComplex({y: {x: "1"}});
          var elem1 = owner.y;
          var elem2 = new Derived({x: "2"});
          var elem3 = new Derived({x: "3"});

          // ---

          owner.y = elem2;
          owner.y = elem3;

          // ---

          owner.$changeset.clearChanges();
          scope.accept();

          // ---

          expectSingleRefTo(elem1, owner, propY);
          expectNoRefs(elem2);
          expectNoRefs(elem3);
        });
      });
    });
  });
});

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

  describe("pentaho.type.action.Base", function() {

    var BaseAction;
    var SubAction;

    beforeAll(function(done) {

      Context.createAsync()
          .then(function(context) {
            return context.getAsync("pentaho/type/action/base");
          })
          .then(function(_BaseAction) {
            BaseAction = _BaseAction;

            // A derived non-abstract class, adding nothing new.
            SubAction = BaseAction.extend({
              $type: {
                label: "typeDefaultLabel",
                description: "typeDefaultDescription"
              }
            });
          })
          .then(done, done.fail);
    });

    describe("new ({label, description})", function() {

      it("should be possible to not specify spec", function() {

        var action = new SubAction();

        expect(action instanceof SubAction).toBe(true);
      });

      describe("spec.label argument", function() {

        it("should respect a specified string value", function() {

          var action = new SubAction({label: "a"});
          expect(action.label).toBe("a");
        });

        it("should convert a nully or empty specified value to the type default label", function() {

          var action = new SubAction({label: null});
          expect(action.label).toBe("typeDefaultLabel");

          action = new SubAction({label: undefined});
          expect(action.label).toBe("typeDefaultLabel");

          action = new SubAction({label: ""});
          expect(action.label).toBe("typeDefaultLabel");
        });

        it("should convert a non-nully or empty specified value to a string value", function() {

          var action = new SubAction({label: true});
          expect(action.label).toBe("true");
        });
      });

      describe("spec.description argument", function() {

        it("should respect a specified string value", function() {

          var action = new SubAction({description: "a"});
          expect(action.description).toBe("a");
        });

        it("should convert a nully or empty specified value to the type default label", function() {

          var action = new SubAction({description: null});
          expect(action.description).toBe("typeDefaultDescription");

          action = new SubAction({description: undefined});
          expect(action.description).toBe("typeDefaultDescription");

          action = new SubAction({description: ""});
          expect(action.description).toBe("typeDefaultDescription");
        });

        it("should convert a non-nully or empty specified value to a string value", function() {

          var action = new SubAction({description: true});
          expect(action.description).toBe("true");
        });
      });

      it("should call the #_init(spec) method, for mixins to take part", function() {

        spyOn(SubAction.prototype, "_init");

        var spec = {};

        var action = new SubAction(spec);

        expect(SubAction.prototype._init).toHaveBeenCalledTimes(1);
        expect(SubAction.prototype._init).toHaveBeenCalledWith(spec);
        expect(SubAction.prototype._init.calls.first().object).toBe(action);
      });
    });

    describe("#label", function() {

      it("should default to the type default label (when one is defined)", function() {

        var action = new SubAction();
        expect(action.label).toBe("typeDefaultLabel");
      });

      it("should respect a set string value", function() {

        var action = new SubAction();
        action.label = "a";
        expect(action.label).toBe("a");
      });

      it("should convert a nully or empty set value to the type default label", function() {

        var action = new SubAction({label: "a"});
        action.label = null;
        expect(action.label).toBe("typeDefaultLabel");

        action = new SubAction({label: "a"});
        action.label = undefined;
        expect(action.label).toBe("typeDefaultLabel");

        action = new SubAction({label: "a"});
        action.label = "";
        expect(action.label).toBe("typeDefaultLabel");
      });

      it("should convert a non-nully or empty set value to a string value", function() {

        var action = new SubAction({label: "a"});
        action.label = true;
        expect(action.label).toBe("true");
      });
    });

    describe("#description", function() {

      it("should default to the type default description (when one is defined)", function() {

        var action = new SubAction();
        expect(action.description).toBe("typeDefaultDescription");
      });

      it("should respect a set string value", function() {

        var action = new SubAction();
        action.description = "a";
        expect(action.description).toBe("a");
      });

      it("should convert a nully or empty set value to the type default description", function() {

        var action = new SubAction({description: "a"});
        action.description = null;
        expect(action.description).toBe("typeDefaultDescription");

        action = new SubAction({description: "a"});
        action.description = undefined;
        expect(action.description).toBe("typeDefaultDescription");

        action = new SubAction({description: "a"});
        action.description = "";
        expect(action.description).toBe("typeDefaultDescription");
      });

      it("should convert a non-nully or empty set value to a string value", function() {

        var action = new SubAction({description: "a"});
        action.description = true;
        expect(action.description).toBe("true");
      });
    });

    describe("#toSpecInContext()", function() {

      it("should serialize a specified #label", function() {
        var action = new SubAction({label: "a"});
        var spec = action.toSpec();
        expect(spec.label).toBe("a");
      });

      it("should not serialize the default #label", function() {
        var action = new SubAction({});
        var spec = action.toSpec();
        expect("label" in spec).toBe(false);
      });

      it("should serialize a specified #description", function() {
        var action = new SubAction({description: "a"});
        var spec = action.toSpec();
        expect(spec.description).toBe("a");
      });

      it("should not serialize the default #description", function() {
        var action = new SubAction({});
        var spec = action.toSpec();
        expect("description" in spec).toBe(false);
      });
    });

    describe("#clone()", function() {

      it("should return a distinct instance", function() {
        var action = new SubAction();
        var clone = action.clone();
        expect(clone).not.toBe(action);
        expect(clone instanceof SubAction).toBe(true);
      });

      it("should have the same #label", function() {
        var action = new SubAction({label: "a"});
        var clone = action.clone();
        expect(clone.label).toBe("a");
      });

      it("should have the same #description", function() {
        var action = new SubAction({description: "a"});
        var clone = action.clone();
        expect(clone.description).toBe("a");
      });
    });

    describe(".Type", function() {

      describe("#isSync", function() {

        it("should default to true", function() {
          expect(SubAction.type.isSync).toBe(true);
        });

        it("should respect a specified value", function() {

          var SubAction2 = BaseAction.extend({
            $type: {
              isSync: true
            }
          });

          expect(SubAction2.type.isSync).toBe(true);

          // ---

          SubAction2 = BaseAction.extend({
            $type: {
              isSync: false
            }
          });

          expect(SubAction2.type.isSync).toBe(false);
        });
      });

      describe("#toSpecInContext()", function() {

        it("should include the isSync property when different from the inherited value", function() {

          var SubAction2 = BaseAction.extend({
            $type: {
              isSync: false
            }
          });

          var spec = SubAction2.type.toSpec();
          expect(spec.isSync).toBe(false);

          // ---

          var SubAction3 = SubAction2.extend({
            $type: {
              isSync: true
            }
          });

          spec = SubAction3.type.toSpec();
          expect(spec.isSync).toBe(true);
        });

        it("should not include the isSync property when equal to the inherited value", function() {

          var SubAction2 = BaseAction.extend({
            $type: {
              isSync: true
            }
          });

          var spec = SubAction2.type.toSpec();
          expect("isSync" in spec).not.toBe(true);

          // ---

          SubAction2 = BaseAction.extend({
            $type: {
              isSync: false
            }
          });

          var SubAction3 = SubAction2.extend({
            $type: {
              isSync: false
            }
          });

          spec = SubAction3.type.toSpec();
          expect("isSync" in spec).not.toBe(true);
        });
      });
    });
  });
});

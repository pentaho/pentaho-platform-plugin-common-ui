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
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.Value", function() {

    describe("refine([name,] instSpec, classSpec, keyArgs)", function() {

      var context = new Context();
      var Element = context.get("pentaho/type/element");

      // Must use Element or List to test cause only these are representation types
      // and Value is not...

      it("should create a subtype", function() {

        var AccidentType = Element.refine();

        expect(AccidentType.prototype instanceof Element).toBe(true);
      });

      it("should create a subtype that has this as `essence`", function() {

        var AccidentType = Element.refine();

        expect(AccidentType.type.essence).toBe(Element.type);
      });

      it("should create a subtype that is an accident", function() {

        var AccidentType = Element.refine();

        expect(AccidentType.type.isEssence).toBe(false);
        expect(AccidentType.type.isAccident).toBe(true);
      });

      it("should create a subtype that has the specified name", function() {

        var AccidentType = Element.refine("FOOO");

        expect(AccidentType.name || AccidentType.displayName).toBe("FOOO");
      });

      it("should create a subtype that has the specified class spec", function() {

        var AccidentType = Element.refine({}, {foo: true});

        expect(AccidentType.foo).toBe(true);
      });

      it("should create a subtype that has the specified name and class spec", function() {

        var AccidentType = Element.refine("FOOO", {}, {foo: true});

        expect(AccidentType.name || AccidentType.displayName).toBe("FOOO");
        expect(AccidentType.foo).toBe(true);
      });

      it("should create a subtype whose constructor creates direct instances of the essence type", function() {

        var SubElement = Element.extend();
        var Accident = SubElement.refine();

        var instance = new Accident();
        expect(instance instanceof Accident).toBe(false);
        expect(instance.constructor).toBe(SubElement);
      });

      describe("when the base type is a accidental type", function() {

        it("should create an accident", function() {

          var SubElement = Element.extend();
          var Accident = SubElement.refine();
          var SubAccident = Accident.refine();

          expect(SubAccident.prototype instanceof Accident).toBe(true);
          expect(SubAccident.type.essence).toBe(SubElement.type);
          expect(SubAccident.type.isEssence).toBe(false);
          expect(SubAccident.type.isAccident).toBe(true);
        });

        it("should create an accident that creates direct instances of the essence type", function() {

          var SubElement = Element.extend();
          var Accident = SubElement.refine();
          var SubAccident = Accident.refine();

          var instance = new SubAccident();

          expect(instance instanceof Accident).toBe(false);
          expect(instance instanceof SubAccident).toBe(false);
          expect(instance.constructor).toBe(SubElement);
        });
      });
    });
  });
});

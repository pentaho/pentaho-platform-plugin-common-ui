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
  "pentaho/type/Complex",
  "pentaho/type/ValidationError"
], function(Complex, ValidationError) {

  "use strict";

  describe("pentaho.type.PropertyType -", function() {

    describe("#validateOn(owner) -", function() {

      describe("general tests", function() {

        var Derived;

        beforeEach(function() {
          Derived = Complex.extend({
            $type: {
              label: "Derived",
              props: [
                {name: "x", valueType: "string", isRequired: true},
                {name: "y", valueType: ["string"], countMin: 2},
                {name: "z", valueType: ["string"], countMin: 1, countMax: 2},
                {name: "w", valueType: "string", isRequired: true, isApplicable: false}
              ]
            }
          });
        });

        it("should return null", function() {
          var derived = new Derived({x: "1", y: ["1", "2", "3"], z: ["1", "2"]});
          expect(derived.validate()).toBe(null);
        });

        it("should return three errors", function() {
          var derived = new Derived({y: ["1"], z: ["1", "2", "3"]});

          expect(derived.validate().length).toBe(3);
        });
      });

      it("should be considered valid when not applicable", function() {
        var Derived = Complex.extend({
          $type: {
            props: [
              {name: "x", valueType: "string", isRequired: true, isApplicable: false}
            ]
          }
        });

        var propX = Derived.type.get("x");

        // Would be invalid if applicable.
        var owner = new Derived();

        var errors = propX.validateOn(owner);

        expect(errors).toBe(null);
      });

      it("should call value.validate when not null and singular", function() {

        var Derived = Complex.extend({
          $type: {
            props: [
              {name: "x", valueType: "string"}
            ]
          }
        });

        var propX = Derived.type.get("x");

        var owner = new Derived({x: "a"});

        var valueX = owner.get("x");

        spyOn(valueX, "validate");

        propX.validateOn(owner);

        expect(valueX.validate).toHaveBeenCalledTimes(1);
      });

      it("should call value.validate when not null and plural", function() {

        var Derived = Complex.extend({
          $type: {
            props: [
              {name: "x", valueType: ["string"]}
            ]
          }
        });

        var propX = Derived.type.get("x");

        var owner = new Derived({x: ["a"]});

        var valueX = owner.get("x");

        spyOn(valueX, "validate");

        propX.validateOn(owner);

        expect(valueX.validate).toHaveBeenCalledTimes(1);
      });

      it("should call _validateValueOn with owner and value when not null and singular", function() {

        var Derived = Complex.extend({
          $type: {
            props: [
              {name: "x", valueType: "string"}
            ]
          }
        });

        var propX = Derived.type.get("x");

        var owner = new Derived({x: "a"});

        spyOn(propX, "_validateValueOn");

        propX.validateOn(owner);

        expect(propX._validateValueOn).toHaveBeenCalledTimes(1);
        expect(propX._validateValueOn).toHaveBeenCalledWith(owner, owner.get("x"));
      });

      it("should call _validateValueOn with owner and value when not null and plural", function() {

        var Derived = Complex.extend({
          $type: {
            props: [
              {name: "x", valueType: ["string"]}
            ]
          }
        });

        var propX = Derived.type.get("x");

        var owner = new Derived({x: ["a"]});

        spyOn(propX, "_validateValueOn");

        propX.validateOn(owner);

        expect(propX._validateValueOn).toHaveBeenCalledTimes(1);
        expect(propX._validateValueOn).toHaveBeenCalledWith(owner, owner.get("x"));
      });
    });// end #validateOn(owner)

    describe("#_validateValueOn(owner, value) -", function() {

      describe("when property is singular", function() {

        it("should call _collectElementValidators with a function, the owner and value", function() {

          var Derived = Complex.extend({
            $type: {
              props: [
                {name: "x", valueType: "string"}
              ]
            }
          });

          var propX = Derived.type.get("x");

          var owner = new Derived({x: "a"});

          spyOn(propX, "_collectElementValidators");

          propX.validateOn(owner);

          expect(propX._collectElementValidators).toHaveBeenCalledTimes(1);
          expect(propX._collectElementValidators).toHaveBeenCalledWith(jasmine.any(Function), owner, owner.get("x"));
        });

        it("should call validators registered by _collectElementValidators once, " +
            "with the owner, value and 0-index", function() {

          var Derived = Complex.extend({
            $type: {
              props: [
                {name: "x", valueType: "string"}
              ]
            }
          });

          var propX = Derived.type.get("x");

          var owner = new Derived({x: "a"});

          var validator = jasmine.createSpy();

          spyOn(propX, "_collectElementValidators").and.callFake(function(addValidator) {
            addValidator(validator);
          });

          propX.validateOn(owner);

          expect(validator).toHaveBeenCalledTimes(1);
          expect(validator).toHaveBeenCalledWith(owner, owner.get("x"), 0);
        });

        it("should fail validation with errors returned by validators", function() {

          var Derived = Complex.extend({
            $type: {
              props: [
                {name: "x", valueType: "string"}
              ]
            }
          });

          var propX = Derived.type.get("x");

          var owner = new Derived({x: "a"});

          var error = new ValidationError("error");
          var validator = jasmine.createSpy().and.returnValue(error);

          spyOn(propX, "_collectElementValidators").and.callFake(function(addValidator) {
            addValidator(validator);
          });

          var errors = propX.validateOn(owner);

          expect(Array.isArray(errors)).toBe(true);
          expect(errors.length).toBe(1);
          expect(errors[0]).toBe(error);
        });
      });

      describe("when property is plural", function() {

        it("should not call _collectElementValidators if list is empty", function() {

          var Derived = Complex.extend({
            $type: {
              props: [
                {name: "x", valueType: ["string"]}
              ]
            }
          });

          var propX = Derived.type.get("x");

          var owner = new Derived();

          spyOn(propX, "_collectElementValidators");

          propX.validateOn(owner);

          expect(propX._collectElementValidators).not.toHaveBeenCalled();
        });

        it("should call _collectElementValidators with a function, the owner and value", function() {

          var Derived = Complex.extend({
            $type: {
              props: [
                {name: "x", valueType: ["string"]}
              ]
            }
          });

          var propX = Derived.type.get("x");

          var owner = new Derived({x: ["a"]});

          spyOn(propX, "_collectElementValidators");

          propX.validateOn(owner);

          expect(propX._collectElementValidators).toHaveBeenCalledTimes(1);
          expect(propX._collectElementValidators).toHaveBeenCalledWith(jasmine.any(Function), owner, owner.get("x"));
        });

        it("should call validators registered by _collectElementValidators once per element, " +
            "with the owner, element and index", function() {

          var Derived = Complex.extend({
            $type: {
              props: [
                {name: "x", valueType: ["string"]}
              ]
            }
          });

          var propX = Derived.type.get("x");

          var owner = new Derived({x: ["a", "b", "c"]});

          var validator = jasmine.createSpy();

          spyOn(propX, "_collectElementValidators").and.callFake(function(addValidator) {
            addValidator(validator);
          });

          propX.validateOn(owner);

          expect(validator).toHaveBeenCalledTimes(3);
          var list = owner.x;
          expect(validator).toHaveBeenCalledWith(owner, list.at(0), 0);
          expect(validator).toHaveBeenCalledWith(owner, list.at(1), 1);
          expect(validator).toHaveBeenCalledWith(owner, list.at(2), 2);
        });

        it("should fail validation with errors returned by validators", function() {

          var Derived = Complex.extend({
            $type: {
              props: [
                {name: "x", valueType: ["string"]}
              ]
            }
          });

          var propX = Derived.type.get("x");

          var owner = new Derived({x: ["a", "b"]});

          var error = new ValidationError("error");
          var validator = jasmine.createSpy().and.returnValue(error);

          spyOn(propX, "_collectElementValidators").and.callFake(function(addValidator) {
            addValidator(validator);
          });

          var errors = propX.validateOn(owner);

          expect(Array.isArray(errors)).toBe(true);
          expect(errors.length).toBe(2);
          expect(errors[0]).toBe(error);
          expect(errors[1]).toBe(error);
        });
      });
    });
  }); // pentaho.type.PropertyType
});

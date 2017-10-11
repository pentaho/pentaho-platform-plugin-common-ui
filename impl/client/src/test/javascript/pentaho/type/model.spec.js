/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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

  describe("pentaho.type.Model -", function() {

    var Model;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(context) {
            Model = context.get("pentaho/type/model");
          })
          .then(done, done.fail);
    });



    describe("new Model()", function() {

      it("should be a function", function() {
        expect(typeof Model).toBe("function");
      });

      it("should return an instance of Model", function() {
        expect((new Model()) instanceof Model).toBe(true);
      });

      it("should define a property named application of type application", function() {
        var p = Model.type.get("application");
        expect(p != null).toBe(true);
        expect(p.valueType.id).toBe("pentaho/type/application");
      });

      it("should have a default application of null", function() {
        var m = new Model();
        expect(m.application).toBe(null);
      });

      it("should be valid without an application defined", function() {
        var m = new Model();
        expect(m.$isValid).toBe(true);
      });
    });

    describe("#toSpecInContext(keyArgs)", function() {

      it("should return an object", function() {
        var model = new Model();
        var result = model.toSpec();
        expect(result != null).toBe(true);
        expect(typeof result).toBe("object");
      });

      it("should contain the application serialization, by default", function() {
        var model = new Model({application: {}});
        expect(model.application != null).toBe(true);

        var result = model.toSpec();
        expect(result.application != null).toBe(true);
        expect(typeof result.application).toBe("object");
      });

      it("should not contain the application serialization, when isJson is true", function() {
        var model = new Model({application: {}});
        expect(model.application != null).toBe(true);

        var result = model.toSpec({isJson: true});
        expect("application" in result).toBe(false);
      });

      it("should contain the application serialization, when isJson is true and omitProps specifies application with " +
         "a value of false", function() {
        var model = new Model({application: {}});
        expect(model.application != null).toBe(true);

        var result = model.toSpec({isJson: true, omitProps: {application: false}});
        expect(result.application != null).toBe(true);
        expect(typeof result.application).toBe("object");
      });
    });
  }); // pentaho.type.Model
});

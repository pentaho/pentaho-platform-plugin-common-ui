/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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

  describe("pentaho.type.Application -", function() {

    describe("new Application()", function() {

      var Application;

      beforeEach(function(done) {
        Context.createAsync()
            .then(function(context) {
              return context.getAsync("pentaho/type/application");
            }).then(function(_Application) {
              Application = _Application;
            }).then(done, done.fail);
      });

      it("should be a function", function() {
        expect(typeof Application).toBe("function");
      });

      it("should return an instance of Application", function() {
        expect((new Application()) instanceof Application).toBe(true);
      });
    });
  }); // pentaho.type.Application
});

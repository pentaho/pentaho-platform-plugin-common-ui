/*!
 * Copyright 2010 - 2018 Hitachi Vantara.  All rights reserved.
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

  /* globals jasmine, console, expect, it, describe, beforeEach */

  describe("pentaho.visual.base.Model", function() {

    var context;
    var Model;
    var dataSpec;

    beforeEach(function(done) {

      Context.createAsync()
          .then(function(_context) {
            context = _context;

            return context.getDependencyApplyAsync([
              "pentaho/visual/base/model"
            ], function(_Model) {
              Model = _Model;
            });
          })
          .then(done, done.fail);

      var data = {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "sales", type: "number", label: "Sales"}
        ],
        rows: [
          {c: [{v: "Portugal"}, {v: 12000}]},
          {c: [{v: "Ireland"}, {v: 6000}]}
        ]
      };

      dataSpec = {
        v: data
      };
    });

    it("can be instantiated with a well-formed spec", function() {
      expect(function() {
        return new Model({
          data: dataSpec
        });
      }).not.toThrowError();
    });

    it("can be instantiated without arguments", function() {
      expect(function() {
        return new Model();
      }).not.toThrowError();
    });

    it("should pre-load all standard visual role related modules", function(done) {
      require.using(["pentaho/type/Context"], function(Context) {

        return Context.createAsync().then(function(context) {

          return context.getDependencyApplyAsync(["pentaho/visual/base/model"], function() {

            context.get("pentaho/visual/role/property");
            context.get("pentaho/visual/role/mode");
          });
        });
      })
      .then(done, done.fail);
    });
  });
});

/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/shim/es6-promise"
], function() {

  "use strict";

  describe("pentaho/util/requireJSConfig!moduleId", function() {

    var localRequire;

    beforeEach(function() {
      localRequire = require.new();
    });

    afterEach(function() {
      localRequire.dispose();
    });

    it("should expose the full RequireJS configuration", function() {

      localRequire.config({
        config: {
          "test/foo": {
            a: "b"
          }
        }
      });

      return localRequire.promise(["pentaho/util/requireJSConfig!"])
        .then(function(deps) {

          var requireJSConfig = deps[0];

          expect(requireJSConfig.paths != null).toBe(true);
          expect(requireJSConfig.map != null).toBe(true);
          expect(requireJSConfig.config).toEqual(jasmine.objectContaining({
            "test/foo": {
              a: "b"
            }
          }));
        });
    });
  });
});

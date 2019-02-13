/*!
 * Copyright 2010 - 2019 Hitachi Vantara. All rights reserved.
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
  "pentaho/util/requireJS",
  "tests/pentaho/util/errorMatch",
  "pentaho/shim/es6-promise"
], function(requireJSUtil, errorMatch) {

  "use strict";

  describe("pentaho.util.requireJS", function() {

    describe(".config([config])", function() {
      var localRequire;

      beforeEach(function() {
        localRequire = require.new();
      });

      afterEach(function() {
        localRequire.dispose();
      });

      it("should get the full RequireJS configuration when called with no arguments", function() {

        localRequire.config({
          config: {
            "test/foo": {
              a: "b"
            }
          }
        });

        return localRequire.promise(["pentaho/util/requireJS"]).then(function(deps) {

          var requireJSUtil = deps[0];
          var requireJSConfig = requireJSUtil.config();

          expect(requireJSConfig.paths != null).toBe(true);
          expect(requireJSConfig.map != null).toBe(true);
          expect(requireJSConfig.config).toEqual(jasmine.objectContaining({
            "test/foo": {
              a: "b"
            }
          }));
        });
      });

      it("should modify the RequireJS configuration when called with a configuration argument", function() {

        return localRequire.promise(["pentaho/util/requireJS"]).then(function(deps) {

          var requireJSUtil = deps[0];

          requireJSUtil.config({
            config: {
              "test/foo": {
                a: "b"
              }
            }
          });

          var requireJSConfig = requireJSUtil.config();

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

    describe(".require(deps, localRequire)", function() {

      it("should throw when `deps` is not specified", function() {

        function expectIt(args) {
          expect(function() {

            requireJSUtil.promise.apply(requireJSUtil, args);

          }).toThrow(jasmine.any(Error));
        }

        expectIt([]);
        expectIt([null]);
        expectIt([undefined]);
      });

      it("should fulfill to a single value when `deps` is a string", function() {

        var mid = "pentaho/tests/promise/require/test1";
        require.undef(mid);
        var moduleValue = {};

        define(mid, [], function() {
          return moduleValue;
        });

        var promise = requireJSUtil.promise(mid);

        expect(promise instanceof Promise).toBe(true);

        return promise.then(function(value) {

          expect(value).toEqual(moduleValue);

          require.undef(mid);
        });
      });

      it("should fulfill to an empty array when `deps` is an empty array", function() {

        var promise = requireJSUtil.promise([]);

        expect(promise instanceof Promise).toBe(true);

        return promise.then(function(values) {
          expect(values).toEqual([]);
        });
      });

      it("should fulfill to an array value when `deps` is a (non-empty) array", function() {
        var mid1 = "pentaho/tests/promise/require/test1";
        var mid2 = "pentaho/tests/promise/require/test2";

        require.undef(mid1);
        require.undef(mid2);

        var moduleValue1 = {};
        var moduleValue2 = {};

        define(mid1, [], function() {
          return moduleValue1;
        });

        define(mid2, [], function() {
          return moduleValue2;
        });

        var promise = requireJSUtil.promise([mid1, mid2]);

        expect(promise instanceof Promise).toBe(true);

        return promise.then(function(values) {
          expect(Array.isArray(values)).toBe(true);
          expect(values.length).toBe(2);
          expect(values[0]).toBe(moduleValue1);
          expect(values[1]).toBe(moduleValue2);

          require.undef(mid1);
          require.undef(mid2);
        });
      });

      it("should use the specified `localRequire` instead of the global one - when `deps` is a string", function() {

        // Executed synchronously

        var localRequire = jasmine.createSpy("localRequire").and.callFake(function(deps, callback, errback) {

          expect(deps).toEqual(["foo"]);

          // Resolve the promise.
          callback(1);
        });

        return requireJSUtil.promise("foo", localRequire).then(function() {
          expect(localRequire).toHaveBeenCalled();
        });
      });

      it("should use the specified `localRequire` instead of the global one - when `deps` is an array", function() {

        // Executed synchronously

        var localRequire = jasmine.createSpy("localRequire").and.callFake(function(deps, callback, errback) {

          expect(deps).toEqual(["foo", "bar"]);

          // Resolve the promise.
          callback(1);
        });

        return requireJSUtil.promise(["foo", "bar"], localRequire).then(function() {
          expect(localRequire).toHaveBeenCalled();
        });
      });
    });

    describe(".define(id, deps, callback)", function() {

      it("should be able to define a module in the global Require JS context", function() {

        var mid = "pentaho/tests/promise/require/test1";

        require.undef(mid);

        var moduleValue = {};

        requireJSUtil.define(mid,function() {
          return moduleValue;
        });

        return requireJSUtil.promise(mid).then(function(value) {

          expect(value).toEqual(moduleValue);

          require.undef(mid);
        });
      });

      describe("custom Require JS contexts", function() {

        var localRequire;
        var requireJSUtil;

        beforeEach(function() {
          localRequire = require.new();

          return localRequire.promise(["pentaho/util/requireJS"]).then(function(deps) {
            requireJSUtil = deps[0];
          });
        });

        afterEach(function() {
          localRequire.dispose();
        });

        it("should be able to define a module", function() {

          var mid = "pentaho/tests/promise/require/test1";

          require.undef(mid);

          var moduleValue = {};

          requireJSUtil.define(mid, function() {
            return moduleValue;
          });

          // Try to read from global require:
          return requireJSUtil.promise(mid, require).then(function() {

            return Promise.reject("Should have been rejected.");

          }, function() {
            // Success! Not global.

            // Read from local require.
            return requireJSUtil.promise(mid).then(function(value) {
              expect(value).toEqual(moduleValue);
            });
          });
        });
      });
    });
  });
});

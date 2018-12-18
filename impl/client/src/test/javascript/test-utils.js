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
  "pentaho/shim/es6-promise"
], function(Promise) {

  "use strict";

  return {
    expectToRejectWith: expectToRejectWith
  };

  /**
   * Jasmine helper that _expects_ that a given async function
   * is rejected with a given type of error.
   *
   * @param {function() : ?Promise} asyncTest - The async function that should throw or return a rejected promise
   *                                with a given error type.
   * @param {*|Error|JasmineAsymmetricEqualityTester} [error] The error that is the cause for the rejection.
   *                                                    When unspecified, rejection of any type is still asserted.
   *
   * @return {Promise} The test promise.
   */
  function expectToRejectWith(asyncTest, error) {

    return new Promise(function(resolve) { return resolve(asyncTest()); })
        .then(function() {
          return Promise.reject(new Error("Expected function to throw an error."));
        }, function(ex) {
          if(error != null) {
            expect(ex).toEqual(error);
          }
          // All well, throw is expected. Swallow.
        });
  }
});

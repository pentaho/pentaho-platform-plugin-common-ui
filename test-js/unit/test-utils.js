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
define(function() {

  "use strict";

  /* global it:false, expect:false, Promise:false */

  return {
    toAsyncJasmine: toAsyncJasmine,
    itAsync: itAsync,
    modal: modal,
    expectToRejectWith: expectToRejectWith
  };

  /**
   * Creates a function that adapts a given promise-based async test
   * to a callback-based Jasmine-style async test.
   *
   * @param {function(any) : ?Promise} test A promise-based async test function.
   *
   * @return {function(function)} A Jasmine-style async test function.
   */
  function toAsyncJasmine(asyncTest) {
    // Already has a `done` argument?
    if(asyncTest.length > 0) {
      return asyncTest;
    }

    return function(done) {
      var promise = asyncTest();
      if(!promise)
        done();
      else
        promise.then(done, done.fail);
    };
  }

  /**
   * A Jasmine `it` function replacement that supports promise-based test functions,
   * besides Jasmine-style test functions.
   *
   * @param {function(any) : ?Promise} test A promise-based async test function.
   *
   * @return {function(function)} A Jasmine-style async test function.
   */
  function itAsync(description, test) {
    it(description, toAsyncJasmine(test));
  }

  /**
   * Creates a promise that is resolved by waiting for all resulting promises
   * of calling the given _modal_ test function with each of the given modes.
   *
   * @param {Array} modes An array of modes. Modes can be anything.
   * @param {function(any) : ?Promise} modalTest A function that when given a mode returns a promise.
   *
   * @return {Promise} The overall promise.
   */
  function modal(modes, modalTest) {

    return Promise.all(modes.map(testMode));

    function testMode(mode) {
      return Promise.resolve(modalTest(mode));
    }
  }

  /**
   * Jasmine helper that _expects_ that a given async function
   * is rejected with a given type of error.
   *
   * @param {function() : ?Promise} asyncTest The async function that should throw or return a rejected promise
   *  with a given error type.
   * @param {any|Error|JasmineAsymmetricEqualityTester} [error] The error that is the cause for the rejection.
   *  When unspecified, rejection of any type is still asserted.
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


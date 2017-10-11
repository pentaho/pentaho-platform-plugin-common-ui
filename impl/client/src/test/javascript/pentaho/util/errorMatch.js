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
  "pentaho/lang/Base",
  "pentaho/lang/ArgumentError",
  "pentaho/lang/ArgumentRequiredError",
  "pentaho/lang/ArgumentInvalidError",
  "pentaho/lang/ArgumentInvalidTypeError",
  "pentaho/lang/ArgumentRangeError",
  "pentaho/lang/OperationInvalidError",
  "pentaho/lang/NotImplementedError"
], function(Base, ArgumentError,
    ArgumentRequiredError, ArgumentInvalidError, ArgumentInvalidTypeError,
    ArgumentRangeError, OperationInvalidError, NotImplementedError) {

  "use strict";

  /**
   * The `errorMatch` namespace contains factory functions
   * that create jasmine _asymmetric match_ objects that can be compared to the
   * real error objects of classes of the {@link pentaho.lang} namespace.
   *
   * The match objects can be passed to the jasmine matchers, like `toEqual` and `toThrow`.
   * Note that the `toThrowError` matcher does not accept these match objects.
   *
   * For more information on this jasmine's feature, see
   * [asymmetric equality testers](http://jasmine.github.io/edge/introduction.html#section-Custom_asymmetric_equality_tester).
   *
   * Each factory function accepts the same arguments as the corresponding error constructor,
   * except that the free, natural text arguments, like `reason` and `text` are ignored.
   *
   * @example
   *
   * define([
   *   "pentaho/some/api",  // <-- the module being tested
   *   "tests/pentaho/util/errorMatch" // <- include errorMatch module
   * ], function(someApi, errorMatch) {
   *
   *   describe("someApi.doWithNumber", function() {
   *
   *     it("should throw an argument invalid type error when given a string", function() {
   *
   *       expect(function() {
   *
   *         someApi.doWithNumber("NaN");
   *
   *       }).toThrow(errorMatch.argInvalidType("count", "number", "string"));
   *     });
   *
   *   });
   * });
   *
   * @namespace
   * @name pentaho.util.errorMatch
   * @amd tests/pentaho/util/errorMatch
   * @ignore
   */

  var ErrorMatcher = Base.extend("Error", {
    constructor: function() {
    },

    // This trick is because otherwise, functions are seen as overrides...
    original: {Type: Error},

    asymmetricMatch: function(actual) {
      return (actual instanceof this.original.Type);
    }
  });

  var ArgumentErrorMatcher = ErrorMatcher.extend("ArgumentError", {
    constructor: function(name) {
      this.argument = name;
    },

    original: {Type: ArgumentError},

    asymmetricMatch: function(actual) {
      return this.base(actual) && (actual.argument === this.argument);
    }
  });

  var ArgumentRequiredErrorMatcher = ArgumentErrorMatcher.extend("ArgumentRequiredError", {
    original: {Type: ArgumentRequiredError}
  });

  var ArgumentInvalidErrorMatcher = ArgumentErrorMatcher.extend("ArgumentInvalidError", {
    original: {Type: ArgumentInvalidError}
  });

  var ArgumentRangeErrorMatcher = ArgumentErrorMatcher.extend("ArgumentRangeError", {
    original: {Type: ArgumentRangeError}
  });

  var ArgumentInvalidTypeErrorMatcher = ArgumentErrorMatcher.extend("ArgumentInvalidTypeError", {
    constructor: function(name, expectedType, actualType) {
      this.base(name);
      this.expectedTypes = Array.isArray(expectedType) ? expectedType : [expectedType];
      this.actualType = actualType;
    },

    original: {Type: ArgumentInvalidTypeError},

    asymmetricMatch: function(actual) {
      if(!this.base(actual)) return false;

      // Same expected types?
      var i = this.expectedTypes.length;
      if(!actual.expectedTypes || actual.expectedTypes.length !== i) return false;
      while(i--) if(this.expectedTypes[i] !== actual.expectedTypes[i]) return false;

      // Same actual type?
      return !((this.actualType || actual.actualType) && (this.actualType !== actual.actualType));
    }
  });

  var OperationInvalidErrorMatcher = ErrorMatcher.extend("OperationInvalidError", {
    original: {Type: OperationInvalidError}
  });

  var NotImplementedErrorMatcher = ErrorMatcher.extend("NotImplementedError", {
    original: {Type: NotImplementedError}
  });

  return {
    // Matches any ArgumentError
    arg: function(name) {
      return new ArgumentErrorMatcher(name);
    },

    argRequired: function(name) {
      return new ArgumentRequiredErrorMatcher(name);
    },

    argInvalid: function(name) {
      return new ArgumentInvalidErrorMatcher(name);
    },

    argInvalidType: function(name, expectedType, actualType) {
      return new ArgumentInvalidTypeErrorMatcher(name, expectedType, actualType);
    },

    argRange: function(name) {
      return new ArgumentRangeErrorMatcher(name);
    },

    operInvalid: function() {
      return new OperationInvalidErrorMatcher();
    },

    notImplemented: function() {
      return new NotImplementedErrorMatcher();
    }
  };
});
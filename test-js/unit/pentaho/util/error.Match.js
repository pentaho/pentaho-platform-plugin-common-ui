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
define(function() {

  "use strict";

  // Basic class inheritance routine
  function inherits(Sub, Base, props) {
    if(Base) {
      Sub.super = Base.prototype;
      Sub.prototype = Object.create(Sub.super);
      Sub.prototype.constructor = Sub;
    }

    for(var p in props)
      if(props.hasOwnProperty(p))
        Sub.prototype[p] = props[p];

    return Sub;
  }

  //region Error
  function ErrorMatcher() {
  }

  inherits(ErrorMatcher, null, {

    Type: Error,

    asymmetricMatch: function(actual) {
      return (actual instanceof this.Type) &&
             (actual.name === this.constructor.name);
    }
  });
  //endregion

  //region ArgumentError
  function ArgumentError(argName) {
    this.argument = argName;
  }

  inherits(ArgumentError, ErrorMatcher, {
    asymmetricMatch: function(actual) {
      return ArgumentError.super.asymmetricMatch.call(this, actual) &&
             (actual.argument === this.argument);
    }
  });
  //endregion

  //region ArgumentRequiredError
  // The function name is matched against the actual error.name property
  // Also, this makes jasmine print this nicely as the expected outcome, when unmatched.
  function ArgumentRequiredError(argName) {
    this.argument = argName;
  }

  inherits(ArgumentRequiredError, ArgumentError);
  //endregion

  //region ArgumentInvalidError
  function ArgumentInvalidError(argName) {
    this.argument = argName;
  }

  inherits(ArgumentInvalidError, ArgumentError);
  //endregion

  //region ArgumentInvalidTypeError
  function ArgumentInvalidTypeError(argName, expectedType, actualType) {
    this.argument = argName;
    this.expectedTypes = Array.isArray(expectedType) ? expectedType : [expectedType];
    this.actualType = actualType;
  }

  inherits(ArgumentInvalidTypeError, ArgumentError, {
    Type: TypeError,

    asymmetricMatch: function(actual) {
      if(!ArgumentInvalidTypeError.super.asymmetricMatch.call(this, actual)) return false;

      // Same expected types?
      var i = this.expectedTypes.length;
      if(!actual.expectedTypes || actual.expectedTypes.length !== i) return false;
      while(i--) if(this.expectedTypes[i] !== actual.expectedTypes[i]) return false;

      // Same actual type?
      if((this.actualType || actual.actualType) && (this.actualType !== actual.actualType)) return false;

      return true;
    }
  });
  //endregion

  //region ArgumentOutOfRangeError
  function ArgumentOutOfRangeError(argName) {
    this.argument = argName;
  }

  inherits(ArgumentOutOfRangeError, ArgumentError, {
    Type: RangeError
  });
  //endregion

  //region OperationInvalidError
  function OperationInvalidError() {
  }

  inherits(OperationInvalidError, ErrorMatcher);
  //endregion

  //region NotImplementedError
  function NotImplementedError() {
  }

  inherits(NotImplementedError, ErrorMatcher);
  //endregion

  return {
    argRequired: function(name) {
      return new ArgumentRequiredError(name);
    },

    argInvalid: function(name) {
      return new ArgumentInvalidError(name);
    },

    argInvalidType: function(name, expectedType, actualType) {
      return new ArgumentInvalidTypeError(name, expectedType, actualType);
    },

    argOutOfRange: function(name) {
      return new ArgumentOutOfRangeError(name);
    },

    operInvalid: function() {
      return new OperationInvalidError();
    },

    notImplemented: function() {
      return new NotImplementedError();
    }
  };
});
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

  var error = {
    argRequired: function(name, text) {
      return new Error("Argument required: '" + name + "'." + (text ? (" " + text) : ""));
    },

    argEmpty: function(name, text) {
      return new Error("Argument cannot be empty: '" + name + "'." + (text ? (" " + text) : ""));
    },

    argInvalid: function(name, text) {
      return new Error("Argument invalid: '" + name + "'." + (text ? (" " + text) : ""));
    },

    argInvalidType: function(name, text) {
      return error.argInvalid(name, "Invalid type." + (text ? (" " + text) : ""));
    },

    argNotArray: function(name) {
      return error.argInvalid(name, "Not an array.");
    },

    argNotNumber: function(name) {
      return error.argInvalid(name, "Not a number.");
    },

    argNotFunction: function(name) {
      return error.argInvalid(name, "Not a function.");
    },

    argNotObject: function(name) {
      return error.argInvalid(name, "Not an object.");
    },

    argOutOfRange: function(name) {
      return error.argInvalid(name, "Out of range.");
    },

    operInvalid: function(text) {
      return new Error("Operation invalid." + (text ? (" " + text) : ""));
    },

    notImplemented: function(text){
      return new Error("Not Implemented." + (text ? (" " + text) : ""));
    }
  };


  return error;
});
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
define([
  "./object"
], function(O) {
  "use strict";

  /**
   * @name pentaho.util.MessageBundle
   * @class
   *
   * @classdesc The `MessageBundle` class is a container of localized messages.
   *
   * Each localized message is accessible by a string key.
   * Messages can have property tags in them,
   * using the pattern: `"{0}"`, `"{1}"`, ...
   *
   * @description Creates a message bundle given a messages dictionary.
   * @param {Object} [source] A messages dictionary.
   */
  function MessageBundle(source) {
    /**
     * The source messages dictionary.
     * @type Object.<string, string>
     * @readonly
     */
    this.source = (source && typeof source === "object") ? source : {};
    this._structured = null;
  }

  /**
   * Indicates if the bundle contains a message with the given key.
   * @alias has
   * @memberOf pentaho.util.MessageBundle#
   * @param {string} key The key of the message.
   * @return {boolean} `true` if yes, `false` if no.
   */
  MessageBundle.prototype.has = function(key) {
    return O.getOwn(this.source, key) != null;
  };

  /**
   * Gets a localized, formatted message, given its key.
   *
   * @alias get
   * @memberOf pentaho.util.MessageBundle#
   *
   * @param {string} key The message key.
   * @param {Array|Object|function} [scope] A scope array, object or function.
   *   This parameter can be specified _nully_ or totally omitted.
   *
   * @param {string} [missingMsg] The text to return when
   *    a message with the specified key is not defined.
   *    When `undefined`, the missing message is the specified key.
   *    When `null` (and three arguments were specified), the missing message is `null`.
   *
   * @return {string} A formatted message.
   */
  MessageBundle.prototype.get = function(key, scope, missingMsg) {
    if(arguments.length === 2 && typeof scope === "string") {
      missingMsg = scope;
      scope = null;
    }

    var text = O.getOwn(this.source, key);
    if(text == null) return missingMsg === undefined ? key : missingMsg;

    return this.format(text, scope);
  };

  /**
   * Object representation of the message bundle.
   *
   * @type Object
   * @readonly
   */
  Object.defineProperty(MessageBundle.prototype, "structured", {
    get: function() {
      if(!this._structured) {
        this._structured = propertiesToObject(this.source);
      }

      return this._structured;
    }
  });

  /**
   * Formats a string by
   * replacing the property tags it contains by
   * their corresponding values in a scope.
   *
   * Property tags have the format `"{property}"`,
   * where _property_ can be a number or a word that does not contain the special
   * `"{"` and `"}"` characters.
   *
   * To represent a literal brace character, place two consecutive brace characters,
   * `"{{"` or `"}}"`.
   *
   * When a property tag results in a _nully_ value (like when `scope` is not specified),
   * it is replaced by the special marker `"[?]"`.
   *
   * @alias format
   * @memberOf pentaho.util.MessageBundle
   * @param {string} [text=""] The text to format.
   * @param {Array|Object|function} [scope] A scope array, object or function.
   *
   * @return {string} The formatted string.
   */
  MessageBundle.format = function(text, scope) {
    var scopeFun;
    if(scope == null)
      scopeFun = function(prop) { return null; };
    else if(typeof scope === "function")
      scopeFun = scope;
    else
      scopeFun = function(prop) { return O.getOwn(scope, prop); };

    return (text || "").replace(/(^|[^{])\{([^{}]+)\}/g, function($0, before, prop) {
      var value = scopeFun(prop);
      return before + (value == null ? "[?]" : value.toString());
    });
  };

  MessageBundle.prototype.format = MessageBundle.format;

  return MessageBundle;

  function propertiesToObject(source) {
    var output = {};
    O.eachOwn(source, buildPath, output);
    return output;
  }

  function buildPath(value, key) {
    var path = key.split('.');
    var obj = this;

    for (var i = 0, ic = path.length; i != ic; ++i) {
      var p = path[i];

      if(i < ic-1) {
        if(!O.hasOwn(obj, p)) {
          obj[p] = {};
        }

        obj = obj[p];
      } else {
        obj[p] = value;
      }
    }
  }
});

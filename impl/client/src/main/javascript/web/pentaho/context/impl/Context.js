/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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

  /* eslint new-cap: 0 */

  /**
   * @alias Context
   * @memberOf pentaho.context.impl
   *
   * @class
   * @implements pentaho.context.IContext
   *
   * @classDesc The `Context` class is an implementation of the [IContext]{@link pentaho.context.IContext} interface.
   *
   * @constructor
   * @description Creates a context given its specification.
   *
   * Any absent or `undefined`-valued properties assume the values of the given default specification, if any,
   * or `null`, if none.
   *
   * @param {pentaho.context.spec.IContext} [spec] The context specification.
   * @param {pentaho.context.spec.IContext} [defaultSpec] The context specification
   * from which unspecified or `undefined` `spec` properties are initialized.
   */
  function pentaho_context_impl_Context(spec, defaultSpec) {

    if(!spec) spec = {};

    this.application = readVar(spec, "application", defaultSpec);
    this.theme  = readVar(spec, "theme", defaultSpec);
    this.locale = readVar(spec, "locale", defaultSpec);

    var propSpec = readVar(spec, "user");
    var propSpecDef = readVar(defaultSpec, "user");
    this.user = {
      id:   readVar(propSpec, "id", propSpecDef),
      home: readVar(propSpec, "home", propSpecDef)
    };

    // URL missing on IE11 and on PhantomJS 2.0
    propSpec = readVar(spec, "server");
    propSpecDef = readVar(defaultSpec, "server");
    this.server = {
      // href
      // protocol
      // pathname
      url: createURL(readVar(propSpec, "url", propSpecDef))
    };

    this.reservedChars = readVar(spec, "reservedChars", defaultSpec);

    // Not very friendly for subclasses, but this class is not designed to be subclassed by others.
    Object.freeze(this);
  }

  var proto = pentaho_context_impl_Context.prototype = /** @lends pentaho.context.impl.Context# */{
    createChild: function(childSpec) {
      return new pentaho_context_impl_Context(childSpec, this.toSpec());
    },

    toSpec: function() {
      return {
        application: this.application,
        theme: this.theme,
        locale: this.locale,
        user: {
          id: this.user.id,
          home: this.user.home
        },
        server: {
          url: this.server.url && this.server.url.href
        },
        reservedChars: this.reservedChars
      };
    }
  };

  proto.toJSON = proto.toSpec;

  return pentaho_context_impl_Context;

  function readVar(spec, name, defaultSpec) {
    return (spec && spec[name]) || (defaultSpec && defaultSpec[name]) || null;
  }

  function createURL(url) {
    if(url) {
      if(typeof URL !== "undefined") {
        try {
          var urlObj = new URL(url);
          if(urlObj.href) { // PhantomJS 2.0 does not have an href property !!
            return urlObj;
          }
        } catch(ex) {
          // Invalid URL syntax
        }
      }

      // Return a MOCK
      var m = /^\s*([^:\/?#]+:)?/.exec(url);
      return {
        href:     url,
        protocol: m[1],
        pathname: url // TODO: parse URL... ?
      };
    }

    return null;
  }
});

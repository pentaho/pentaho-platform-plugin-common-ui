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
  "../lang/Base"
], function(Base) {

  "use strict";

  /**
   * @name pentaho.type.SpecificationScope
   * @class
   * @amd pentaho/type/SpecificationScope
   *
   * @classDesc A `SpecificationScope` object holds information that is
   * shared during the serialization (or conversion to specification) of an instance or type.
   *
   * Specifically, a scope tracks the temporary ids assigned to referenced anonymous types.
   *
   * @constructor
   * @description Creates a `SpecificationScope`.
   */
  var SpecificationScope = Base.extend(/** @lends pentaho.type.SpecificationScope# */{

    dispose: function() {

    }
  });

  return SpecificationScope;
});

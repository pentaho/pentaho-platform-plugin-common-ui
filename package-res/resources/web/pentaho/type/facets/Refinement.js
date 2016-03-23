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
define([
  "../../lang/Base",
  "../../util/error"
], function(Base, error) {

  "use strict";

  /**
   * @name pentaho.type.facets.RefinementFacet
   * @amd pentaho/type/facets/Refinement
   * @class
   * @classDesc A refinement facet provides a refinement type
   * with attributes which, when specified, refine the representation type in some way.
   *
   * Refinement facets are mixed into a {@link pentaho.type.Refinement} type,
   * by specifying its {@link pentaho.type.Refinement.Type#facets} property,
   * when defining it, either
   * through {@link pentaho.type.Value.refine} or, directly,
   * through {@link pentaho.type.Refinement.extend}.
   *
   * Besides any attributes that you may define in this type's prototype,
   * to enable configuring an actual refinement,
   * you must implement the static {@link pentaho.type.facets.RefinementFacet.validate} method
   * that will perform the actual validation of instances of the representation class.
   * Note that this method is invoked on the mixed into refinement type,
   * an instance of {@link pentaho.type.Refinement.Type}.
   *
   * @description The constructor is not used, as a mixin.
   * @abstract
   * @see pentaho.type.Refinement
   * @see pentaho.type.Refinement.Type#facets
   */
  return Base.extend("pentaho.type.facets.RefinementFacet", {
    /* prototype mixin stuff */
  }, /** @lends pentaho.type.facets.RefinementFacet */{
    /**
     * Performs validation of a given value of the representation type.
     *
     * This method is invoked **on** the refinement type,
     *  an instance of {@link pentaho.type.Refinement.Type}.
     *
     * The default implementation throws an error.
     *
     * @param {!pentaho.type.Value} value The value to validate according to this refinement facet.
     *
     * @return {Error|Array.<!Error>|null} An `Error`, a non-empty array of `Error` or `null`.
     */
    validate: function(value) {
      throw error.notImplemented();
    }
  });
});
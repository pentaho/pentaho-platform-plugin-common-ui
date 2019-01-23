/*!
 * Copyright 2019 Hitachi Vantara. All rights reserved.
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
  "module",
  "./Annotation"
], function(module, Annotation) {

  return Annotation.extend(module.id, /** @lends pentaho.module.SyncAnnotation# */{
    /**
     * @classDesc The base abstract class of synchronous annotations.
     *
     * The [create]{@link pentaho.module.SyncAnnotation.create} factory method
     * allows creating an annotation.
     *
     * @name SyncAnnotation
     * @memberOf pentaho.module
     * @class
     * @extend pentaho.module.Annotation
     * @abstract
     *
     * @description Creates a synchronous annotation associated with a given module.
     * @constructor
     * @param {pentaho.module.IMeta} forModule - The annotated module.
     */
  }, /** @lends pentaho.module.SyncAnnotation */{
    /**
     * Gets a value that indicates if the annotation type is synchronous.
     *
     * This property always returns `true`.
     *
     * @type {boolean}
     * @readOnly
     * @default true
     * @override
     * @final
     */
    get isSync() {
      return true;
    }

    /**
     * Creates a synchronous annotation, given the annotated module and the annotation specification.
     *
     * @name create
     * @memberOf pentaho.module.SyncAnnotation
     * @method
     * @param {pentaho.module.IMeta} forModule - The annotated module.
     * @param {object} annotSpec - The annotation specification.
     * @return {pentaho.module.SyncAnnotation} The created annotation.
     * @abstract
     */
  });
});
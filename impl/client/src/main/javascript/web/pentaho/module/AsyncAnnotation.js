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

  return Annotation.extend(module.id, /** @lends pentaho.module.AsyncAnnotation# */{
    /**
     * @classDesc The base abstract class of asynchronous annotations.
     *
     * The [createAsync]{@link pentaho.module.AsyncAnnotation.createAsync} factory method allows creating an annotation.
     *
     * @name AsyncAnnotation
     * @memberOf pentaho.module
     * @class
     * @extend pentaho.module.Annotation
     * @abstract
     *
     * @description Creates an asynchronous annotation associated with a given module.
     * @constructor
     * @param {pentaho.module.IMeta} forModule - The annotated module.
     */
  }, /** @lends pentaho.module.AsyncAnnotation */{
    /**
     * Gets a value that indicates if the annotation type is synchronous.
     *
     * This property always returns `false`.
     *
     * @type {boolean}
     * @readOnly
     * @default false
     * @override
     * @final
     */
    get isSync() {
      return false;
    }

    /**
     * Creates an asynchronous annotation, given the annotated module and the annotation specification.
     *
     * @name createAsync
     * @memberOf pentaho.module.AsyncAnnotation
     * @method
     * @param {pentaho.module.IMeta} forModule - The annotated module.
     * @param {object} annotSpec - The annotation specification.
     * @return {Promise.<pentaho.module.AsyncAnnotation>} A promise that resolves to the created annotation.
     * @abstract
     */
  });
});
/*!
 * Copyright 2010 - 2019 Hitachi Vantara. All rights reserved.
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
  "../ReferenceList",
  "pentaho/lang/Base"
], function(module, ReferenceList, Base) {

  "use strict";

  return Base.extend(module.id, /** @lends pentaho.type.action.ChangeRef# */{
    /**
     * @classDesc The `ChangeRef` holds changes to the references list of a container instance.
     *
     * Reusing the changesets for this type of internal changes would create and expose changesets
     * having no visible changes to the user.
     * For example, if a list element is removed, only a changeset is needed for the list, not for the element.
     * The latter only needs a ChangeRef...
     *
     * It does not store the container instance to save memory.
     * It is passed again on the relevant methods.
     *
     * @alias ChangeRef
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.lang.Base
     * @constructor
     * @param {pentaho.type.mixins.Container} target - The target container.
     * @private
     */
    constructor: function(target) {
      this.target = target;

      this.__refsAdd = null;
      this.__refsRem = null;
      this.__refsCache = undefined;
    },

    /**
     * Adds a reference to the target of this changeset.
     *
     * @param {pentaho.type.mixins.Container} container - The container that references the target of the changeset.
     * @param {pentaho.type.PropertyType} [propType] When `container` is a complex,
     * the property type whose value contains the target of this changeset.
     */
    addReference: function(container, propType) {
      if((this.__refsRem !== null && this.__refsRem.remove(container, propType)) ||
         (this.__refsAdd || (this.__refsAdd = ReferenceList.to([]))).add(container, propType)) {
        this.__refsCache = undefined;
      }
    },

    /**
     * Removes a reference to this instance.
     *
     * @param {pentaho.type.mixins.Container} container - The container that used to refer this one.
     * @param {pentaho.type.PropertyType} [propType] When `container` is a complex,
     * the property type whose value used to contain this instance.
     */
    removeReference: function(container, propType) {
      if((this.__refsAdd !== null && this.__refsAdd.remove(container, propType)) ||
         (this.__refsRem || (this.__refsRem = ReferenceList.to([]))).add(container, propType)) {
        this.__refsCache = undefined;
      }
    },

    /**
     * Gets the projected references array, possibly `null`.
     *
     * @type {pentaho.type.ReferenceList}
     * @readOnly
     */
    get projectedReferences() {
      var refsCache = this.__refsCache;
      if(refsCache === undefined) {
        this.__refsCache = refsCache = this.__updateReferences(this.target.__refs, /* mutate: */false);
      }

      return refsCache;
    },

    apply: function() {
      var refsCache = this.__refsCache;
      if(refsCache === undefined) {
        this.target.__refs = this.__updateReferences(this.target.__refs, /* mutate: */true);
      } else {
        this.target.__refs = refsCache;
      }
    },

    /**
     * Updates a given references array with the reference changes in this changeset.
     *
     * When there are no ref changes, the target refs are returned, which, note, can be `null`.
     *
     * @param {pentaho.type.ReferenceList} refs - The references list to update, or `null`.
     * @param {boolean} mutate - Indicates if the given list can be mutated, or if a copy must be created.
     *
     * @return {pentaho.type.ReferenceList} The updated references list.
     * @private
     */
    __updateReferences: function(refs, mutate) {
      var refsRem = this.__refsRem;
      var refsAdd = this.__refsAdd;
      if(refsRem || refsAdd) {
        if(!refs) {
          refs = ReferenceList.to([]);
        } else if(!mutate) {
          refs = ReferenceList.to(refs.slice());
        }

        var i;
        var L;
        var aref;
        if(refsRem) {
          i = -1;
          L = refsRem.length;
          while(++i < L) {
            aref = refsRem[i];
            refs.remove(aref.container, aref.property);
          }
        }

        if(refsAdd) {
          i = -1;
          L = refsAdd.length;
          while(++i < L) {
            aref = refsAdd[i];
            refs.add(aref.container, aref.property);
          }
        }
      }

      return refs;
    }
  });
});

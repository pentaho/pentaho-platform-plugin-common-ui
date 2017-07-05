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
  "../ReferenceList",
  "../../lang/Base"
], function(ReferenceList, Base) {

  "use strict";

  return Base.extend(/** @lends pentaho.type.changes.ChangeRef# */{
    /**
     * @classDesc The `ChangeRef` holds changes to the references list of a container instance.
     *
     * Reusing the changesets for this type of internal changes would create and expose changesets
     * with no visible changes to the user.
     *
     * It does not store the container instance to save memory.
     * It is passed again on the relevant methods.
     *
     * @alias ChangeRef
     * @memberOf pentaho.type.changes
     * @class
     * @extends pentaho.lang.Base
     * @constructor
     * @param {!pentaho.type.mixins.Container} owner - The owner container.
     * @private
     */
    constructor: function(owner) {
      this.owner = owner;

      this._refsAdd = null;
      this._refsRem = null;
    },

    /**
     * Adds a reference to the owner of this changeset.
     *
     * @param {!pentaho.type.mixins.Container} container - The container that references the owner of the changeset.
     * @param {pentaho.type.Property.Type} [propType] When `container` is a complex,
     * the property type whose value contains the owner of this changeset.
     */
    addReference: function(container, propType) {
      if(!(this._refsRem && this._refsRem.remove(container, propType))) {

        (this._refsAdd || (this._refsAdd = ReferenceList.to([]))).add(container, propType);
      }
    },

    /**
     * Removes a reference to this instance.
     *
     * @param {!pentaho.type.mixins.Container} container - The container that used to refer this one.
     * @param {pentaho.type.Property.Type} [propType] When `container` is a complex,
     * the property type whose value used to contain this instance.
     */
    removeReference: function(container, propType) {
      if(!(this._refsAdd && this._refsAdd.remove(container, propType))) {

        (this._refsRem || (this._refsRem = ReferenceList.to([]))).add(container, propType);
      }
    },

    /**
     * Gets the projected references array.
     *
     * @type {!pentaho.type.ReferenceList}
     * @readOnly
     */
    get projectedReferences() {
      return this._updateReferences(this.owner._refs, /* mutate: */false);
    },

    apply: function() {
      this.owner._refs = this._updateReferences(this.owner._refs, /* mutate: */true);
    },

    /**
     * Updates a given references array with the reference changes in this changeset.
     *
     * When there are no ref changes, the owner refs are returned, which, note, can be `null`.
     *
     * @param {pentaho.type.ReferenceList} refs - The references list to update, or `null`.
     * @param {boolean} mutate - Indicates if the given list can be mutated, or if a copy must be created.
     *
     * @return {!pentaho.type.ReferenceList} The updated references list.
     * @private
     */
    _updateReferences: function(refs, mutate) {
      var refsRem = this._refsRem;
      var refsAdd = this._refsAdd;
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

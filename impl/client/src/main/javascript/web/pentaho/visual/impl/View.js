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
  "pentaho/lang/Base",
  "../Model",
  "pentaho/type/action/ComplexChangeset",
  "pentaho/lang/UserError",
  "pentaho/lang/RuntimeError",
  "../action/Update",
  "../action/ModelChangedError",
  "pentaho/util/object",
  "pentaho/util/fun",
  "pentaho/util/BitSet",
  "pentaho/util/error",
  "pentaho/util/arg",
  "pentaho/util/logger"
], function(module, Base, VisualModel, ComplexChangeset, UserError, RuntimeError, UpdateAction, ModelChangedError,
            O, F, BitSet, error, arg, logger) {

  "use strict";

  var UPDATE_ACTION_ID = UpdateAction.id;
  var BASE_MODEL_ID = VisualModel.type.id;

  var __reUpdateMethodName = /^_update(.+)$/;

  var BaseView = Base.extend(module.id, /** @lends pentaho.visual.impl.View# */{

    /**
     * @alias BaseView
     * @memberOf pentaho.visual.base
     *
     * @class
     * @extends pentaho.lang.Base
     * @implements {pentaho.visual.IView}
     *
     * @abstract
     *
     * @amd pentaho/visual/impl/View
     *
     * @classDesc The `impl.View` class is an optional base class for visualization views which implements
     * the [IView]{@link pentaho.visual.IView} interface.
     *
     * An application instantiates a view given a specification with the visualization model and
     * the container HTML element.
     *
     * The first update of the view must be explicitly triggered by a call to
     * [model.update]{@link pentaho.visual.Model#update}.
     *
     * Over time, the model may be mutated and, whenever its `Update:{do}` event is emitted,
     * the view automatically updates itself.
     *
     * The view translates user interaction by perform [actions]{@link pentaho.visual.Model#act} on the model.
     * The standard actions are [Select]{@link pentaho.visual.action.Select} and
     * [Execute]{@link pentaho.visual.action.Execute}.
     * There are sugar methods on the model to perform these, [select]{@link pentaho.visual.Model#select} and
     * [execute]{@link pentaho.visual.Model#execute}.
     *
     * When a view is no longer needed,
     * the application **must** call its [dispose]{@link pentaho.visual.impl.View#dispose} method,
     * so that the view can free held _resources_ and not cause memory-leaks.
     *
     * @constructor
     * @description Creates a view instance, given its specification.
     *
     * @param {pentaho.visual.spec.IView} viewSpec - The view specification.
     */
    constructor: function(viewSpec) {

      /**
       * The visualization model.
       *
       * @type {pentaho.visual.Model}
       * @readOnly
       * @private
       */
      this.__model = arg.required(viewSpec, "model", "viewSpec");
      if(!(this.__model instanceof VisualModel)) {
        throw error.argInvalidType("viewSpec.model", BASE_MODEL_ID, typeof this.__model);
      }

      /**
       * The HTML container element where the view is rendered.
       *
       * @type {HTMLElement}
       * @readOnly
       * @private
       */
      this.__domContainer = arg.required(viewSpec, "domContainer", "viewSpec");

      /**
       * A handle to detach from the Update:do event.
       *
       * @type {pentaho.lang.IDisposable}
       * @private
       */
      this.__updateEventHandle = this.__model.on(UPDATE_ACTION_ID, {
        "do": this._update.bind(this)
      });

      /**
       * Indicates if the first update has been done.
       *
       * @type {boolean}
       * @private
       * @default false
       */
      this.__hasUpdatedAll = false;
    },

    /**
     * Gets the container DOM element where the view is rendered.
     *
     * The container element is the viewport through which the view's rendered content is revealed.
     * and is provided empty, for the exclusive use of the view, by the _container application_.
     *
     * Its _content_ is owned by the view,
     * but its attributes (including style and class) are owned by the container application and
     * must **not** be changed by the view.
     *
     * Its size is controlled by the container application and does not need to be the same as
     * that implied by the visual model's
     * [width]{@link pentaho.visual.Model#width} and
     * [height]{@link pentaho.visual.Model#height} properties,
     * however, normally, it will.
     *
     * It is the responsibility of the container application to clean up the container element's content,
     * if needed, after the view is disposed of.
     * When disposed of, the view has the responsibility of cleaning up any DOM event handlers it
     * may hold on the container element or any of its children.
     *
     * @type {HTMLElement}
     * @readOnly
     */
    get domContainer() {
      return this.__domContainer;
    },

    /**
     * Gets the visualization model.
     *
     * @type {pentaho.visual.Model}
     */
    get model() {
      return this.__model;
    },

    /**
     * Gets a value that indicates if a full update has been done.
     *
     * A full update which is unsuccessful is not accounted for.
     * All updates are full updates until a full update is successful.
     *
     * @type {boolean}
     * @readOnly
     */
    get hasUpdatedAll() {
      return this.__hasUpdatedAll;
    },

    // region Update
    /**
     * Updates the view by choosing an appropriate `_update*` method according to the given changeset.
     *
     * The [first update]{@link pentaho.visual.impl.View#hasUpdatedAll} of a visualization
     * is always a complete update of the visualization,
     * as implemented by [_updateAll]{@link pentaho.visual.impl.View#_updateAll}.
     *
     * BaseView subclasses **should** override and implement the `_updateAll` method.
     *
     * Additionally, view subclasses should consider implementing one or more of the optional
     * **partial update methods**, like
     * [_updateData]{@link pentaho.visual.impl.View#_updateData},
     * [_updateSize]{@link pentaho.visual.impl.View#_updateSize},
     * [_updateSelection]{@link pentaho.visual.impl.View#_updateSelection} and
     * [_updateGeneral]{@link pentaho.visual.impl.View#_updateGeneral}.
     *
     * Other appropriate combinations of these can also be implemented,
     * for example, `_updateSizeAndSelection`,
     * by combining the names of the known property groups: `Data`, `Size`, `Selection` and `General`,
     * with an `And` to form a corresponding method name.
     * For more information on property groups,
     * see [View.PropertyGroups]{@link pentaho.visual.impl.View.PropertyGroups}.
     *
     * @param {pentaho.action.Execution} event - The update action execution.
     * @param {pentaho.visual.action.Update} action - The update action.
     *
     * @return {?Promise|undefined} A promise for the completion of the view update.
     *
     * @protected
     *
     * @see pentaho.visual.impl.View#hasUpdatedAll
     * @see pentaho.visual.impl.View#_updateAll
     * @see pentaho.visual.impl.View#_updateData
     * @see pentaho.visual.impl.View#_updateSize
     * @see pentaho.visual.impl.View#_updateSelection
     * @see pentaho.visual.impl.View#_updateGeneral
     */
    _update: function(event, action) {

      // First updates are always full.
      var changeset = this.__hasUpdatedAll ? action.changeset : null;

      var dirtyPropGroups = new BitSet();

      this.__onChangeClassify(dirtyPropGroups, changeset);

      if(!dirtyPropGroups.isEmpty) {

        var updateMethodInfo = this.__selectUpdateMethod(dirtyPropGroups);

        return Promise.resolve(this[updateMethodInfo.name]())
          .then(this.__onUpdateResolved.bind(this, event));
      }
    },

    /**
     * Called when an update execution is handled.
     *
     * @param {pentaho.action.Execution} event - The update action execution.
     * @private
     */
    __onUpdateResolved: function(event) {
      if(!event.isRejected) {
        this.__hasUpdatedAll = true;
      }
    },

    /**
     * Called when the model properties have changed to classify the type of changes that occurred.
     *
     * The default implementation marks the _property groups_ of the properties affected
     * by the given changeset as dirty.
     *
     * The recognized property groups are those of
     * [View.PropertyGroups]{@link pentaho.visual.impl.View.PropertyGroups}.
     *
     * Implementations can override this method to change the default behavior for some or all of the
     * model properties.
     *
     * @param {pentaho.util.BitSet} dirtyPropGroups - A bit set of property groups that should be set dirty.
     * Use the values of [View.PropertyGroups]{@link pentaho.visual.impl.View.PropertyGroups} as bit values.
     *
     * @param {?pentaho.type.Changeset} changeset - The model's changeset. When `null`,
     * indicates that everything has changed.
     *
     * @private
     */
    __onChangeClassify: function(dirtyPropGroups, changeset) {

      var ViewClass = this.constructor;

      if(changeset === null) {
        dirtyPropGroups.set(ViewClass.PropertyGroups.All);
        return;
      }

      classify(ViewClass.__PropertyGroupOfProperty, changeset);

      function classify(groupsTree, changeset) {
        if(changeset instanceof ComplexChangeset) {
          changeset.propertyNames.forEach(function(name) {
            var dirtyGroupName;
            var result = groupsTree[name];
            if(result) {
              switch(typeof result) {
                case "string":
                  dirtyGroupName = result;
                  break;
                case "object":
                  return classify(result, changeset.getChange(name));
                default:
                  throw new Error("Invalid property groups tree.");
              }
            } else {
              dirtyGroupName = "General";
            }

            dirtyPropGroups.set(ViewClass.PropertyGroups[dirtyGroupName]);
          });
        } else {
          // Whole object swapped?
          dirtyPropGroups.set(groupsTree._ || ViewClass.PropertyGroups.General);
        }
      }
    },

    /**
     * Selects the best update method for a given set of dirty property groups.
     *
     * @param {pentaho.util.BitSet} dirtyPropGroups - The set of dirty property groups.
     *
     * @return {object} The information object of the selected update method.
     *
     * @private
     */
    __selectUpdateMethod: function(dirtyPropGroups) {

      var ViewClass = this.constructor;

      // 1. Is there an exact match?
      var methodInfo = ViewClass.__UpdateMethods[dirtyPropGroups.get()];
      if(!methodInfo) {

        // TODO: A sequence of methods that handles the dirty bits...

        // 2. Find the first method that cleans all (or more) of the dirty bits.
        ViewClass.__UpdateMethodsList.some(function(info) {
          if(dirtyPropGroups.isSubsetOf(info.mask)) {
            methodInfo = info;
            return true;
          }

          return false;
        });

        // At least the _updateAll method is registered. It is able to handle any dirty bits.
        // assert methodInfo
      }

      return methodInfo;
    },
    // endregion

    /**
     * Disposes the view by freeing external resources held by the view.
     *
     * The default implementation clears the HTML container reference and stops listening
     * to the model's [Update:{do}]{@link pentaho.visual.action.Update} phase event.
     */
    dispose: function() {
      if(this.__domContainer !== null) {
        this.__domContainer = null;

        this.__updateEventHandle.dispose();
        this.__updateEventHandle = null;
      }
    },

    // region Property groups - instance
    /** @inheritDoc */
    extend: function(source, keyArgs) {

      this.base(source, keyArgs);

      if(source) {
        var Subclass = this.constructor;
        var O_proto = Object.prototype;

        for(var methodName in source) {
          if(!(source in O_proto)) {
            var v = source[methodName];
            var m;
            if(F.is(v) && (m = __reUpdateMethodName.exec(methodName))) {

              var methodCleansBits = __parsePropertyGroupsText(Subclass, m[1]);
              if(methodCleansBits && !Subclass.__UpdateMethods[methodCleansBits]) {
                var updateMethodInfo = {
                  name: methodName,
                  mask: methodCleansBits
                };

                Subclass.__UpdateMethods[methodCleansBits] = updateMethodInfo;
                Subclass.__UpdateMethodsList.push(updateMethodInfo);

                Subclass.__UpdateMethodsList.sort(function(a, b) {
                  // Never happens: if(a.mask === b.mask) return 0;
                  return new BitSet(a.mask).isSubsetOf(b.mask) ? -1 : 1;
                });
              }
            }
          }
        }
      }

      return this;
    }
    // endregion
  }, /** @lends pentaho.visual.impl.View */{

    // region Property groups - class
    /** @inheritDoc */
    _subclassed: function(Subclass, instSpec, classSpec, keyArgs) {

      // "Inherit" PropertyGroups, __PropertyGroupOfProperty, __UpdateMethods and __UpdateMethodsList properties
      Subclass.PropertyGroups            = Object.create(this.PropertyGroups);
      Subclass.__PropertyGroupOfProperty = Object.create(this.__PropertyGroupOfProperty);
      Subclass.__UpdateMethods           = Object.create(this.__UpdateMethods);
      Subclass.__UpdateMethodsList       = this.__UpdateMethodsList.slice();

      this.base(Subclass, instSpec, classSpec, keyArgs);
    },

    PropertyGroups: O.assignOwn(
      Object.create(null),
      /**
       * The `PropertyGroups` enumeration contains the entries for the distinct groups of properties that the
       * [View]{@link pentaho.visual.impl.View} class recognizes when categorizing property changes.
       *
       * @alias pentaho.visual.impl.View.PropertyGroups
       * @enum {number}
       * @readOnly
       *
       * @see pentaho.visual.impl.View#__onChangeClassify
       */
      {
        /**
         * Includes all model properties.
         */
        All: ~0,

        /**
         * The group of properties whose changes are ignored,
         * because the view does not visually represent these in any way.
         */
        Ignored: 0,

        /**
         * The group of properties that don't have a more specific property group.
         */
        General: 1,

        /**
         * The group of data-related properties.
         *
         * The only property of this group is the
         * [data]{@link pentaho.visual.Model#data} property.
         */
        Data: 2,

        /**
         * The group of size-related properties.
         *
         * The properties of this group are the
         * [width]{@link pentaho.visual.Model#width} and
         * [height]{@link pentaho.visual.Model#height} properties.
         */
        Size: 4,

        /**
         * The group of selection-related properties.
         *
         * The only property of this group is the
         * [selectionFilter]{@link pentaho.visual.Model#selectionFilter} property.
         */
        Selection:  8
      }),

    // BaseView property path -> Property group name
    __PropertyGroupOfProperty: O.assignOwn(Object.create(null), {
      // "_": "All",
      "data": "Data",
      "selectionFilter": "Selection",
      "width": "Size",
      "height": "Size"
    }),

    // bits -> {name: , mask: }
    __UpdateMethods: Object.create(null),

    // [{name: , mask: }, ...]
    __UpdateMethodsList: []
    // endregion
  })
  .implement(/** @lends pentaho.visual.impl.View# */{
    // region _updateXyz Methods
    /**
     * Fully renders or updates the view.
     *
     * The first update of a visualization is always a full update.
     *
     * The default implementation does nothing.
     *
     * @protected
     *
     * @see pentaho.visual.impl.View#_update
     * @see pentaho.visual.impl.View#hasUpdatedAll
     * @see pentaho.visual.impl.View.PropertyGroups
     */
    _updateAll: function() {
    }

    /**
     * Updates the view, taking into account that
     * only the dimensions of the model have changed.
     *
     * This is an **optional** method - there is no base implementation.
     *
     * Implement this method to provide a faster way to resize a view.
     * When not specified, and no other applicable partial update method exists,
     * the full [_updateAll]{@link pentaho.visual.impl.View#_updateAll} method is used to update the view.
     *
     * @name _updateSize
     * @memberOf pentaho.visual.impl.View#
     * @method
     * @protected
     * @optional
     *
     * @see pentaho.visual.impl.View#_update
     */

    /**
     * Updates the view, taking into account that
     * only the selection-related model properties have changed.
     *
     * This is an **optional** method - there is no base implementation.
     *
     * Implement this method to provide a faster way to update the selection of the view.
     * When not specified, and no other applicable partial update method exists,
     * the view is updated using the [_updateAll]{@link pentaho.visual.impl.View#_updateAll} method.
     *
     * @name _updateSelection
     * @memberOf pentaho.visual.impl.View#
     * @method
     * @protected
     * @optional
     *
     * @see pentaho.visual.impl.View#_update
     */

    /**
     * Updates the view, taking into account that
     * only the data-related model properties have changed.
     *
     * This is an **optional** method - there is no base implementation.
     *
     * Implement this method to provide a faster way to update the data displayed by the view.
     * When not specified, and no other applicable partial update method exists,
     * the view is updated using the [_updateAll]{@link pentaho.visual.impl.View#_updateAll} method.
     *
     * @name _updateData
     * @memberOf pentaho.visual.impl.View#
     * @method
     * @protected
     * @optional
     *
     * @see pentaho.visual.impl.View#_update
     */

    /**
     * Updates the view, taking into account that only "general" model properties have changed.
     *
     * This is an **optional** method - there is no base implementation.
     *
     * Implement this method to provide a faster way to update the "general information" displayed by the view.
     * When not specified, and no other applicable partial update method exists,
     * the view is updated using the [_updateAll]{@link pentaho.visual.impl.View#_updateAll} method.
     *
     * @name _updateGeneral
     * @memberOf pentaho.visual.impl.View#
     * @method
     * @protected
     * @optional
     *
     * @see pentaho.visual.impl.View#_update
     */
    // endregion
  });

  return BaseView;

  /**
   * Parses the custom part of the name of partial update method (like *_updateXyz*).
   *
   * @param {Class.<pentaho.visual.impl.View>} ViewClass - The view class.
   * @param {string} groupNamesText - The part of the method name following the prefix "_update".
   *
   * @return {number} The property group bits corresponding to the method name.
   */
  function __parsePropertyGroupsText(ViewClass, groupNamesText) {

    var groupsBits = 0;

    groupNamesText.split("And").forEach(function(groupName) {
      var groupBits = ViewClass.PropertyGroups[groupName];
      if(groupBits == null || isNaN(+groupBits)) {
        logger.warn("There is no registered property group with name '" + groupName + "'.");
      } else {
        groupsBits |= groupBits;
      }
    });

    return groupsBits;
  }
});

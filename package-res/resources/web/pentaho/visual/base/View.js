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
  "module",
  "pentaho/lang/Base",
  "pentaho/lang/EventSource",
  "./events/WillUpdate",
  "./events/DidUpdate",
  "./events/RejectedUpdate",
  "pentaho/lang/UserError",
  "pentaho/util/object",
  "pentaho/util/arg",
  "pentaho/util/fun",
  "pentaho/util/BitSet",
  "pentaho/util/error",
  "pentaho/util/logger",
  "pentaho/util/promise"
], function(module, Base, EventSource, WillUpdate, DidUpdate, RejectedUpdate, UserError,
            O, arg, F, BitSet, error, logger, promise) {

  "use strict";

  /* global Promise:false */

  // Allow ~0
  // jshint -W016

  var _reUpdateMethodName = /^_update(.+)$/;

  var View = Base.extend(module.id, /** @lends pentaho.visual.base.View# */{

    /**
     * @alias View
     * @memberOf pentaho.visual.base
     *
     * @class
     * @extends pentaho.lang.Base
     * @implements pentaho.lang.IDisposable
     * @mixes pentaho.lang.EventSource
     *
     * @abstract
     * @amd pentaho/visual/base/View
     *
     * @classDesc This is the base class for views of visualizations.
     *
     * A container is expected to instantiate a `View` with
     * a container DOM element and a `Model` instance,
     * which may not be immediately valid.
     *
     * The first rendering of the view must be explicitly triggered by a call to
     * [update]{@link pentaho.visual.base.View#update}.
     * This allows the _container application_ to further configure the view,
     * like, for example,
     * setting the [isAutoUpdate]{@link pentaho.visual.base.View#isAutoUpdate} property
     * or registering event listeners,
     * before the initial update.
     *
     * Over time, the container mutates the `Model` instance and, in response,
     * the view detects these changes, marks itself [dirty]{@link pentaho.visual.base.View#isDirty},
     * and, by default, automatically updates itself.
     *
     * When a view is no longer needed,
     * the _container application_ **must** call its [dispose]{@link pentaho.visual.base.View#dispose} method,
     * so that the view can free held _resources_ and not cause memory-leaks.
     *
     * @constructor
     * @description Initializes a `View` instance.
     * @param {!DOMElement} domContainer - The container element.
     * @param {!pentaho.visual.base.Model} model - The visualization model.
     * @param {object} state - The initial state of the view.
     */
    constructor: function(domContainer, model, state) {
      if(!domContainer) throw error.argRequired("domContainer");
      if(!model) throw error.argRequired("model");

      /**
       * The container element where the view is rendered.
       *
       * @type {!DOMElement}
       * @readOnly
       * @private
       */
      this.__domContainer = domContainer;

      /**
       * The visual model.
       *
       * @type {!pentaho.visual.base.Model}
       * @readOnly
       * @private
       */
      this.__model = model;

      /**
       * The state of the view.
       *
       * @type {object}
       * @readOnly
       * @private
       */
      this.__state = state;

      /**
       * The promise for the completion of the current update operation, if any; or `null`.
       *
       * @type {Promise}
       * @private
       */
      this.__updatingPromise = null;

      /**
       * Indicates if the view is automatically updated whenever the model is changed.
       *
       * @type {boolean}
       * @default true
       * @private
       */
      this.__isAutoUpdate = true;

      /**
       * The set of dirty property groups of the view.
       *
       * @type {!pentaho.util.BitSet}
       * @readOnly
       * @private
       */
      this.__dirtyPropGroups = new BitSet(View.PropertyGroups.All); // mark view as initially dirty

      /**
       * The model's "did:change" event registration handle.
       *
       * @type {!pentaho.lang.IEventRegistrationHandle}
       * @readOnly
       * @private
       */
      this.__changeDidHandle = model.on("did:change", this.__onChangeDidOuter.bind(this), {
        priority: 1
      });
    },

    // region Properties
    /**
     * Gets the container DOM element where the view is rendered.
     *
     * The container element is the viewport through which the view's rendered content is revealed.
     * and is provided at construction time, empty, for its exclusive use, by the _container application_.
     *
     * Its _content_ is owned by the view,
     * but its attributes (including style) are owned by the container application and
     * must **not** be changed by the view.
     *
     * Its size is controlled by the container application and does not need to be the same as
     * that implied by the visual model's
     * [width]{@link pentaho.visual.base.Model#width} and
     * [height]{@link pentaho.visual.base.Model#height} properties.
     *
     * It is the responsibility of the container application to clean up the container element,
     * if needed, after the view is disposed.
     *
     * @type {!DOMElement}
     * @readOnly
     */
    get domContainer() {
      return this.__domContainer;
    },

    /**
     * Gets the visualization model.
     *
     * @type {!pentaho.visual.base.Model}
     * @readOnly
     * @see pentaho.visual.base.View#context
     */
    get model() {
      return this.__model;
    },

    /**
     * Gets the type context of the view's model.
     *
     * This getter is syntax sugar for `this.model.type.context`.
     *
     * @type {!pentaho.type.Context}
     * @readOnly
     * @see pentaho.visual.base.View#model
     */
    get context() {
      return this.model.type.context;
    },

    /**
     * Gets a value that indicates if an update is in progress.
     *
     * @type {boolean}
     * @readOnly
     * @see pentaho.visual.base.View#update
     */
    get isUpdating() {
      return !!this.__updatingPromise;
    },

    /**
     * Gets or sets a value that enables or disables automatic updates of the view.
     *
     * When `true`, the view is automatically updated whenever a relevant change in the model occurs.
     * When `false`, the view must be manually updated by calling [update]{@link pentaho.visual.base.View#update}.
     *
     * Setting this property to `true` does **not** cause the view to update in response,
     * if it is currently [dirty]{@link pentaho.visual.base.View#isDirty}.
     * This property only affects the view's behaviour in response to subsequent model changes.
     *
     * @type {boolean}
     */
    get isAutoUpdate() {
      return this.__isAutoUpdate;
    },

    set isAutoUpdate(value) {
      this.__isAutoUpdate = !!value;
    },

    /**
     * Gets a value that indicates if the view is in a dirty state.
     *
     * A view is _dirty_ during the period after the view's model has changed to until the time the view is updated.
     *
     * During this period, the view **should not** handle any user interaction events,
     * as the user would be acting on an outdated representation of the model.
     *
     * @type {boolean}
     * @readOnly
     *
     * @see pentaho.visual.base.View#isAutoUpdate
     */
    get isDirty() {
      // Because dirty prop groups are cleared optimistically before update methods run,
      // it is needed to use isUpdating to not let that transient non-dirty state show through.
      return this.isUpdating || !this.__dirtyPropGroups.isEmpty;
    },
    // endregion

    // region Changes
    /**
     * Handles the model's `did:change` event.
     *
     * @private
     */
    __onChangeDidOuter: function(event) {

      var bitSetNew = new BitSet();

      this._onChangeDid(bitSetNew, event.changeset);

      if(!bitSetNew.isEmpty) {

        this.__dirtyPropGroups.set(bitSetNew.get());

        if(this.isAutoUpdate) {
          /* eshint dot-notation: 0 */
          this.update()["catch"](function(error) {
            logger.warn("Auto-update was canceled: " + error);
          });
        }
      }
    },

    /**
     * Called when the model of the view has changed.
     *
     * The default implementation marks the view as dirty.
     * More specifically, it marks the _property groups_ of the properties affected by the given changeset as dirty.
     *
     * The recognized property groups are those of [View.PropertyGroups]{@link pentaho.visual.base.View.PropertyGroups}.
     *
     * Implementations can override this method to change the default behavior for some or all of the
     * model's properties.
     *
     * @see pentaho.visual.base.View#_updateAll
     *
     * @param {!pentaho.util.BitSet} dirtyPropGroups - A bit set of property groups that should be set dirty.
     * Use the values of [View.PropertyGroups]{@link pentaho.visual.base.View.PropertyGroups} as bit values.
     *
     * @param {!pentaho.type.Changeset} changeset - The model's changeset.
     *
     * @protected
     */
    _onChangeDid: function(dirtyPropGroups, changeset) {

      changeset.propertyNames.forEach(function(name) {

        var dirtyGroupName = this[name] || "General";

        dirtyPropGroups.set(View.PropertyGroups[dirtyGroupName]);

      }, this.constructor.__PropertyGroupOfProperty);
    },
    // endregion

    // region Update
    /**
     * Updates the view to match its model's latest state.
     *
     * When [isAutoUpdate]{@link pentaho.visual.base.View#isAutoUpdate} is `true`,
     * any change to the view's model automatically triggers a view update by calling this method.
     *
     * The update operation is _generally_ asynchronous.
     * Even if the view implementation completes its update synchronously,
     * the completion is only advertised asynchronously,
     * through the emission of one of the events
     * [did:update]{@link pentaho.visual.base.events.DidUpdate} or
     * [rejected:update]{@link pentaho.visual.base.events.RejectedUpdate} and
     * the resolution of the returned promise.
     *
     * The [isUpdating]{@link pentaho.visual.base.View#isUpdating} property is `true` while the
     * update operation is considered in progress,
     * a period during which calling [update]{@link pentaho.visual.base.View#update} again
     * returns the same promise that was returned by the initial `update` call.
     *
     * If the view is not currently updating and is also not [dirty]{@link pentaho.visual.base.View#isDirty},
     * then calling `update` _immediately_ returns a fulfilled promise.
     *
     * Otherwise, by this time, [isUpdating]{@link pentaho.visual.base.View#isUpdating} will be `true`,
     * and the update operation proceeds to the **Will phase**.
     *
     * #### Will phase
     *
     * Initially, the [_updateWill]{@link pentaho.visual.base.View#_updateWill} method is called,
     * which by default emits the [will:update]{@link pentaho.visual.base.events.WillUpdate} event.
     * Either the implementation or the event listeners are allowed to cancel the update or further modify the model.
     *
     * If the update is _canceled_, the update is rejected with the cancel reason,
     * and enters the **Rejected phase**.
     *
     * #### Loop phase
     *
     * If the update is not canceled, the view enters an **update loop**
     * that only ends when either the view is up to date with the model
     * (in which case surely [isDirty]{@link pentaho.visual.base.View#isDirty} will be `false`),
     * or after some error occurs.
     *
     * On each iteration of the update loop:
     * 1. If the model is invalid, the update loop ends with a validation error and
     *    then the update operation proceeds to the **Rejected phase**;
     * 2. Otherwise, the "best fit" partial update method is selected and called to update the view;
     * 3. If the selected update method throws an error or returns a rejected promise,
     *    the update loop ends and the update operation proceeds to the **Rejected phase**;
     * 4. If the view is not [dirty]{@link pentaho.visual.base.View#isDirty} anymore,
     *    the update loop ends with success;
     * 5. Repeat.
     *
     * Over the view's lifetime, the very first "partial" update method that is selected is always the
     * full update method: [_updateAll]{@link pentaho.visual.base.View#_updateAll}.
     * Subsequent iterations may select _proper_ partial update methods, like
     * [_updateSize]{@link pentaho.visual.base.View#_updateSize} or
     * [_updateSelection]{@link pentaho.visual.base.View#_updateSelection}.
     *
     * #### Did phase
     *
     * The [isUpdating]{@link pentaho.visual.base.View#isUpdating} property will now be `false`.
     *
     * The [_onUpdateDid]{@link pentaho.visual.base.View#_onUpdateDid} method is called,
     * which by default emits the [did:update]{@link pentaho.visual.base.events.DidUpdate} event.
     *
     * The implementation or the event listeners are allowed to modify the model and thus trigger **new** updates
     * while in the _did_ phase.
     *
     * Lastly, the returned promise is fulfilled.
     *
     * #### Rejected phase
     *
     * The [isUpdating]{@link pentaho.visual.base.View#isUpdating} property will now be `false`.
     *
     * The [_onUpdateRejected]{@link pentaho.visual.base.View#_onUpdateRejected} method is called,
     * which by default emits the [rejected:update]{@link pentaho.visual.base.events.RejectedUpdate} event.
     *
     * The implementation or the event listeners are allowed to modify the model and thus trigger **new** updates
     * while in the _rejected_ phase.
     *
     * Lastly, the returned promise is rejected with the original error.
     *
     * @return {Promise} A promise that is fulfilled when the visualization is completely updated or
     * is rejected in case some error occurs.
     *
     * @fires "will:update"
     * @fires "rejected:update"
     * @fires "did:update"
     *
     * @see pentaho.visual.base.View#isAutoUpdate
     * @see pentaho.visual.base.View#isUpdating
     * @see pentaho.visual.base.View#isDirty
     *
     * @see pentaho.visual.base.View#_updateAll
     * @see pentaho.visual.base.View#_updateData
     * @see pentaho.visual.base.View#_updateSize
     * @see pentaho.visual.base.View#_updateSelection
     * @see pentaho.visual.base.View#_updateGeneral
     *
     * @see pentaho.visual.base.View#_onUpdateWill
     * @see pentaho.visual.base.View#_onUpdateDid
     * @see pentaho.visual.base.View#_onUpdateRejected
     */
    update: function() {

      var p = this.__updatingPromise;
      if(!p) {
        // Nothing to do?
        if(this.__dirtyPropGroups.isEmpty) {
          p = Promise.resolve();
        } else {
          var _resolve = null;
          var _reject = null;

          this.__updatingPromise = p = new Promise(function(resolve, reject) {
            // ignore the fulfillment value of returned promises
            _resolve = function() { resolve(); };
            _reject  = reject;
          });

          // Protect against overrides failing.
          var cancelReason;
          try {
            cancelReason = this._onUpdateWill();
          } catch(ex) { cancelReason = ex; }

          (cancelReason ? Promise.reject(cancelReason) : this.__updateLoop())
            .then(this.__onUpdateDidOuter.bind(this), this.__onUpdateRejectedOuter.bind(this))
            .then(_resolve, _reject);
        }
      }

      return p;
    },

    /**
     * Called when an update operation is going to be performed.
     *
     * The default implementation emits the [will:update]{@link pentaho.visual.base.events.WillUpdate} event.
     *
     * Either the implementation or the event listeners are allowed to cancel the update or further modify the model.
     *
     * The implementation can cancel the update by returning or throwing an error.
     *
     * @return {pentaho.lang.UserError} An error, containing the cancellation reason; or `null`.
     *
     * @protected
     *
     * @fires "will:update"
     */
    _onUpdateWill: function() {

      if(this._hasListeners(WillUpdate.type)) {

        var willUpdate = new WillUpdate(this);

        if(!this._emitSafe(willUpdate))
          return willUpdate.cancelReason;
      }

      return null;
    },

    /**
     * Performs the visualization update loop.
     *
     * On each iteration,
     * if the set of dirty property groups is empty, then the update loop ends successfully.
     *
     * Otherwise, the model is checked for validity; and, if it is not valid, the update loop is rejected.
     * If, on the other hand, the model is valid,
     * the "best" update method is selected and its completion is awaited.
     *
     * If the selected update method is rejected or throws, the update loop is rejected.
     *
     * Lastly, otherwise, another iteration of the loop is performed.
     *
     * @return {!Promise} A promise that is fulfilled when the update loop has completed successfully.
     *
     * @private
     */
    __updateLoop: function() {

      // assert !this.__dirtyPropGroups.isEmpty;

      var validationErrors = this.__validate();
      if(validationErrors)
        return Promise.reject(new UserError("View model is invalid:\n - " + validationErrors.join("\n - ")));

      // ---

      var dirtyPropGroups = this.__dirtyPropGroups;
      var updateMethodInfo = this.__selectUpdateMethod(dirtyPropGroups);

      // Assume update succeeds.
      dirtyPropGroups.clear(updateMethodInfo.mask);

      var me = this;

      return promise.wrapCall(this[updateMethodInfo.name], this)
          .then(function() {

            return dirtyPropGroups.isEmpty ? Promise.resolve() : me.__updateLoop();

          }, function(reason) {

            // Restore
            dirtyPropGroups.set(updateMethodInfo.mask);

            return Promise.reject(reason);
          });
    },

    /**
     * Validates the current state of the view.
     *
     * This method calls {@link pentaho.visual.base.Model#validate} to validate the model.
     *
     * This method exists to support unit testing.
     *
     * @return {?Array.<!pentaho.type.ValidationError>} A non-empty array of errors or `null`.
     *
     * @private
     */
    __validate: function() {
      return this.model.validate();
    },

    /**
     * Selects the best update method for a given set of dirty property groups.
     *
     * @param {!pentaho.util.BitSet} dirtyPropGroups - The set of dirty property groups.
     *
     * @return {!Object} The information object of the selected update method.
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

    /**
     * Called to continue the update operation upon successful completion of the update loop.
     *
     * @private
     *
     * @fires "did:update"
     */
    __onUpdateDidOuter: function() {

      // J.I.C.
      this.__dirtyPropGroups.clear();
      this.__updatingPromise =  null;

      // ---

      this.__callOverridableSafe("_onUpdateDid");
    },

    /**
     * Called to continue the update operation upon update cancellation or failure of the update loop.
     *
     * @param {Error} reason - The error that describes why the update failed.
     *
     * @return {!Promise} A promise that is rejected with the given `reason`.
     *
     * @private
     *
     * @fires "rejected:update"
     */
    __onUpdateRejectedOuter: function(reason) {

      this.__updatingPromise = null;

      // ---

      this.__callOverridableSafe("_onUpdateRejected", reason);

      return Promise.reject(reason);
    },

    /**
     * Called when an update operation has been performed with success.
     *
     * The [isUpdating]{@link pentaho.visual.base.View#isUpdating} property will now have value `false`.
     * The [isDirty]{@link pentaho.visual.base.View#isDirty} property will also have value `false`.
     *
     * The default implementation emits the [did:update]{@link pentaho.visual.base.events.DidUpdate} event.
     *
     * The implementation or the event listeners are allowed to modify the model and thus possibly
     * start **new** updates from the _did_ phase.
     *
     * If an implementation throws an error, the error is logged and
     * the update operation is still considered successful.
     *
     * @protected
     *
     * @fires "did:update"
     */
    _onUpdateDid: function() {

      if(this._hasListeners(DidUpdate.type))
        this._emitSafe(new DidUpdate(this));
    },

    /**
     * Called when an update operation has been canceled or has failed.
     *
     * The [isUpdating]{@link pentaho.visual.base.View#isUpdating} property will now have value `false`.
     * The [isDirty]{@link pentaho.visual.base.View#isDirty} property **may** have value `true`.
     *
     * The default implementation emits the [rejected:update]{@link pentaho.visual.base.events.RejectedUpdate} event.
     *
     * The implementation or the event listeners are allowed to modify the model and thus possibly
     * start **new** updates from the _rejected_ phase.
     *
     * If an implementation throws an error, the error is logged and
     * the update operation is still rejected with the original error.
     *
     * @param {Error} reason - The reason why the update operation was canceled or has failed.
     *
     * @protected
     *
     * @fires "rejected:update"
     */
    _onUpdateRejected: function(reason) {

      if(this._hasListeners(RejectedUpdate.type))
        this._emitSafe(new RejectedUpdate(this, reason));
    },

    // endregion

    /**
     * Disposes the view by freeing external resources held by the view.
     *
     * The default implementation clears the container DOM element and unregisters from model events.
     *
     * If an implementation has additional properties containing DOM nodes,
     * then it **must** override this method (and call base) and set these to `null`,
     * so that memory-leaks are not caused.
     */
    dispose: function() {

      this.__domContainer = null;

      var h = this.__changeDidHandle;
      if(h) {
        h.dispose();
        this.__changeDidHandle = null;
      }
    },

    // see Base.js
    extend: function(source, keyArgs) {

      this.base(source, keyArgs);

      if(source) {
        var Subclass = this.constructor;

        O.eachOwn(source, function(v, methodName) {
          var m;
          if(F.is(v) && (m = _reUpdateMethodName.exec(methodName))) {

            var methodCleansBits = parsePropertyGroupsText(Subclass, m[1]);
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
        });
      }

      return this;
    },

    /**
     * Calls an overridable method and swallows and logs an error it throws.
     *
     * @param {string} methodName - The name of the overridable method to call.
     * @param {...any} args - The arguments to pass to the method.
     *
     * @return {any} The value returned by the method; or `undefined`, if it throws an error.
     *
     * @private
     */
    __callOverridableSafe: function(methodName) {
      var args = arg.slice(arguments, 1);
      try {
        return this[methodName].apply(this, args);
      } catch(ex) {
        logger.error("Exception thrown by 'View#" + methodName + "' override:" + ex + "\n" + ex.stack);
      }
    }
  }, /** @lends pentaho.visual.base.View */{
    /**
     * Creates a view for the given model, of the registered default type, if any.
     *
     * If no default view type is registered
     * for the given model type,
     * or for any of its base model types,
     * the returned promise is rejected.
     *
     * @param {!DOMElement} domContainer - The container element.
     * @param {!pentaho.visual.base.Model} model - The visual model.
     * @param {...any} other - Other arguments to pass to the registered view constructor.
     *
     * @return {!Promise.<pentaho.visual.base.View>} A promise for a view of the given model.
     *
     * @rejects {pentaho.lang.ArgumentRequiredError} When `model` is not specified.
     * @rejects {Error} When there is not a registered default view class for the type of `model`.
     */
    createAsync: function(domContainer, model) {
      if(!domContainer) return Promise.reject(error.argRequired("domContainer"));
      if(!model) return Promise.reject(error.argRequired("model"));

      var args = arg.slice(arguments);

      return View.getAsync(model.type)
          .then(function(ViewClass) {
            return O.make(ViewClass, args);
          });
    },

    /**
     * Gets a promise for the view class (constructor), of the registered default type, if any,
     * for the given model type.
     *
     * If no default view type is registered
     * for the given model type,
     * or for any of its base model types,
     * the returned promise is rejected.
     *
     * @param {!pentaho.visual.base.Model.Type} modelType - The visual model type.
     * @return {!Promise.<Class.<pentaho.visual.base.View>>} A promise for a view class of the given model type.
     *
     * @rejects {pentaho.lang.ArgumentRequiredError} When `modelType` is not specified.
     * @rejects {Error} When there is not a registered default view class for `modelType`.
     */
    getAsync: function(modelType) {
      if(!modelType) return Promise.reject(error.argRequired("modelType"));

      var promise = modelType.defaultViewClass;
      if(!promise) return Promise.reject(new Error("No registered default view class."));
      return promise;
    },

    // see Base.js
    _subclassed: function(Subclass, instSpec, classSpec, keyArgs) {

      // "Inherit" PropertyGroups, __PropertyGroupOfProperty, __UpdateMethods and __UpdateMethodsList properties
      Subclass.PropertyGroups            = Object.create(this.PropertyGroups);
      Subclass.__PropertyGroupOfProperty = Object.create(this.__PropertyGroupOfProperty);
      Subclass.__UpdateMethods           = Object.create(this.__UpdateMethods);
      Subclass.__UpdateMethodsList       = this.__UpdateMethodsList.slice();

      this.base(Subclass, instSpec, classSpec, keyArgs);
    },

    PropertyGroups: O.assignOwn(Object.create(null),
      /**
       * The `PropertyGroups` enumeration contains the entries for the distinct groups of properties that the
       * base [View]{@link pentaho.visual.base.View} class recognizes when categorizing model changes.
       *
       * @alias pentaho.visual.base.View.PropertyGroups
       * @enum {number}
       * @readOnly
       *
       * @see pentaho.visual.base.View#_onChangeDid
       */
      {
        /**
         * Includes all properties.
         */
        All: ~0,

        /**
         * The group of properties whose changes are ignored,
         * because the view does not visually represent these in any way.
         *
         * By default, the only property of this group is
         * the [selectionMode]{@link pentaho.visual.base.Model#selectionMode} property.
         */
        Ignored: 0,

        /**
         * The group of properties that don't have an associated property group.
         */
        General: 1,

        /**
         * The group of data-related properties.
         *
         * By default, the only property of this group is
         * [data]{@link pentaho.visual.base.Model#data} property.
         */
        Data: 2,

        /**
         * The group of size-related properties.
         *
         * By default, the properties of this group are
         * the [width]{@link pentaho.visual.base.Model#width} and
         * [height]{@link pentaho.visual.base.Model#height} properties.
         */
        Size: 4,

        /**
         * The group of selection-related properties.
         *
         * By default, the only property of this group is
         * the [selectionFilter]{@link pentaho.visual.base.Model#selectionFilter} property.
         */
        Selection:  8
      }),

    __PropertyGroupOfProperty: O.assignOwn(Object.create(null), {
      "selectionMode":   "Ignored",
      "data":            "Data",
      "width":           "Size",
      "height":          "Size",
      "selectionFilter": "Selection"
    }),

    // bits -> {name: , mask: }
    __UpdateMethods: Object.create(null),

    // [{name: , mask: }, ...]
    __UpdateMethodsList: []
  })
  .implement(EventSource)
  .implement(/** @lends pentaho.visual.base.View# */{
    // region _updateXyz Methods
    /**
     * Fully renders or updates the view.
     *
     * The first update of a visualization is always a full update.
     *
     * The default implementation does nothing.
     * Implementations **should** override this method and implement a complete rendering of the visualization.
     *
     * Besides implementing this method,
     * implementations should consider implementing one or more of the optional
     * **partial update methods**, like
     * [_updateData]{@link pentaho.visual.base.View#_updateData},
     * [_updateSize]{@link pentaho.visual.base.View#_updateSize},
     * [_updateSelection]{@link pentaho.visual.base.View#_updateSelection} and
     * [_updateGeneral]{@link pentaho.visual.base.View#_updateGeneral}.
     *
     * Other appropriate combinations of these can also be implemented, like,
     * for example, `_updateSizeAndSelection`,
     * by combining the names of the known property groups: `Data`, `Size`, `Selection` and `General`,
     * with an `And` to form a corresponding method name.
     * For more information on property groups,
     * see [View.PropertyGroups]{@link pentaho.visual.base.View.PropertyGroups}.
     *
     * The [update]{@link pentaho.visual.base.View#update} operation
     * selects the `best fit` partial methods to actually update the view.
     *
     * @protected
     *
     * @see pentaho.visual.base.View#update
     * @see pentaho.visual.base.View.PropertyGroups
     * @see pentaho.visual.base.View#_onChangeDid
     */
    _updateAll: function() {
    }

    /**
     * Updates the view, taking into account that
     * only the dimensions of the view have changed.
     *
     * This is an **optional** method - there is no base implementation.
     *
     * Implement this method to provide a faster way to resize a view.
     * When not specified, and no other applicable partial update method exists,
     * the full [_updateAll]{@link pentaho.visual.base.View#_updateAll} method is used to update the view.
     *
     * @name _updateSize
     * @memberOf pentaho.visual.base.View#
     * @method
     * @protected
     * @optional
     * @see pentaho.visual.base.View#_updateAll
     */

    /**
     * Updates the view, taking into account that
     * only the selection-related model properties have changed.
     *
     * This is an **optional** method - there is no base implementation.
     *
     * Implement this method to provide a faster way to update the selection of the view.
     * When not specified, and no other applicable partial update method exists,
     * the view is updated using the [_updateAll]{@link pentaho.visual.base.View#_updateAll} method.
     *
     * @name _updateSelection
     * @memberOf pentaho.visual.base.View#
     * @method
     * @protected
     * @optional
     * @see pentaho.visual.base.View#_updateAll
     */

    /**
     * Updates the view, taking into account that
     * only the data-related model properties have changed.
     *
     * This is an **optional** method - there is no base implementation.
     *
     * Implement this method to provide a faster way to update the data displayed by the view.
     * When not specified, and no other applicable partial update method exists,
     * the view is updated using the [_updateAll]{@link pentaho.visual.base.View#_updateAll} method.
     *
     * @name _updateData
     * @memberOf pentaho.visual.base.View#
     * @method
     * @protected
     * @optional
     * @see pentaho.visual.base.View#_updateAll
     */

    /**
     * Updates the view, taking into account that
     * only "general" model properties have changed.
     *
     * This is an **optional** method - there is no base implementation.
     *
     * Implement this method to provide a faster way to update the "general information" displayed by the view.
     * When not specified, and no other applicable partial update method exists,
     * the view is updated using the [_updateAll]{@link pentaho.visual.base.View#_updateAll} method.
     *
     * @name _updateGeneral
     * @memberOf pentaho.visual.base.View#
     * @method
     * @protected
     * @optional
     * @see pentaho.visual.base.View#_updateAll
     */
    // endregion
  })
  .implement(/** @lends pentaho.visual.base.View# */{

    /**
     * Gets the state of the view as a plain object.
     *
     * @return {object}
     */
    toJSON: function() {
      return this.__state || null;
    },

    /**
     * Gets the state of the view.
     *
     * @return {object}
     */
    getState: function() {
      return this.toJSON();
    }
  });

  /**
   * Parses the custom part of the name of partial update method (like *_updateXyz*).
   *
   * @param {Class.<View>} ViewClass - The view class.
   * @param {string} groupNamesText - The part of the method name following the prefix "_update".
   *
   * @return {number} The property group bits corresponding to the method name.
   */
  function parsePropertyGroupsText(ViewClass, groupNamesText) {

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

  return View;
});

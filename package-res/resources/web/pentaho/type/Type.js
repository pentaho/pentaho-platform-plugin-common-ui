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
  "../i18n!types",
  "../lang/Base",
  "../lang/_AnnotatableLinked",
  "../util/error",
  "../util/arg",
  "../util/object",
  "../util/promise"
], function(bundle, Base, AnnotatableLinked, error, arg, O, promiseUtil) {
  "use strict";

  // Unique type class id exposed through Type#uid and used by Context instances.
  var _nextUid = 1,
      _type = null,
      O_isProtoOf = Object.prototype.isPrototypeOf;

  /**
   * @name pentaho.type.Type
   * @class
   *
   * @classDesc The base **type class** of the types of the Pentaho Client Metadata Model.
   *
   * For additional information, see the class of _instances_, {@link pentaho.type.Instance}.
   *
   * @description _Initializes_ the type's singleton object.
   * @param {Object} instSpec The specification of this type.
   * @param {!Object} keyArgs Keyword arguments.
   * @param {!pentaho.type.Instance} keyArgs.instance The _prototype_ of the `Instance` class associated with
   * this type.
   * @param {boolean} [keyArgs.isRoot=false] Indicates if the type is a _root_ type.
   *
   */
  var Type = Base.extend("pentaho.type.Type", /** @lends pentaho.type.Type# */{

    constructor: function(instSpec, keyArgs) {
      if(!instSpec) instSpec = {};

      this._init(instSpec, keyArgs);

      this.extend(instSpec);

      this._postInit(instSpec, keyArgs);
    },

    /**
     * Performs initialization tasks that take place before the instance is extended with its specification.
     *
     * This method is typically overridden to block the inheritance of certain attributes.
     *
     * @param {!Object} instSpec The specification of this type.
     * @param {!Object} keyArgs Keyword arguments.
     * @param {!pentaho.type.Instance} keyArgs.instance The _prototype_ of the `Instance` class associated with
     * this type.
     * @param {boolean} [keyArgs.isRoot=false] If `true`, creates a _root_ type.
     * @protected
     * @overridable
     */
    _init: function(instSpec, keyArgs) {

      O.setConst(this, "uid", _nextUid++);

      // Bind
      var instance = arg.required(keyArgs, "instance", "keyArgs");
      O.setConst(instance, "_type", this);
      O.setConst(this, "_instance", instance);

      if(arg.optional(keyArgs, "isRoot"))
        O.setConst(this, "root", this);

      // Block inheritance, with default values
      this._id         = null;
      this._styleClass = null;
      this._hasDescendants = false;
    },

    /**
     * Performs initialization tasks that take place after the instance is extended with its specification.
     *
     * This method is typically overridden to validate the values of the attributes.
     *
     * The default implementation does nothing.
     *
     * @param {!Object} instSpec The specification of this type.
     * @param {!Object} keyArgs Keyword arguments.
     * @protected
     * @overridable
     */
    _postInit: function(instSpec, keyArgs) {
    },

    //region uid property
    /**
     * Gets the unique id of this type.
     *
     * Unique type ids are auto-generated, in each session.
     *
     * Note that even anonymous types -
     * those whose {@link pentaho.type.Type#id} is `null` -
     * have an unique-id.
     *
     * This attribute is _not_ inherited.
     *
     * @type number
     * @readonly
     */
    uid: -1, // set in _init
    //endregion

    //region context property
    /**
     * Gets the context where this type is defined.
     *
     * @name context
     * @memberOf pentaho.type.Type#
     * @type pentaho.type.Context
     * @readonly
     * @abstract
     */
    //endregion

    //region root property
    // `root` is generally set on direct sub-classes of Instance.
    // Should be the first meaningful, non-abstract instance class below `Instance` along a given branch.
    /**
     * Gets the root type of this type hierarchy.
     *
     * Even though the ultimate type root of types defined in this
     * system is [Instance]{@link pentaho.type.Instance},
     * the system is designed to represent multiple type hierarchies,
     * each representing concrete, more meaningful concepts.
     *
     * When deriving a type from `Instance`,
     * it can be marked as the _root_ of a type hierarchy,
     * by specifying the `isRoot` keyword argument to `extend`.
     *
     * Typically, root types are immediate subtypes of `Instance`.
     * However, this is not enforced and it is up to the developer to decide
     * at what level a practical, meaningful type root arises.
     *
     * For example, [Value]{@link pentaho.type.Value} is the root of _value_ types.
     * However, [Property]{@link pentaho.type.Property},
     * also an immediate subtype of `Instance`,
     * is not considered a root type.
     * It is the immediate subtypes of `Property` -
     * each root property within a complex type -
     * which are considered roots.
     * This aligns with users expectations of what an attribute named `root`
     * in a property type should mean.
     *
     * @name root
     * @memberOf pentaho.type.Type#
     * @type pentaho.type.Type
     * @readonly
     * @see pentaho.type.Type#isRoot
     * @see pentaho.type.Type#ancestor
     */

    /**
     * Gets a value that indicates if this type is the root of its type hierarchy.
     *
     * @type boolean
     *
     * @readonly
     *
     * @see pentaho.type.Type#root
     */
    get isRoot() {
      return this === this.root;
    },
    //endregion

    //region ancestor property
    /**
     * Gets the parent type in the current type hierarchy, if any, or `null`.
     *
     * The root type returns `null`.
     *
     * @type ?pentaho.type.Type
     * @readonly
     * @see pentaho.type.Type#root
     * @see pentaho.type.Type#hasDescendants
     */
    get ancestor() {
      return this.isRoot ? null : Object.getPrototypeOf(this);
    },
    //endregion

    //region hasDescendants property
    /**
     * Gets a value that indicates if this type has any descendant types.
     *
     * @type {boolean}
     * @readonly
     * @see pentaho.type.Type#ancestor
     */
    get hasDescendants() {
      return this._hasDescendants;
    },
    //endregion

    //region instance property
    /**
     * Gets the _prototype_ of the instances of this type.
     *
     * @type pentaho.type.Instance
     * @readOnly
     */
    get instance() {
      return this._instance;
    },

    // Supports Instance configuration only, from the type side.
    // To be used in type specifications, to change the instance side.
    // Not documented on purpose.
    set instance(config) {
      // Class.implement essentially just calls Class#extend.
      if(config) this.instance.extend(config);
    }, //jshint -W078
    //endregion
    //endregion

    //region id property

    // -> nonEmptyString, Optional(null), Immutable, Shared (note: not Inherited)
    // "" -> null conversion

    _id: null,

    /**
     * Gets the id of this type.
     *
     * Can only be specified when extending a type.
     *
     * The id only exists for types which have an associated AMD/RequireJS module.
     * However, note that all have a {@link pentaho.type.Type#uid}.
     *
     * This attribute is not inherited.
     *
     * @type {?nonEmptyString}
     * @readonly
     */
    get id() {
      return this._id;
    },

    set id(value) {
      // Can only be set once or throws.
      O.setConst(this, "_id", nonEmptyString(value));
    },

    _buildRelativeId: function(value) {
      // A module id.
      // Unless it starts with a "/", it's relative to this Type#id.
      // Relative:
      //   View
      //   ./View
      // Absolute:
      //   foo.js
      //   /View
      //   http:
      if(!/(^\w+:)|(^\/)|(\.js$)/.test(value)) {
        // Considered relative.
        // Also works well if the value has ./ or ../
        var id = this.id;
        value = (id ? (id + "/") : "") + value;
      }

      return value;
    },
    //endregion

    //region label property
    // must have some non-null value to inherit
    _label: "instance",

    /**
     * Gets or sets the label of this type.
     *
     * When set to a non-{@link Nully} and non-{@link String} value,
     * the value is first replaced by the result of calling its `toString` method.
     *
     * When set to an empty string or a _nully_ value, the attribute value is _reset_.
     *
     * When reset, the attribute assumes its _default value_
     * (except on the top-root type, `Instance.type`, in which case it has no effect).
     *
     * The _default value_ is the _inherited value_.
     *
     * The _initial value_ of the attribute on the top-root type is `"instance"`.
     *
     * @type {!nonEmptyString}
     */
    get label() {
      return this._label;
    },

    set label(value) {
      value = nonEmptyString(value);
      if(value === null) {
        this._resetLabel();
      } else {
        this._label = value;
      }
    },

    _resetLabel: function() {
      if(this !== _type) {
        delete this._label;
      }
    },
    //endregion

    //region description property

    // -> nonEmptyString, Optional, Inherited, Configurable, Localized
    // "" -> null conversion

    _description: null, // set through implement bundle, below

    /**
     * Gets or sets the description of this type.
     *
     * Attempting to set to a non-string value type implicitly converts the value to a string before assignment.
     *
     * Setting to `undefined` causes this attribute to use the inherited value,
     * except for the root type, `Instance.type` (which has no ancestor), where this attribute is `null`.
     *
     * Setting to `null` or to an empty string clears the attribute and sets it to `null`, ignoring any inherited value.
     *
     * @type {?nonEmptyString}
     */
    get description() {
      return this._description;
    },

    set description(value) {
      if(value === undefined) {
        this._resetDescription();
      } else {
        this._description = nonEmptyString(value);
      }
    },

    _resetDescription: function() {
      if(this !== _type) {
        delete this._description;
      }
    },
    //endregion

    //region category property

    // -> nonEmptyString, Optional, Inherited, Configurable, Localized
    // "" -> null conversion

    _category: null,

    /**
     * Gets or sets the category associated with this type.
     *
     * The category is used primarily to group similar types (or instances of) in a user interface.
     *
     * Attempting to set to a non-string value type implicitly
     * converts the value to a string before assignment.
     *
     * Setting to `undefined` causes this attribute to use the inherited value,
     * except for the root type, `Instance.type` (which has no ancestor), where the attribute is `null`.
     *
     * Setting to `null` or to an empty string clears the attribute and sets it to `null`,
     * thus ignoring any inherited value.
     *
     * @type {?nonEmptyString}
     * @see pentaho.type.Type#isBrowsable
     * @see pentaho.type.Type#ordinal
     */
    get category() {
      return this._category;
    },

    set category(value) {
      if(value === undefined) {
        this._resetCategory();
      } else {
        this._category = nonEmptyString(value);
      }
    },

    _resetCategory: function() {
      if(this !== _type) {
        delete this._category;
      }
    },
    //endregion

    //region helpUrl property

    // -> nonEmptyString, Optional, Inherited, Configurable, Localized?
    // "" -> null conversion

    _helpUrl: null,

    /**
     * Gets or sets an URL pointing to documentation associated with this type.
     *
     * Attempting to set to a non-string value type implicitly
     * converts the value to a string before assignment.
     *
     * Setting to `undefined` causes this attribute to use the inherited value,
     * except for the root type, `Instance.type` (which has no ancestor), where the attribute is `null`.
     *
     * Setting to `null` or to an empty string clears the attribute and sets it to `null`,
     * ignoring any inherited value.
     *
     * @type {?nonEmptyString}
     */
    get helpUrl() {
      return this._helpUrl;
    },

    set helpUrl(value) {
      if(value === undefined) {
        this._resetHelpUrl();
      } else {
        this._helpUrl = nonEmptyString(value);
      }
    },

    _resetHelpUrl: function() {
      if(this !== _type) {
        delete this._helpUrl;
      }
    },
    //endregion

    //region isBrowsable property
    // @type boolean
    // -> boolean, Optional(true), Inherited, Configurable
    // undefined or null -> resets

    _isBrowsable: true,

    /**
     * Gets or sets the `isBrowsable` attribute of this type.
     *
     * Browsable types are exposed to the end user.
     * Set this attribute to `false` to prevent exposing the type in a user interface.
     *
     * Setting to a {@link Nully} value causes this attribute to use the inherited value,
     * except for the root type, `Instance.type` (which has no ancestor), where the attribute is `true`.
     *
     * @type {boolean}
     */
    get isBrowsable() {
      return this._isBrowsable;
    },

    set isBrowsable(value) {
      if(value == null) {
        this._resetIsBrowsable();
      } else {
        this._isBrowsable = !!value;
      }
    },

    _resetIsBrowsable: function() {
      if(this !== _type) {
        delete this._isBrowsable;
      }
    },
    //endregion

    //region isAdvanced property
    // @type boolean
    // -> boolean, Optional(false), Inherited, Configurable
    // null || undefined -> reset
    _isAdvanced: false,

    /**
     * Gets or sets the `isAdvanced` attribute of this type.
     *
     * Types with `isAdvanced` attributes set to `false` are typically immediately accessible to the user.
     * An advanced type typically escapes the expected flow of utilization, yet it is
     * sufficiently relevant to be shown in a user interface.
     *
     * Setting to a {@link Nully} value causes this attribute to use the inherited value,
     * except for the root type, `Instance.type` (which has no ancestor), where the attribute is `false`.
     *
     * @type {boolean}
     * @see pentaho.type.Type#isBrowsable
     */
    get isAdvanced() {
      return this._isAdvanced;
    },

    set isAdvanced(value) {
      if(value == null) {
        this._resetIsAdvanced();
      } else {
        this._isAdvanced = !!value;
      }
    },

    _resetIsAdvanced: function() {
      if(this !== _type) {
        delete this._isAdvanced;
      }
    },
    //endregion

    //region styleClass property
    // @type nonEmptyString
    // -> nonEmptyString, Optional(null), Configurable, Localized
    // "" or undefined -> null conversion

    _styleClass: null,

    /**
     * Gets or sets the CSS class associated with this type.
     *
     * This attribute is typically used to associate an icon with a type.
     *
     * @type {nonEmptyString}
     */
    get styleClass() {
      return this._styleClass;
    },

    set styleClass(value) {
      // undefined or "" -> null conversion
      this._styleClass = nonEmptyString(value);
    },

    // TODO: implement inheritedStyleClasses
    /**
     * Gets the style classes of this and any base types.
     *
     * @type string[]
     * @readonly
     */
    get inheritedStyleClasses() {
      throw error.notImplemented("Implement me!");
    },
    //endregion

    //region ordinal property
    // @type integer
    // -> Optional(0), Inherited, Configurable
    _ordinal: 0,

    /**
     * Gets or sets the ordinal associated with this type.
     *
     * The ordinal is used to disambiguate the order with which a type (or an instance of it)
     * is shown in a user interface.
     *
     * Setting to a {@link Nully} value causes this attribute to use the inherited value,
     * except for the root type, `Instance.type` (which has no ancestor), where the attribute is `0`.
     *
     * @type {number}
     * @see pentaho.type.Type#isBrowsable
     * @see pentaho.type.Type#category
     */
    get ordinal() {
      return this._ordinal;
    },

    set ordinal(value) {
      if(value == null) {
        this._resetOrdinal();
      } else {
        this._ordinal = Math.floor((+value) || 0);
      }
    },

    _resetOrdinal: function() {
      if(this !== _type) {
        delete this._ordinal;
      }
    },
    //endregion

    //region view property

    // -> nonEmptyString, Optional, Inherited, Configurable, Localized
    // undefined -> inherit
    // null -> clear
    // "" -> null conversion

    _view: null, // {value: any, promise: Promise.<Class.<View>>}

   /**
    * Gets or sets the default view for instances of this type.
    *
    * When a string,
    * it is the id of the view's AMD module.
    * If the string starts with `/` or `xyz:`, or ends with `.js`,
    * the id is considered to be absolute,
    * otherwise,
    * it is relative to this type's id folder, and converted to an absolute id.
    *
    * Setting to `undefined` causes the view to be inherited from the ancestor type,
    * except for the root type, `Instance.type` (which has no ancestor), where the attribute is `null`.
    *
    * Setting to a _falsy_ value (like `null` or an empty string),
    * clears the value of the attribute and sets it to `null`, ignoring any inherited value.
    *
    * When a function,
    * it is the class or factory of the view.
    *
    * @see pentaho.type.Type#viewClass
    *
    * @type {string | function}

    * @throws {pentaho.lang.ArgumentInvalidTypeError} When the set value is not
    * a string, a function or {@link Nully}.
    */
    get view() {
      return this._view && this._view.value;
    },

    set view(value) {
      if(value === undefined) {
        this._resetView();
      } else if(!value) { // null || ""
        this._view = null;
      } else  if(typeof value === "string") {
        value = this._buildRelativeId(value);
        if(!this._view || this._view.value !== value) {
          this._view = {value: value, promise: null};
        }
      } else if(typeof value === "function") {
        // Assume it is the View class itself, already fulfilled.
        if(!this._view || this._view.value !== value) {
          this._view = {value: value, promise: Promise.resolve(value)};
        }
      } else {
        throw error.argInvalidType("view", ["nully", "string", "function"], typeof value);
      }
    },

    _resetView: function() {
      if(this !== _type) {
        delete this._view;
      }
    },

    /**
     * Gets a promise for the default view class or factory, if any, or `null`.
     *
     * A default view exists if property {@link pentaho.type.Type#view}
     * has a non-null value.
     *
     * @type Promise.<?function>
     * @readOnly
     * @see pentaho.type.Type#view
     */
    get viewClass() {
      /*jshint laxbreak:true*/
      var view = this._view;
      return view
          ? (view.promise || (view.promise = promiseUtil.require(view.value)))
          : Promise.resolve(null);
    },
    //endregion

    /**
     * Creates a subtype of this one.
     *
     * This method creates a type which does not have an own constructor.
     * The base type's constructor is used to _initialize_ the type.
     *
     * Do not use this method directly.
     * Use {@link pentaho.type.Instance#extendProto} instead.
     *
     * @param {object} instSpec The type specification.
     * @param {object} keyArgs Keyword arguments.
     * @param {pentaho.type.Instance} keyArgs.instance The prototype of instances of the type.
     *
     * @return {pentaho.type.Type} The new type.
     * @ignore
     */
    _extendProto: function(instSpec, keyArgs) {

      O.setConst(this, "_hasDescendants", true);

      var subType = Object.create(this);

      // NOTE: `subType.constructor` is still the "base" constructor.
      subType.constructor(instSpec, keyArgs);

      return subType;
    },

    // TODO: Now that Property instances are never created,
    // only types with constructors get created.
    /**
     * Creates an instance of this type, given the construction arguments.
     *
     * @param {...any} args The construction arguments.
     * @return {pentaho.type.Instance} The created instance.
     */
    create: function() {
      var inst = Object.create(this.instance);
      inst.constructor.apply(inst, arguments);
      return inst;
    },

    /**
     * Determines if a value is an instance of this type.
     *
     * @param {?any} value The value to test.
     * @return {boolean} `true` if the value is an instance of this type, `false` otherwise.
     */
    is: function(value) {
      return O_isProtoOf.call(this.instance, value);
    },

    /**
     * Determines if this is a subtype of another.
     *
     * A type is considered a subtype of itself.
     *
     * @param {?pentaho.type.Type} superType The candidate super-type.
     * @return {boolean} `true` if this is a subtype of `superType` type, `false` otherwise.
     */
    isSubtypeOf: function(superType) {
      return !!superType && (superType === this || O_isProtoOf.call(superType, this));
    },

    // TODO: is conversion always successful? If so, should it be?
    /**
     * Converts a value to an instance of this type,
     * if it is not one already.
     *
     * If a {@link Nully} value is specified, `null` is returned.
     *
     * Otherwise, if a given value is not already an instance of this type
     * (checked using [is]{@link pentaho.type.Type#is}),
     * this method delegates the creation of an instance to
     * [create]{@link pentaho.type.Type#create}.
     *
     * @param {?any} value The value to convert.
     * @return {?pentaho.type.Instance} The converted value or `null`.
     */
    to: function(value) {
      return value == null   ? null  :
             this.is(value)  ? value :
             this.create(value);
    },

    toSpec: function() {
      return {id: this.id};
    },

    toReference: function() {
      return this.id;
    }
  }, /** @lends pentaho.type.Type */{

    //@override
    /**
     * See Base.js
     * @ignore
     */
    _subclassed: function(SubTypeCtor, instSpec, classSpec, keyArgs) {

      O.setConst(this.prototype, "_hasDescendants", true);

      var SubInstCtor = keyArgs.instance.constructor;

      // Links SubTypeCtor and SubInstCtor and "implements" instSpec.
      SubTypeCtor._initInstCtor(SubInstCtor, instSpec, keyArgs);

      // Implement the given static interface.
      if(classSpec) SubTypeCtor.implementStatic(classSpec);
    },

    // Links TypeCtor (this) and the given InstCtor together and
    // applies the TypeCtor constructor to its own prototype, as a way to initialize it.
    // The constructor receives `instSpec` and ends up extending the prototype with it.
    // The static interface is not touched.
    //
    // NOTE: optionally receiving `keyArgs` as an optimization.
    // `_subclassed` is given a _derived_ `keyArgs`
    // that can/should be passed to `this`(constructor).
    _initInstCtor: function(InstCtor, instSpec, keyArgs) {

      O.setConst(InstCtor, "Type", this);

      this.call(this.prototype, instSpec, keyArgs || {instance: InstCtor.prototype});
    }
  })
  .implement(AnnotatableLinked);

  _type = Type.prototype;

  return Type;

  function nonEmptyString(value) {
    return value == null ? null : (String(value) || null);
  }
});

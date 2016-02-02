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
  "../i18n!types",
  "../lang/Base",
  "../lang/_AnnotatableLinked",
  "../util/error",
  "../util/arg",
  "../util/fun",
  "../util/object",
  "../util/promise"
], function(bundle, Base, AnnotatableLinked, error, arg, fun, O, promise) {

  "use strict";

  // Unique item class id exposed through Item.Meta#uid and used by Context instances.
  var _nextUid = 1,
      _itemMeta = null,
      O_isProtoOf = Object.prototype.isPrototypeOf;

  /**
   * @name pentaho.type.Item.Meta
   * @class
   *
   * @classDesc The base **type metadata class** of types in the Pentaho Client Metadata Model.
   *
   * For more information see {@link pentaho.type.Item}.
   *
   * @description _Initializes_ the type's singleton metadata object.
   * @param {Object} instSpec The specification of this type.
   * @param {!Object} keyArgs Keyword arguments.
   * @param {!pentaho.type.Item} keyArgs.mesa _Prototype_ of the class used for representing the data of this type.
   * @param {boolean} [keyArgs.isRoot=false] If `true`, creates a _root_ type.
   *
   */
  var ItemMeta = Base.extend("pentaho.type.Item.Meta",
      /** @lends pentaho.type.Item.Meta# */{

    constructor: function(instSpec, keyArgs) {
      if(!instSpec) instSpec = {};

      this._init(instSpec, keyArgs);

      this.extend(instSpec);

      this._postInit(instSpec, keyArgs);
    },

    /**
     * Performs initialization tasks that take place before the instance is
     * extended with its spec.
     *
     * This method is typically overridden to block inheritance of attributes.
     *
     * @param {Object} instSpec The specification of this type.
     * @param {!Object} keyArgs Keyword arguments.
     * @param {!pentaho.type.Item} keyArgs.mesa _Prototype_ of the class used for representing the data of this type.
     * @param {boolean} [keyArgs.isRoot=false] If `true`, creates a _root_ type.
     * @protected
     * @overridable
     */
    _init: function(instSpec, keyArgs) {
      O.setConst(this, "_uid", _nextUid++);

      // Bind
      var mesa = arg.required(keyArgs, "mesa", "keyArgs");
      O.setConst(mesa, "_meta", this);
      O.setConst(this, "mesa",  mesa);

      if(arg.optional(keyArgs, "isRoot"))
        O.setConst(this, "root", this);

      // Block inheritance, with default values
      this._id         = null;
      this._styleClass = null;
    },

    /**
     * Performs initialization tasks that take place after the instance is
     * extended with its spec.
     *
     * This method is typically overridden to validate the values of the attributes.
     * The default implementation does nothing.
     *
     * @param {Object} instSpec The specification of this type.
     * @param {Object} keyArgs Keyword arguments.
     * @protected
     * @overridable
     */
    _postInit: function(instSpec, keyArgs) {
    },

    //region uid property
    _uid: null,

    /**
     * Gets the unique id of this type
     *
     * Unique type ids are auto-generated, in each session.
     *
     * Note that even anonymous types -
     * those whose {@link pentaho.type.Item.Meta#id} is `null` -
     * have an unique-id.
     *
     * This attribute is _not_ inherited.
     *
     * @type number
     * @readonly
     */
    get uid() {
      return this._uid;
    },
    //endregion

    //region context property
    /**
     * Gets the context where this type is defined.
     *
     * @name context
     * @memberOf pentaho.type.Item.Meta#
     * @type pentaho.type.IContext
     * @readonly
     * @abstract
     */
    //endregion

    //region root property
    // `root` is generally set on direct sub-classes of Item.
    // Should be the first meaningful, non-abstract item class below `Item` along a given branch.
    /**
     * Gets the root type of this type hierarchy.
     *
     * Even though the ultimate type root of types defined in this
     * system is [Item]{@link pentaho.type.Item},
     * the system is designed to represent multiple type hierarchies,
     * each representing concrete, more meaningful concepts.
     *
     * When deriving a type from `Item`,
     * it can be marked as the _root_ of a type hierarchy,
     * by specifying the `isRoot` keyword argument to `extend`.
     *
     * Typically, root types are immediate subtypes of `Item`.
     * However, this is not enforced and it is up to the developer to decide
     * at what level a practical, meaningful type root arises.
     *
     * For example, [Value]{@link pentaho.type.Value} is the root of _value_ types.
     * However, [Property]{@link pentaho.type.Property},
     * also an immediate subtype of `Item`,
     * is not considered a root type.
     * It is the immediate subtypes of `Property` -
     * each root property within a complex type -
     * which are considered roots.
     * This aligns with users expectations of what an attribute named `root`
     * in a property type should mean.
     *
     * @name root
     * @memberOf pentaho.type.Item.Meta#
     * @type pentaho.type.Item.Meta
     * @readonly
     * @see pentaho.type.Item.Meta#isRoot
     * @see pentaho.type.Item.Meta#ancestor
     */

    /**
     * Gets a value that indicates if this type is the root of its type hierarchy.
     *
     * @type boolean
     *
     * @readonly
     *
     * @see pentaho.type.Item.Meta#root
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
     * @type ?pentaho.type.Item.Meta
     * @readonly
     * @see pentaho.type.Item.Meta#root
     */
    get ancestor() {
      return this.isRoot ? null : Object.getPrototypeOf(this);
    },
    //endregion

    //region mesa property
    // Set on `Item._extend`
    /**
     * Gets the _prototype_ of the instances of this type.
     *
     * If you're wondering were the word "mesa" comes from,
     * it is a Greek word which is opposite to "meta".
     * See more information
     * [here]{@link http://www.gwiznlp.com/wp-content/uploads/2014/08/Whats-the-opposite-of-meta.pdf}.
     *
     * @name mesa
     * @memberOf pentaho.type.Item.Meta#
     * @type pentaho.type.Item
     * @readonly
     * @see pentaho.type.Item#meta
     */
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
     * However, note that all have a {@link pentaho.type.Item.Meta#uid}.
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
      // Unless it starts with a "/", it's relative to this Meta#id.
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
    // @type !nonEmptyString
    // -> nonEmptyString, Optional, Inherited, Configurable, Localized
    // null or "" -> undefined conversion

    _label: null,

    /**
     * Gets or sets the label of this type.
     *
     * Attempting to set to a non-string value type implicitly converts the value to a string before assignment.
     *
     * Setting to an empty string
     * or to a {@link Nully} value causes the attribute to use the inherited value,
     * except for the root type _Item_ (which has no ancestor), where the label is `null`.
     *
     * @type {String | any}
     */
    _resetLabel: function() {
      if(this !== _itemMeta) {
        delete this._label;
      }
    },

    get label() {
      return this._label;
    },

    set label(value) {
      // null or "" -> undefined conversion
      if(value == null || value === "") {
        this._resetLabel();
      } else {
        this._label = String(value);
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
     * except for the root type _Item_ (which has no ancestor), where this attribute is `null`.
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
      if(this !== _itemMeta) {
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
     * The category is used primarily to group similar items in a user interface.
     *
     * Attempting to set to a non-string value type implicitly
     * converts the value to a string before assignment.
     *
     * Setting to `undefined` causes this attribute to use the inherited value,
     * except for the root type _Item_ (which has no ancestor), where the attribute is `null`.
     *
     * Setting to `null` or to an empty string clears the attribute and sets it to `null`,
     * thus ignoring any inherited value.
     *
     * @type {?nonEmptyString}
     * @see pentaho.type.Item.Meta#browsable
     * @see pentaho.type.Item.Meta#ordinal
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
      if(this !== _itemMeta) {
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
     * except for the root type _Item_ (which has no ancestor), where the attribute is `null`.
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
      if(this !== _itemMeta) {
        delete this._helpUrl;
      }
    },
    //endregion

    //region browsable property
    // @type boolean
    // -> boolean, Optional(true), Inherited, Configurable
    // undefined or null -> resets

    _browsable: true,

    /**
     * Gets or sets the `browsable` attribute of this type.
     *
     * Browsable items are exposed to the end user.
     * Set this attribute to `false` to prevent exposing the item in a user interface.
     *
     * Setting to a {@link Nully} value causes this attribute to use the inherited value,
     * except for the root type _Item_ (which has no ancestor), where the attribute is `true`.
     *
     * @type {boolean}
     */
    get browsable() {
      return this._browsable;
    },

    set browsable(value) {
      if(value == null) {
        this._resetBrowsable();
      } else {
        this._browsable = !!value;
      }
    },

    _resetBrowsable: function() {
      if(this !== _itemMeta) {
        delete this._browsable;
      }
    },
    //endregion

    //region advanced property
    // @type boolean
    // -> boolean, Optional(false), Inherited, Configurable
    // null || undefined -> reset
    _advanced: false,

    /**
     * Gets or sets the `advanced` attribute of this type.
     *
     * Items with `advanced` attributes set to `false` are typically immediately accessible to the user.
     * An advanced item typically escapes the expected flow of utilization, yet it is
     * sufficiently relevant to be shown in a user interface.
     *
     * Setting to a {@link Nully} value causes this attribute to use the inherited value,
     * except for the root type _Item_ (which has no ancestor), where the attribute is `false`.
     *
     * @type {boolean}
     * @see pentaho.type.Item.Meta#browsable
     */
    get advanced() {
      return this._advanced;
    },

    set advanced(value) {
      if(value == null) {
        this._resetAdvanced();
      } else {
        this._advanced = !!value;
      }
    },

    _resetAdvanced: function() {
      if(this !== _itemMeta) {
        delete this._advanced;
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
     * This attribute is typically used to associate an icon with this item type.
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
     * The ordinal is used to disambiguate the order with which an item is shown in a user interface.
     *
     * Setting to a {@link Nully} value causes this attribute to use the inherited value,
     * except for the root type _Item_ (which has no ancestor), where the attribute is `0`.
     *
     * @type {integer}
     * @see pentaho.type.Item.Meta#browsable
     * @see pentaho.type.Item.Meta#category
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
      if(this !== _itemMeta) {
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
    * Gets or sets the default view for items of this type.
    *
    *
    * Setting to a string defines the id of the view's module.
    * If the string starts with `/`, `xyz:` or ends with `.js`,
    * the id is considered to be absolute,
    * otherwise it is considered to be relative to the type's id folder.

    * Setting to `undefined` causes the view to be inherited from the ancestor type,
    * except for the root type _Item_ (which has no ancestor), where the attribute is `null`.
    *
    * Setting to a _falsy_ value (like `null` or an empty string),
    * clears the value of the attribute and sets it to `null`, ignoring any inherited value.
    *
    * Attempting to set to some other value is interpreted as the intention to set
    * the class or factory of the view.
    * It will normally be a function, but this is not ensured.
    *
    * @type string | function | object
    * @readOnly
    * @see pentaho.type.Item.Meta#viewClass
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
      } else {
        // Assume it is the View class itself, already resolved.
        if(!this._view || this._view.value !== value) {
          this._view = {value: value, promise: Promise.resolve(value)};
        }
      }
    },

    _resetView: function() {
      if(this !== _itemMeta) {
        delete this._view;
      }
    },

    /**
     * Gets a promise for the default view class, or `null` if no view is defined.
     *
     * @type ?Promise.<!(function|object)>
     * @readOnly
     * @see pentaho.type.Item.Meta#view
     */
    get viewClass() {
      var view = this._view;
      return view && (view.promise || (view.promise = promise.require([view.value])));
    },
    //endregion

    /**
     * Creates a subtype of this one.
     *
     * This method creates a type which does not have an own constructor.
     * The base type's constructor is used to _initialize_ the type.
     *
     * Do not use this method directly.
     * Use {@link pentaho.type.Item#extendProto} instead.
     *
     * @param {object} instSpec The type specification.
     * @param {object} keyArgs Keyword arguments.
     * @param {pentaho.type.Item} keyArgs.mesa The instances prototype of the type.
     *
     * @return {pentaho.type.Item.Meta} The new type.
     * @ignore
     */
    _extendProto: function(instSpec, keyArgs) {
      var subMeta = Object.create(this);

      // NOTE: `subMeta.constructor` is still the "base" constructor.
      subMeta.constructor(instSpec, keyArgs);

      return subMeta;
    },

    // TODO: Now that Property instances are never created,
    //   only types with constructors get created.

    /**
     * Creates an instance of this type,
     * given the construction arguments.
     *
     * @param {...any} args The construction arguments.
     * @return {pentaho.type.Item} The created instance.
     */
    create: function() {
      var inst = Object.create(this.mesa);
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
      return O_isProtoOf.call(this.mesa, value);
    },

    /**
     * Determines if this is a subtype of another.
     *
     * A type is considered a subtype of itself.
     *
     * @param {?pentaho.type.Item.Meta} superType The candidate super-type.
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
     * (checked using [is]{@link pentaho.type.Item.Meta#is}),
     * this method delegates the creation of an instance to
     * [create]{@link pentaho.type.Item.Meta#create}.
     *
     * @param {?any} value The value to convert.
     * @return {?pentaho.type.Item} The converted value or `null`.
     */
    to: function(value) {
      return value == null   ? null  :
             this.is(value)  ? value :
             // Am a (normal) constructor type or a prototype-only type?
             // TODO: Context can only handle constructor types and does: new Type( ... )
             this.constructor.prototype === this ? this.context.create(value, this, this) :
             this.create(value);
    }
  }, /** @lends pentaho.type.Item.Meta */{
    //@override
    /**
     * See Base.js
     * @ignore
     */
    _subClassed: function(SubTypeCtor, instSpec, classSpec, keyArgs) {
      var SubInstCtor = keyArgs.mesa.constructor;

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
    // `_subClassed` is given a _derived_ `keyArgs`
    // that can/should be passed to `this`(constructor).
    _initInstCtor: function(InstCtor, instSpec, keyArgs) {

      O.setConst(InstCtor, "Meta", this);

      this.call(this.prototype, instSpec, keyArgs || {mesa: InstCtor.prototype});
    }
  })
  .implement(AnnotatableLinked);

  _itemMeta = ItemMeta.prototype;

  return ItemMeta;

  function nonEmptyString(value) {
    return value == null ? null : (String(value) || null);
  }
});

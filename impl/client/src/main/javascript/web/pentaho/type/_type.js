/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "require",
  "./_baseLoader",
  "./SpecificationScope",
  "./SpecificationContext",
  "pentaho/i18n!types",
  "pentaho/module/metaService",
  "pentaho/lang/Base",
  "pentaho/util/error",
  "pentaho/util/arg",
  "pentaho/util/object",
  "pentaho/util/fun",
  "pentaho/util/promise",
  "pentaho/util/text",
  "pentaho/util/spec",
  "pentaho/module/util",
  "./theme/model"
], function(localRequire, baseLoader, SpecificationScope, SpecificationContext, bundle, moduleMetaService, Base,
            error, arg, O, F, promiseUtil, text, specUtil, moduleUtil) {

  "use strict";

  /* global Promise:false */

  /* eslint valid-jsdoc: 0 */

  // Unique type class id exposed through Type#uid and used by Context instances.
  var __nextUid = 1;

  var __normalAttrNames = [
    "description", "category", "helpUrl", "isBrowsable", "isAdvanced", "ordinal"
  ];
  var O_isProtoOf = Object.prototype.isPrototypeOf;

  var __type = null;

  /**
   * @name pentaho.type.Type
   * @class
   *
   * @classDesc The root class of types that can be represented by the Pentaho Type API.
   *
   * For additional information, see the associated _instance class_, {@link pentaho.type.Instance}.
   *
   * This constructor is the value of {@link pentaho.type.InstanceType}.
   *
   * @description _Initializes_ the type's singleton object.
   * @param {Object} spec - The specification of this type.
   * @param {!Object} keyArgs - Keyword arguments.
   * @param {!pentaho.type.Instance} keyArgs.instance - The _prototype_ of the `Instance` class associated with
   * this type.
   * @param {boolean} [keyArgs.isRoot=false] Indicates if the type is a _root_ type.
   */
  var Type = Base.extend("pentaho.type.Type", /** @lends pentaho.type.Type# */{

    /* Mixins are mixed before anything else, so that they are applied and serve as a base implementation. */
    extend_order: ["mixins"],

    constructor: function(spec, keyArgs) {
      if(!spec) spec = {};

      // Anticipate required initialization.
      O.setConst(this, "uid", __nextUid++);

      // Bind
      var instance = arg.required(keyArgs, "instance", "keyArgs");
      O.setConst(instance, "__type", this);
      O.setConst(this, "__instance", instance);

      if(arg.optional(keyArgs, "isRoot"))
        O.setConst(this, "root", this);

      // ----
      // excluded from extend: id, sourceId, alias and isAbstract
      // are here handled one by one.

      var id = text.nonEmptyString(spec.id);

      // Is it a temporary id? If so, ignore it.
      if(id !== null && SpecificationContext.isIdTemporary(id)) {
        id = null;
      }

      var sourceId = text.nonEmptyString(spec.sourceId);
      if(sourceId === null) {
        sourceId = id;
      } else if(id === null) {
        id = sourceId;
      }

      var alias = text.nonEmptyString(spec.alias);
      if(alias === null) {
        if(id !== null) {
          var moduleMeta = moduleMetaService.get(id);
          if(moduleMeta !== null) {
            alias = moduleMeta.alias;
          }
        }
      } else if(id === null) {
        throw error.argInvalid("alias", "Anonymous types cannot have an alias");
      }

      O.setConst(this, "__id", id);
      O.setConst(this, "__sourceId", sourceId);
      O.setConst(this, "__alias", alias);
      O.setConst(this, "__isAbstract", !!spec.isAbstract);

      // ---

      // Anticipate mixins handling cause, otherwise, `_init` would not be overridable by mixins.
      if(spec.mixins) {
        this.mixins = spec.mixins;
        // Prevent being applied again.
        spec = Object.create(spec);
        spec.mixins = undefined;
      }

      // ---

      spec = this._init(spec, keyArgs) || spec;

      var Ctor = this.constructor;
      if(Ctor.prototype === this) {
        // Type with own constructor.
        // Also, using mix records the applied instSpec, while #extend does not.
        Ctor.mix(spec, null, keyArgs);
      } else {
        // TODO: Lightweight types don't exist anymore, right?
        // Lightweight type.
        this.extend(spec, keyArgs);
      }

      this._postInit(spec, keyArgs);
    },

    /**
     * Performs initialization tasks that take place before the instance is extended with its specification.
     *
     * This method is typically overridden to block the inheritance of certain attributes.
     *
     * @param {object} spec - The specification of this type.
     * @param {!Object} keyArgs - Keyword arguments.
     * @param {!pentaho.type.Instance} keyArgs.instance - The _prototype_ of the `Instance` class associated with
     * this type.
     * @param {boolean} [keyArgs.isRoot=false] If `true`, creates a _root_ type.
     *
     * @return {?object} A specification to use instead of the given `spec` argument to extend
     * the type, or `undefined`, to use the given specification.
     *
     * @protected
     */
    _init: function(spec, keyArgs) {
      // Block inheritance, with default values

      // Don't use inherited property definition which may be writable false
      Object.defineProperty(this, "__hasDescendants", {value: false, writable: true});

      if(!("styleClass" in spec)) this.styleClass = undefined;

      this.__application = specUtil.merge({}, this.__application);
    },

    /**
     * Performs initialization tasks that take place after the instance is extended with its specification.
     *
     * This method is typically overridden to validate or default the values of the attributes.
     *
     * @param {!Object} spec - The specification of this type.
     * @param {!Object} keyArgs - Keyword arguments.
     * @protected
     */
    _postInit: function(spec, keyArgs) {
    },

    // region uid property
    /**
     * Gets the unique identifier of this type.
     *
     * Unique type identifiers are auto-generated in each session.
     *
     * Note that even anonymous types
     * (those whose {@link pentaho.type.Type#id} is `null`)
     * have a unique identifier.
     *
     * This attribute is _not_ inherited.
     *
     * @type {number}
     * @readonly
     */
    uid: -1, // Set in _init.
    // endregion

    // region root property
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
     * It is the immediate subtypes of `Property`
     * (each root property within a complex type)
     * which are considered roots.
     * This aligns with users expectations of what an attribute named `root`
     * in a property type should mean.
     *
     * @name root
     * @memberOf pentaho.type.Type#
     * @type {pentaho.type.Type}
     * @readonly
     * @see pentaho.type.Type#isRoot
     * @see pentaho.type.Type#ancestor
     */

    /**
     * Gets a value that indicates if this type is the root of its type hierarchy.
     *
     * @type {boolean}
     *
     * @readonly
     *
     * @see pentaho.type.Type#root
     */
    get isRoot() {
      return this === this.root;
    },
    // endregion

    // region ancestor property
    /**
     * Gets the parent type in the current type hierarchy, if any, or `null`.
     *
     * The root type returns `null`.
     *
     * @type {pentaho.type.Type}
     * @readonly
     * @see pentaho.type.Type#root
     * @see pentaho.type.Type#hasDescendants
     */
    get ancestor() {
      return this.isRoot ? null : Object.getPrototypeOf(this);
    },
    // endregion

    // region hasDescendants property
    /**
     * Gets a value that indicates if this type has any descendant types.
     *
     * @type {boolean}
     * @readonly
     * @see pentaho.type.Type#ancestor
     */
    get hasDescendants() {
      return this.__hasDescendants;
    },
    // endregion

    // region instance property
    /**
     * Gets the _prototype_ of the instances of this type.
     *
     * @type {pentaho.type.Instance}
     * @readOnly
     */
    get instance() {
      return this.__instance;
    },

    // Supports Instance configuration only, from the type side.
    // To be used in type specifications, to change the instance side.
    // Not documented on purpose.
    set instance(config) {
      // Class.implement essentially just calls Class#extend.
      /* istanbul ignore else: no comments */
      if(config) this.instance.extend(config);
    }, // jshint -W078
    // endregion

    // region Type Kinds
    // region isValue property
    /**
     * Gets a value that indicates if this type
     * [is]{@link pentaho.type.Type#isSubtypeOf} a
     * [value]{@link pentaho.type.ValueType} type.
     *
     * @type {boolean}
     * @readOnly
     */
    get isValue() { return false; },
    // endregion

    // region isProperty property
    /**
     * Gets a value that indicates if this type
     * [is]{@link pentaho.type.Type#isSubtypeOf} a
     * [property]{@link pentaho.type.PropertyType} type.
     *
     * @type {boolean}
     * @readOnly
     */
    get isProperty() { return false; },
    // endregion

    // region isContainer property
    /**
     * Gets a value that indicates if this type
     * [is]{@link pentaho.type.Type#isSubtypeOf} a
     * [list]{@link pentaho.type.ListType} or a
     * [complex]{@link pentaho.type.ComplexType} type.
     *
     * @type {boolean}
     * @readOnly
     */
    get isContainer() { return false; },
    // endregion

    // region isList property
    /**
     * Gets a value that indicates if this type
     * [is]{@link pentaho.type.Type#isSubtypeOf} a
     * [list]{@link pentaho.type.ListType} type.
     *
     * @type {boolean}
     * @readOnly
     */
    get isList() { return false; },
    // endregion

    // region isElement property
    /**
     * Gets a value that indicates if this type
     * [is]{@link pentaho.type.Type#isSubtypeOf} an
     * [element]{@link pentaho.type.ElementType} type.
     *
     * @type {boolean}
     * @readOnly
     */
    get isElement() { return false; },

    // region isComplex property
    /**
     * Gets a value that indicates if this type
     * [is]{@link pentaho.type.Type#isSubtypeOf} a
     * [complex]{@link pentaho.type.ComplexType} type.
     *
     * @type {boolean}
     * @readOnly
     */
    get isComplex() { return false; },
    // endregion

    // region isSimple property
    /**
     * Gets a value that indicates if this type
     * [is]{@link pentaho.type.Type#isSubtypeOf} a
     * [simple]{@link pentaho.type.SimpleType} type.
     *
     * @type {boolean}
     * @readOnly
     */
    get isSimple() { return false; },
    // endregion

    // region isContinuous property
    /**
     * Gets a value that indicates if this is a continuous type.
     *
     * A non-continuous type is said to be _categorical_.
     *
     * The default implementation returns false.
     *
     * The types {@link pentaho.type.Number} and {@link pentaho.type.Date} are known to be continuous.
     *
     * @type {boolean}
     * @readOnly
     */
    get isContinuous() { return false; },
    // endregion
    // endregion

    // region elementType property
    /**
     * Gets the element type of this type.
     *
     * If this type is a [list]{@link pentaho.type.Type#isList} type,
     * returns its [of]{@link pentaho.type.ListType#of} attribute.
     * Otherwise, this type is an element type, and it returns itself.
     *
     * @type {!pentaho.type.Type}
     * @readonly
     * @see pentaho.type.Type#isList
     * @see pentaho.type.Type#isElement
     * @see pentaho.type.ListType#of
     */
    get elementType() {
      return this;
    },
    // endregion

    // region id, sourceId and alias properties

    // -> nonEmptyString, Optional(null), Immutable, Shared (note: not Inherited)
    // "" -> null conversion

    __id: null,

    /**
     * Gets the identifier of this type.
     *
     * The identifier of a type can only be specified when extending the ancestor type.
     *
     * The identifier is only defined for types which have an associated AMD/RequireJS module.
     * However, note that all have a {@link pentaho.type.Type#uid}.
     *
     * This attribute is not inherited.
     *
     * When unspecified, defaults to the value of [sourceId]{@link pentaho.type.Type#sourceId}.
     *
     * @type {?nonEmptyString}
     * @readonly
     *
     * @see pentaho.type.Type#sourceId
     */
    get id() {
      return this.__id;
    },

    // -> nonEmptyString, Optional(null), Immutable, Shared (note: not Inherited)
    // "" -> null conversion

    __sourceId: null,

    /**
     * Gets the source module identifier of this type.
     *
     * The source identifier is the module identifier of the _actual_ AMD/RequireJS module
     * that provides the type and may be different from the [identifier]{@link pentaho.type.Type#id}
     * when an AMD package or custom mapping is configured for the module.
     *
     * The source identifier is used to resolve module identifiers relative to the source module,
     * as is the case with the {@link pentaho.type.Type#defaultView} attribute.
     *
     * The source identifier of a type can only be specified when extending the ancestor type.
     *
     * This attribute is not inherited.
     *
     * When unspecified, defaults to the value of [id]{@link pentaho.type.Type#id}.
     *
     * @type {?nonEmptyString}
     * @readonly
     * @see pentaho.type.Type#id
     * @see pentaho.type.Type#defaultView
     */
    get sourceId() {
      return this.__sourceId;
    },

    /**
     * Gets the short identifier of this type.
     *
     * The short identifier of a type is equal to its alias, provided it is defined.
     * Otherwise, it is equal to the identifier.
     *
     * @type {?nonEmptyString}
     * @readOnly
     * @see pentaho.type.Type#id
     * @see pentaho.type.Type#alias
     */
    get shortId() {
      return this.__alias || this.__id;
    },

    /**
     * Builds an absolute module identifier from
     * one that is relative to the type's [source location]{@link pentaho.type.Type#sourceId}.
     *
     * Relative module identifiers start with a `.` and do not end with `".js"`.
     * For example, `"./View"` and `"../View"`, but not `./View.js`.
     *
     * Absolute identifiers are returned without modification.
     *
     * @param {string} id - A module identifier.
     *
     * @return {string} An absolute module identifier.
     *
     * @see pentaho.type.Type#sourceId
     *
     * @throws {OperationInvalidError} When `id` is a relative identifier and this type is anonymous,
     * or when `id` refers to an inexistent ascendant location.
     */
    buildSourceRelativeId: function(id) {
      return moduleUtil.absolutizeIdRelativeToSibling(id, this.sourceId);
    },

    // -> nonEmptyString, Optional(null), Immutable, Shared (note: not Inherited)
    // "" -> null conversion

    __alias: null,

    /**
     * Gets the alias for the identifier of this type.
     *
     * The alias of a type can only be specified when extending the ancestor type.
     *
     * This attribute is not inherited.
     *
     * When unspecified, defaults to `null`.
     *
     * @type {?nonEmptyString}
     * @readonly
     *
     * @see pentaho.type.Type#id
     */
    get alias() {
      return this.__alias;
    },
    // endregion

    // region isAbstract property
    // @type boolean
    // -> boolean, Optional(false)

    // Default value is for `Type` only.
    // @see Type#constructor.
    __isAbstract: true,

    /**
     * Gets a value that indicates if this type is abstract.
     *
     * This attribute can only be set once, upon the type definition.
     *
     * @type {boolean}
     * @readOnly
     *
     * @default false
     */
    get isAbstract() {
      return this.__isAbstract;
    },
    // endregion

    // region mixins property
    /**
     * Gets or sets the mixin types that are locally mixed into this type.
     *
     * Can be set to either type identifiers, instance classes or type instances and arrays thereof.
     *
     * The attributes defined by the added mixin types become available for
     * extension/configuration on this type.
     * When extending, mixins are always applied first.
     *
     * When set to a {@link Nully} value, nothing is done.
     *
     * @type {Array.<pentaho.type.Type>}
     */
    get mixins() {
      var OwnCtor = this.instance.constructor;
      if(OwnCtor) {
        var mixinClasses = OwnCtor.mixins;
        if(mixinClasses) {
          return mixinClasses
            .map(function(Mixin) { return Mixin.type; })
            .filter(function(type) { return type instanceof Type; });
        }
      }

      return [];
    },

    // For configuration only.
    set mixins(values) {

      if(!values) return;

      var Instance = this.instance.constructor;

      // Add new mixins from values
      if(Array.isArray(values))
        values.forEach(addMixinType, this);
      else
        addMixinType.call(this, values);

      function addMixinType(MixinType) {
        var MixinInst = baseLoader.resolveType(MixinType);
        Instance.mix(MixinInst);
      }
    },
    // endregion

    // region label property
    // must have some non-null value to inherit
    __label: "instance",
    __labelIsSet: false,

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
     * @type {nonEmptyString}
     */
    get label() {
      return this.__label;
    },

    set label(value) {
      value = text.nonEmptyString(value);
      if(value === null) {
        this.__labelIsSet = false;
        if(this !== __type) {
          value = text.nonEmptyString(this._getLabelDefault());
          if(value == null) {
            delete this.__label;
          } else {
            this.__label = value;
          }
        }
      } else {
        this.__labelIsSet = true;
        this.__label = value;
      }
    },

    /**
     * Gets the default label to use when the label is not set.
     *
     * @return {?string} The default label or an empty value.
     * @protected
     */
    _getLabelDefault: function() {
      return undefined;
    },

    /**
     * Gets a value that indicates if the label is locally set.
     *
     * @type {boolean}
     * @readOnly
     * @protected
     */
    get _isLabelSet() {
      return O.getOwn(this, "__labelIsSet") === true;
    },
    // endregion

    // region application property
    __application: {},

    /**
     * Gets or sets the `application` attribute of this type.
     *
     * The application property serves as a collection of properties specific to the _container application_
     * that can be modified via the [Configuration Service]{@link pentaho.config.Service}.
     *
     * Setting this to a {@link Nully} value will have no effect.
     *
     * @type {object}
     */
    get application() {
      return this.__application;
    },

    set application(value) {
      specUtil.merge(this.__application, value);
    },
    // endregion

    // region description property

    // -> nonEmptyString, Optional, Inherited, Configurable, Localized
    // "" -> null conversion

    __description: null, // Set through implement bundle, below.

    /**
     * Gets or sets the description of this type.
     *
     * Attempting to set to a non-string value type implicitly converts the value to a string before assignment.
     *
     * Setting this to `undefined` causes this attribute to use the inherited value,
     * except for the root type, `Instance.type` (which has no ancestor), where this attribute is `null`.
     *
     * Setting this to `null` or to an empty string clears the attribute and sets it to `null`,
     * ignoring any inherited value.
     *
     * @type {?nonEmptyString}
     */
    get description() {
      return this.__description;
    },

    set description(value) {
      if(value === undefined) {
        if(this !== __type) {
          delete this.__description;
        }
      } else {
        this.__description = text.nonEmptyString(value);
      }
    },
    // endregion

    // region category property

    // -> nonEmptyString, Optional, Inherited, Configurable, Localized
    // "" -> null conversion

    __category: null,

    /**
     * Gets or sets the category associated with this type.
     *
     * The category is used primarily to group similar types (or instances of) in a user interface.
     *
     * Attempting to set to a non-string value type implicitly
     * converts the value to a string before assignment.
     *
     * Setting this to `undefined` causes this attribute to use the inherited value,
     * except for the root type, `Instance.type` (which has no ancestor), where the attribute is `null`.
     *
     * Setting this to `null` or to an empty string clears the attribute and sets it to `null`,
     * thus ignoring any inherited value.
     *
     * @type {?nonEmptyString}
     * @see pentaho.type.Type#isBrowsable
     * @see pentaho.type.Type#ordinal
     */
    get category() {
      return this.__category;
    },

    set category(value) {
      if(value === undefined) {
        if(this !== __type) {
          delete this.__category;
        }
      } else {
        this.__category = text.nonEmptyString(value);
      }
    },
    // endregion

    // region helpUrl property

    // -> nonEmptyString, Optional, Inherited, Configurable, Localized?
    // "" -> null conversion

    __helpUrl: null,

    /**
     * Gets or sets a URL pointing to documentation associated with this type.
     *
     * Attempting to set to a non-string value type implicitly
     * converts the value to a string before assignment.
     *
     * Setting this to `undefined` causes this attribute to use the inherited value,
     * except for the root type, `Instance.type` (which has no ancestor), where the attribute is `null`.
     *
     * Setting this to `null` or to an empty string clears the attribute and sets it to `null`,
     * ignoring any inherited value.
     *
     * @type {?nonEmptyString}
     */
    get helpUrl() {
      return this.__helpUrl;
    },

    set helpUrl(value) {
      if(value === undefined) {
        if(this !== __type) {
          delete this.__helpUrl;
        }
      } else {
        this.__helpUrl = text.nonEmptyString(value);
      }
    },
    // endregion

    // region isBrowsable property
    // @type boolean
    // -> boolean, Optional(true), Inherited, Configurable
    // undefined or null -> resets

    __isBrowsable: true,

    /**
     * Gets or sets the `isBrowsable` attribute of this type.
     *
     * Browsable types are exposed to the end user.
     * Set this attribute to `false` to prevent exposing the type in a user interface.
     *
     * Setting this to a {@link Nully} value causes this attribute to use the inherited value,
     * except for the root type, `Instance.type` (which has no ancestor), where the attribute is `true`.
     *
     * @type {boolean}
     */
    get isBrowsable() {
      return this.__isBrowsable;
    },

    set isBrowsable(value) {
      if(value == null) {
        if(this !== __type) {
          delete this.__isBrowsable;
        }
      } else {
        this.__isBrowsable = !!value;
      }
    },
    // endregion

    // region isAdvanced property
    // @type boolean
    // -> boolean, Optional(false), Inherited, Configurable
    // null || undefined -> reset
    __isAdvanced: false,

    /**
     * Gets or sets the `isAdvanced` attribute of this type.
     *
     * Types with `isAdvanced` attributes set to `false` are typically immediately accessible to the user.
     * An advanced type typically escapes the expected flow of utilization, yet it is
     * sufficiently relevant to be shown in a user interface.
     *
     * Setting this to a {@link Nully} value causes this attribute to use the inherited value,
     * except for the root type, `Instance.type` (which has no ancestor), where the attribute is `false`.
     *
     * @type {boolean}
     * @see pentaho.type.Type#isBrowsable
     */
    get isAdvanced() {
      return this.__isAdvanced;
    },

    set isAdvanced(value) {
      if(value == null) {
        if(this !== __type) {
          delete this.__isAdvanced;
        }
      } else {
        this.__isAdvanced = !!value;
      }
    },
    // endregion

    // region styleClass property
    // @type nonEmptyString
    // -> nonEmptyString, Optional(null), Configurable, Localized
    // "" or undefined -> null conversion

    __styleClass: null,
    __styleClassIsSet: undefined,

    /**
     * Gets or sets the CSS class associated with this type.
     *
     * This attribute is typically used to associate an icon with a type.
     *
     * Attempting to set to a non-string value type implicitly
     * converts the value to a string before assignment.
     *
     * An empty string or `null` clears the property value.
     *
     * Setting to `undefined`, makes the property assume its default value.
     *
     * The default value of a type with an [id]{@link pentaho.type.Type#id} is
     * the identifier converted to _snake-case_,
     * plus special characters like `\`, `/`, `_`, `.` and spaces are converted to: a dash (`–`).
     * For example: `"pentaho/visual/models/heatGrid"` would have a default
     * `styleClass` of: `"pentaho-visual-ccc-heat-grid"`.
     * The default value of an anonymous type is `null`.
     *
     * @type {?nonEmptyString}
     */
    get styleClass() {
      return this.__styleClass;
    },

    set styleClass(value) {
      if(value === undefined) {
        this.__styleClass = this.__id ? text.toSnakeCase(this.__id) : null;
        this.__styleClassIsSet = false;
      } else {
        this.__styleClass = value === "" ? null : value;
        this.__styleClassIsSet = true;
      }
    },

    /**
     * Gets the style classes of this and any base types.
     *
     * The returned array should not be modified.
     *
     * @type {string[]}
     * @readonly
     */
    get inheritedStyleClasses() {
      var styleClasses;
      var styleClass = this.__styleClass;

      var baseType = this !== __type ? Object.getPrototypeOf(this) : null;
      if(baseType) {
        styleClasses = baseType.inheritedStyleClasses;
        if(styleClass) styleClasses = styleClasses.concat(styleClass);
      } else {
        styleClasses = styleClass ? [styleClass] : [];
      }

      return styleClasses;
    },
    // endregion

    // region ordinal property
    // @type integer
    // -> Optional(0), Inherited, Configurable
    __ordinal: 0,

    /**
     * Gets or sets the ordinal associated with this type.
     *
     * The ordinal is used to disambiguate the order with which a type (or an instance of it)
     * is shown in a user interface.
     *
     * Setting this to a {@link Nully} value causes this attribute to use the inherited value,
     * except for the root type, `Instance.type` (which has no ancestor), where the attribute is `0`.
     *
     * @type {number}
     * @see pentaho.type.Type#isBrowsable
     * @see pentaho.type.Type#category
     */
    get ordinal() {
      return this.__ordinal;
    },

    set ordinal(value) {
      if(value == null) {
        if(this !== __type) {
          delete this.__ordinal;
        }
      } else {
        this.__ordinal = Math.floor((+value) || 0);
      }
    },
    // endregion

    // region defaultView property

    // -> nonEmptyString, Optional, Inherited, Configurable, Localized
    // undefined -> inherit
    // null -> clear
    // "" -> null conversion

    __defaultView: null, // {value: any, promise: Promise.<Class.<View>>}

    /**
     * Gets or sets the default view for instances of this type.
     *
     * The identifier of the view's AMD module.
     * If the identifier is relative, it is relative to [sourceId]{@link pentaho.type.Type#sourceId}.
     *
     * Setting this to `undefined` causes the default view to be inherited from the ancestor type,
     * except for the root type, `Instance.type` (which has no ancestor), where the attribute is `null`.
     *
     * Setting this to a _falsy_ value (like `null` or an empty string),
     * clears the value of the attribute and sets it to `null`, ignoring any inherited value.
     *
     * @see pentaho.type.Type#buildSourceRelativeId
     *
     * @type {string}
     *
     * @throws {pentaho.lang.ArgumentInvalidTypeError} When the set value is not
     * a string, a function or {@link Nully}.
     *
     * @throws {OperationInvalidError} When `defaultView` is a relative identifier and this type is anonymous,
     * or when `defaultView` refers to an inexistent ascendant location.
     */
    get defaultView() {
      return this.__defaultView && this.__defaultView.value;
    },

    set defaultView(value) {
      var defaultViewInfo;

      if(value === undefined) {

        if(this !== __type) {
          delete this.__defaultView;
        }

      } else if(!value) { // Is null || ""

        this.__defaultView = null;

      } else {
        defaultViewInfo = O.getOwn(this, "__defaultView");
        if(!defaultViewInfo || (defaultViewInfo.value !== value && defaultViewInfo.fullValue !== value)) {
          this.__defaultView = {value: value, fullValue: this.buildSourceRelativeId(value)};
        }
      }
    },

    /**
     * Gets the absolute view module identifier, if any.
     *
     * A default view exists if property {@link pentaho.type.Type#defaultView}
     * has a non-null value.
     *
     * @type {string}
     * @readOnly
     * @see pentaho.type.Type#defaultView
     */
    get defaultViewAbs() {
      var defaultView = this.__defaultView;
      return defaultView ? defaultView.fullValue : null;
    },
    // endregion

    // region creation
    /**
     * Creates or resolves an instance of this type given an instance reference.
     *
     * This method delegates to [InstancesContainer#get]{@link pentaho.type.InstancesContainer#get}
     * with this type as the `typeBase` argument.
     *
     * @example
     * <caption>
     *   Create a complex instance from a specification that contains the type inline.
     * </caption>
     *
     * require(["pentaho/type/Instance", "pentaho/type/standard"], function(Instance) {
     *
     *   var product = Instance.type.create({
     *     _: {
     *       props: ["id", "name", {name: "price", valueType: "number"}]
     *     },
     *
     *     id:    "mpma",
     *     name:  "Principia Mathematica",
     *     price: 1200
     *   });
     *
     *   // ...
     *
     * });
     *
     * @example
     * <caption>
     *   Create a list instance from a specification that contains the type inline.
     * </caption>
     *
     * require(["pentaho/type/Instance", "pentaho/type/standard"], function(Instance) {
     *
     *   var productList = Instance.type.create({
     *     _: [{
     *       props: ["id", "name", {name: "price", valueType: "number"}]
     *     }],
     *
     *     d: [
     *       {id: "mpma", name: "Principia Mathematica", price: 1200},
     *       {id: "flot", name: "The Laws of Thought",   price:  500}
     *     ]
     *   });
     *
     *   // ...
     *
     * });
     *
     * @example
     * <caption>
     *   Create an instance from a specification that <b>does not</b> contain the type inline.
     * </caption>
     *
     * require(["pentaho/type/Instance", "pentaho/type/standard"], function(Instance) {
     *
     *   var ProductList = Instance.type.create([{
     *     props: [
     *       "id",
     *       "name",
     *       {name: "price", valueType: "number"}
     *     ]
     *   }]);
     *
     *   // Provide the default type, in case the instance spec doesn't provide one.
     *   var productList = ProductList.type.create([
     *     {id: "mpma", name: "Principia Mathematica", price: 1200},
     *     {id: "flot", name: "The Laws of Thought",   price:  500}
     *   ]);
     *
     *   // ...
     *
     * });
     *
     * @param {pentaho.type.Instance|pentaho.type.spec.Instance} [instSpec] - An instance or instance specification.
     * @param {Object} [instKeyArgs] - The keyword arguments passed to the instance constructor, when one is created.
     *
     * @return {pentaho.type.Instance} The created instance or the resolved instance (possibly `null`).
     *
     * @throws {Error} Other errors, as documented in:
     * [InstancesContainer#get]{@link pentaho.type.InstancesContainer#get}.
     *
     * @see pentaho.type.Type#createAsync
     * @see pentaho.type.Type#to
     * @see pentaho.type.Type#is
     */
    create: function(instSpec, instKeyArgs) {
      return baseLoader.resolveInstance(instSpec, instKeyArgs, this);
    },

    /**
     * Creates or resolves an instance of this type, asynchronously, given an instance reference.
     *
     * This method delegates to [InstancesContainer#getAsync]{@link pentaho.type.InstancesContainer#getAsync}
     * with this type as the `typeBase` argument.
     *
     * @param {pentaho.type.Instance|pentaho.type.spec.Instance} [instSpec] - An instance or instance specification.
     * @param {Object} [instKeyArgs] - The keyword arguments passed to the instance constructor, when one is created.
     *
     * @return {!Promise.<pentaho.type.Instance>} A promise to the created instance or resolved instance
     * (possibly `null`).
     *
     * @rejects {Error} Other errors, as documented in:
     * [InstancesContainer#getAsync]{@link pentaho.type.InstancesContainer#getAsync}.
     *
     * @see pentaho.type.Type#create
     */
    createAsync: function(instSpec, instKeyArgs) {
      return baseLoader.resolveInstanceAsync(instSpec, instKeyArgs, this);
    },

    /**
     * Asserts that a given type is a subtype of this type.
     *
     * @param {!pentaho.type.Type} subtype - The subtype to assert.
     *
     * @return {!pentaho.type.Type} The subtype `subtype`.
     *
     * @throws {pentaho.lang.OperationInvalidError} When `subtype` is not a subtype of this.
     *
     * @private
     */
    __assertSubtype: function(subtype) {
      if(!subtype.isSubtypeOf(this)) {
        throw error.operInvalid(
          bundle.format(bundle.structured.errors.instance.notOfExpectedBaseType, [this]));
      }

      return subtype;
    },

    /**
     * Throws an error complaining that the type is abstract and cannot create instances.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this is not an abstract type.
     *
     * @private
     */
    __throwAbstractType: function() {
      throw error.operInvalid(bundle.format(
        bundle.structured.errors.instance.cannotCreateInstanceOfAbstractType, [this]));
    },
    // endregion

    /**
     * Asserts that the type has no subtypes and that as such the given attribute can be set.
     *
     * @param {string} attributeName - The name of the attribute being set.
     *
     * @throws {pentaho.lang.OperationInvalidError} When setting and the type
     * already has [subtypes]{@link pentaho.type.Type#hasDescendants}.
     *
     * @protected
     */
    _assertNoSubtypesAttribute: function(attributeName) {

      if(this.hasDescendants) {
        throw error.operInvalid(
          bundle.get("errors.attributeLockedWhenTypeHasSubtypes", [attributeName]));
      }
    },

    /**
     * Determines if a value is an instance of this type.
     *
     * @param {?any} value - The value to test.
     * @return {boolean} `true` if the value is an instance of this type; `false`, otherwise.
     */
    is: function(value) {
      return O_isProtoOf.call(this.instance, value);
    },

    /**
     * Determines if this is a subtype of another.
     *
     * A type is considered a subtype of itself.
     *
     * @param {pentaho.type.Type} superType - The candidate super-type.
     * @return {boolean} `true` if this is a subtype of `superType` type; `false`, otherwise.
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
     * @param {?any} value - The value to convert.
     * @param {Object} [keyArgs] - The keyword arguments passed to `create`, when a new instance is created.
     *
     * @return {?pentaho.type.Instance} The converted value or `null`.
     */
    to: function(value, keyArgs) {
      return value == null ? null :
        this.is(value) ? value :
        this.create(value, keyArgs);
    },

    // region serialization
    /**
     * Creates a specification that describes this type.
     *
     * If an [ambient specification context]{@link pentaho.type.SpecificationContext.current},
     * currently exists, it is used to manage the serialization process.
     * Otherwise, one is created and set as current.
     *
     * This method creates a new {@link pentaho.type.SpecificationScope} for describing
     * this type, and any other instances and types it references,
     * and then delegates the actual work to {@link pentaho.type.Type#toSpecInContext}.
     *
     * This method returns a reference to this type that is appropriate
     * to be the value of an [inline type]{@link pentaho.type.spec.IInstance#_} property
     * that is included on a specification of an instance of this type.
     *
     * When a type has an identifier, its [id]{@link pentaho.type.Type#id} (or
     * its [alias]{@link pentaho.type.Type#alias}) is returned.
     *
     * For anonymous types, a [temporary]{@link pentaho.type.SpecificationContext.isIdTemporary},
     * serialization-only identifier is generated.
     * In the first occurrence in the given scope,
     * that identifier is returned, within a full specification of the type,
     * obtained by calling [toSpecInContext]{@link pentaho.type.Type#toSpecInContext}.
     * In following occurrences, only the previously used temporary identifier is returned.
     *
     * @param {Object} [keyArgs] The keyword arguments object.
     * Passed to every type and instance serialized within this scope.
     *
     * Please see the documentation of subclasses for information on additional, supported keyword arguments.
     *
     * @param {?boolean} [keyArgs.isJson=false] Generates a JSON-compatible specification.
     * Attributes that do not have a JSON-compatible specification are omitted.
     *
     * @return {!pentaho.type.spec.TypeReference} A reference to this type.
     *
     * @see pentaho.type.Type#toSpecInContext
     * @see pentaho.type.Type#_fillSpecInContext
     */
    toSpec: function(keyArgs) {
      var id = this.id;
      if(id !== null) {
        // Type has an identifier.
        return keyArgs && keyArgs.noAlias ? id : this.shortId;
      }

      return O.using(new SpecificationScope(), this.toSpecInContext.bind(this, keyArgs || {}));
    },

    /**
     * Creates a specification that describes this type.
     *
     * This method requires that there currently exists an
     * [ambient specification context]{@link pentaho.type.SpecificationContext.current}.
     *
     * This method handles the cases where this type has an [identifier]{@link pentaho.type.Type#id}
     * or it does not but a temporary identifier has already been assigned in the ambient specification context.
     * Otherwise, execution delegates to [_toSpecInContextCore]{@link pentaho.type.Type#_toSpecInContextCore}.
     *
     * @param {Object} [keyArgs] The keyword arguments object.
     * Passed to every type and instance serialized within this scope.
     *
     * Please see the documentation of subclasses for information on additional, supported keyword arguments.
     *
     * @return {!pentaho.type.spec.TypeReference} A reference to this type.
     *
     * @see pentaho.type.Type#toSpec
     */
    toSpecInContext: function(keyArgs) {

      var id = this.id;
      if(id !== null) {
        // Type has an identifier.
        return keyArgs && keyArgs.noAlias ? id : this.shortId;
      }

      id = SpecificationContext.current.getIdOf(this);
      if(id !== null) {
        // Already added previously to the specification context.
        return id;
      }

      return this._toSpecInContextCore(keyArgs || {});
    },

    /**
     * Called to actually create a specification of this anonymous type,
     * when it is the first time that this type occurs in the ambient specification context.
     *
     * @param {object} keyArgs The keyword arguments object.
     * Passed to every type and instance serialized within this scope.
     *
     * Please see the documentation of subclasses for information on additional, supported keyword arguments.
     *
     * @return {!pentaho.type.spec.IType} A specification of this type.
     * @protected
     *
     * @see pentaho.type.Type#_toSpecInContextCore
     */
    _toSpecInContextCore: function(keyArgs) {

      var id = SpecificationContext.current.add(this);

      var spec = {id: id};

      this._fillSpecInContext(spec, keyArgs);

      return spec;
    },

    /**
     * Creates a JSON specification that describes this type.
     *
     * Attributes which do not have a JSON-compatible specification are omitted.
     * Specifically, attributes with a function value are not supported.
     *
     * This method simply calls {@link @see pentaho.type.Instance#toSpec} with argument `keyArgs.isJson` as `true`
     * and exists for seamless integration with JavaScript's
     * [JSON.stringify](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
     * method.
     *
     * @see pentaho.type.Instance#toSpec
     *
     * @return {JsonValue} A JSON-compatible specification.
     */
    toJSON: function() {
      return this.toSpec({isJson: true});
    },

    /**
     * Fills the given specification with this type's attributes' local values,
     * and returns whether any attribute was actually added.
     *
     * This method requires that there currently exists an
     * [ambient specification context]{@link pentaho.type.SpecificationContext.current}.
     *
     * This method does _not_ add the special `id` and `base` attributes to the specification.
     *
     * @param {!Object} spec - The specification to be filled.
     * @param {Object} [keyArgs] The keyword arguments object.
     * Passed to every type and instance serialized within this scope.
     *
     * Please see the documentation of subclasses for information on additional, supported keyword arguments.
     *
     * @return {boolean} Returns `true` if any attribute was added; `false`, otherwise.
     *
     * @protected
     *
     * @see pentaho.type.Instance#toSpecInContext
     */
    _fillSpecInContext: function(spec, keyArgs) {
      var any = false;
      var isJson = keyArgs.isJson;

      // Custom attributes
      if(this.isAbstract) {
        any = true;
        spec.isAbstract = true;
      }

      if(this._isLabelSet) {
        any = true;
        spec.label = this.__label;
      }

      // "mixins" attribute
      var mixins = this.mixins;
      if(mixins.length) {
        any = true;
        spec.mixins = mixins.map(function(mixinType) { return mixinType.shortId; });
      }

      // Normal attributes
      __normalAttrNames.forEach(function(name) {
        var __attrName = "__" + name;
        if(O.hasOwn(this, __attrName)) {
          any = true;
          spec[name] = this[__attrName];
        }
      }, this);

      var styleClass = this.__styleClass;
      if(styleClass && this.__styleClassIsSet) {
        any = true;
        spec.styleClass = styleClass;
      }

      var defaultViewInfo = O.getOwn(this, "__defaultView");
      if(defaultViewInfo !== undefined) { // Can be null.
        var defaultView = defaultViewInfo && defaultViewInfo.value;
        if(!defaultView || !isJson || !F.is(defaultView)) {
          any = true;
          spec.defaultView = defaultView;
        }
      }

      // Dynamic attributes
      if(this.__fillSpecInContextDynamicAttributes(spec, keyArgs)) {
        any = true;
      }

      return any;
    },
    // endregion

    /**
     * Returns a textual representation suitable to identify this type in an error message.
     *
     * @return {string} A textual representation.
     */
    toString: function() {
      return this.id || this.label; // Never empty;
    },

    // region dynamic & monotonic attributes

    // Infos of attributes declared locally in this type.
    __dynamicAttrInfos: null,

    /*
     * Defines dynamic, monotonic, inherited attributes of the type.
     *
     * This **setter**-only JavaScript property is used
     * to extend the type with new dynamic attributes.
     *
     * @type {Object}
     * @ignore
     */
    set dynamicAttributes(attrSpecs) {
      Object.keys(attrSpecs).forEach(function(name) {
        this.__defineDynamicAttribute(name, attrSpecs[name]);
      }, this);
    }, // jshint -W078

    /**
     * Defines a "dynamic" attribute and corresponding setter and getter methods.
     *
     * A "dynamic" attribute is dynamic (can be a function), monotonic and inherited.
     *
     * @param {String} name - The name of the attribute.
     * @param {Object} spec - The specification of the attribute.
     * @private
     */
    __defineDynamicAttribute: function(name, spec) {
      var cast = spec.cast; // Monotonicity
      // * minimum/default/neutral value

      var monotoneCombineEvals = spec.combine;
      var namePriv = "__" + name;
      var namePrivEval = namePriv + "On";
      var root = this;

      // Register in local dynamic attributes.
      var dynAttrInfos = O.getOwn(root, "__dynamicAttrInfos");
      if(!dynAttrInfos) {
        dynAttrInfos = root.__dynamicAttrInfos = [];
      }
      dynAttrInfos.push({
        name: name,
        spec: spec
      });

      var dv;
      (function() {
        dv = spec.value;

        var fValue;
        if(F.is(dv)) {
          fValue = dv;
          dv = null;
          if(cast) fValue = __wrapWithCast.call(root, fValue, cast, dv);
        } else {
          // When cast failure is found at static time, we ignore the local value.
          dv = __castAndNormalize.call(root, dv, cast, null);
          fValue = F.constant(dv);
        }

        // Default value can be null.
        root[namePriv] = dv;
        root[namePrivEval] = fValue;
      })();

      Object.defineProperty(root, name, {
        /*
         * Gets the _last_ set local value, or `undefined` if there has not been one.
         * Only at eval time does inheritance and combination come into play and
         * evaluate into an _effective_ value.
         *
         * @ignore
         */
        get: function() {
          return O.getOwn(this, namePriv);
        },

        /*
         * Combines a given value to the current local or inherited value.
         * Note that getting the value of the attribute always returns just the last set local value.
         *
         * When given a {@link Nully} value, it has no effect.
         *
         * @ignore
         */
        set: function(value) {
          // Cannot change the root value.
          // Testing this here, instead of after the descendants test,
          // because, otherwise, it would be very hard to test.
          if(this === root) return;

          this._assertNoSubtypesAttribute(name);

          // Cannot reset, using null or undefined (but can have a null default),
          //  cause it would break **monotonicity**.
          if(value == null) return;

          var fValue;
          if(F.is(value)) {
            fValue = value;
            if(cast) fValue = __wrapWithCast.call(this, fValue, cast, dv);
          } else {
            // When cast failure is found at static time, we ignore the local value.
            value = __castAndNormalize.call(this, value, cast, null);
            if(value == null) return;

            fValue = F.constant(value);
          }

          // Store the set value, so that get works consistently with set.
          // When combining with a previous local value, what should be stored in
          // this field? None is correct as the local value.
          // We just store the last set value, but be warned.
          this[namePriv] = value;

          // Create the private evaluate method.
          // Monotonicity requires using the inherited or previous value.
          // `this` is not root, so an ancestor exists.
          // Initially, there's no local namePrivEval,
          //  so this[namePrivEval] evaluates to the ancestor namePrivEval.
          // When ancestor is root, note that its namePrivEval is never null.
          this[namePrivEval] = monotoneCombineEvals(this[namePrivEval], fValue);
        }
      });

      // Handles passing the `owner` argument to the `this` context of the private eval method,
      // and the `this` context to the first argument...
      root[name + "On"] = function(owner) {
        return this[namePrivEval].call(owner, this);
      };
    },

    /**
     * Fills the given specification with this type's dynamic attributes' local values,
     * and returns whether any dynamic attribute was actually added.
     *
     * This method requires that there currently exists an
     * [ambient specification context]{@link pentaho.type.SpecificationContext.current}.
     *
     * This method calls the base implementation.
     * Then, it calls
     * [__fillSpecInContextDynamicAttribute]{@link pentaho.type.Type#__fillSpecInContextDynamicAttribute}
     * for each locally registered dynamic attribute.
     *
     * @param {!Object} spec - The specification to be filled.
     * @param {Object} [keyArgs] The keyword arguments object.
     * Passed to every type and instance serialized within this scope.
     *
     * @return {boolean} Returns `true` if the dynamic attribute was added; `false`, otherwise.
     *
     * @private
     *
     * @see pentaho.type.Type#_fillSpecInContext
     * @see pentaho.type.Type#__fillSpecInContextDynamicAttribute
     */
    __fillSpecInContextDynamicAttributes: function(spec, keyArgs) {

      var any = false;
      var type = this;

      fillSpecRecursive(type);

      return any;

      function fillSpecRecursive(declaringType) {

        if(!declaringType) return;

        if(declaringType !== __type) {
          // Ancestor, in properties, wouldn't reach __type.
          fillSpecRecursive(Object.getPrototypeOf(declaringType));
        }

        var dynAttrInfos = O.getOwn(declaringType, "__dynamicAttrInfos");
        if(dynAttrInfos) {
          dynAttrInfos.forEach(function(info) {
            if(type.__fillSpecInContextDynamicAttribute(spec,
                                                        info.name,
                                                        info.spec.group,
                                                        info.spec.localName,
                                                        info.spec.toSpec,
                                                        keyArgs)) {
              any = true;
            }
          });
        }
      }
    },

    /**
     * Fills the given specification with the local value of a dynamic attribute of this type
     * and returns whether the attribute was actually added.
     *
     * This method requires that there currently exists an
     * [ambient specification context]{@link pentaho.type.SpecificationContext.current}.
     *
     * @param {!Object} spec - The specification to be filled.
     * @param {string} name - The name of the dynamic attribute.
     * @param {string} group - The group name of the dynamic attribute.
     * @param {string} localName - The name of the dynamic attribute within the group.
     * @param {function(any, object) : any} toSpec - The custom serialization method of the dynamic attribute, if any,
     * is called to serialize a specified value of the dynamic attribute.
     * The method is called with the value and the keyArgs as arguments and with the property type as
     * the `this` context and should return the serialized value.
     * @param {Object} [keyArgs] The keyword arguments object.
     * Passed to every type and instance serialized within this scope.
     *
     * @return {boolean} Returns `true` if the dynamic attribute was added; `false`, otherwise.
     *
     * @private
     *
     * @see pentaho.type.Type#_fillSpecInContext
     * @see pentaho.type.Type#__fillSpecInContextDynamicAttributes
     */
    __fillSpecInContextDynamicAttribute: function(spec, name, group, localName, toSpec, keyArgs) {

      var namePriv = "__" + name;
      var any = false;

      var value = O.getOwn(this, namePriv);
      if(value != null) {
        var valueSpec;
        if(F.is(value)) {
          if(!keyArgs.isJson) {
            any = true;
            valueSpec = value.valueOf();
          }
        } else {
          any = true;
          valueSpec = toSpec ? toSpec.call(this, value, keyArgs) : value;
        }

        if(any) {
          var groupSpec;
          if(group) {
            groupSpec = spec[group] || (spec[group] = {});
          } else {
            groupSpec = spec;
          }

          groupSpec[localName || name] = valueSpec;
        }
      }

      return any;
    }
    // endregion
  }, /** @lends pentaho.type.Type */{

    // @override
    /*
     * Only takes effect in classes derived from this one.
     * See Base.js.
     * @ignore
     */
    _subclassed: function(SubTypeCtor, instSpec, classSpec, keyArgs) {

      O.setConst(this.prototype, "__hasDescendants", true);

      var SubInstCtor = keyArgs.instance.constructor;

      // Links SubTypeCtor and SubInstCtor and "implements" instSpec.
      SubTypeCtor._initInstCtor(SubInstCtor, instSpec, keyArgs);

      // Implement the given static interface, and record.
      if(classSpec) SubTypeCtor.implementStatic(classSpec);
    },

    // Links TypeCtor (this) and the given InstCtor together and
    // applies the TypeCtor constructor to its own prototype as a way to initialize it.
    // The constructor receives `instSpec` and ends up extending the prototype with it.
    // The static interface is not touched.
    //
    // NOTE: optionally this receives `keyArgs` as an optimization.
    // `_subclassed` is given a _derived_ `keyArgs`
    // that can/should be passed to `this`(constructor).
    _initInstCtor: function(InstCtor, instSpec, keyArgs) {

      O.setConst(InstCtor, "Type", this);

      this.call(this.prototype, instSpec, keyArgs || {instance: InstCtor.prototype});
    }
  });

  __type = Type.prototype;

  return Type;

  /*
   * @this {pentaho.type.PropertyType}
   */
  function __castAndNormalize(value, cast, defaultValue) {
    if(value == null) {
      value = defaultValue;
    } else if(cast) {
      value = cast.call(this, value, defaultValue);
      if(value == null)
        value = defaultValue;
    }

    return value;
  }

  /*
   * @this {pentaho.type.PropertyType}
   */
  function __wrapWithCast(fun, cast, defaultValue) {
    /*
     * @type {pentaho.type.spec.PropertyDynamicAttribute}
     */
    return function(propType) {

      var value = fun.apply(this, arguments);

      return __castAndNormalize.call(propType, value, cast, defaultValue);
    };
  }
});

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
  "require",
  "module",
  "./facets/Refinement",
  "./valueHelper",
  "../util/object",
  "../util/error",
  "../util/fun",
  "../i18n!types"
], function(localRequire, module, RefinementFacet, valueHelper, O, error, F, bundle) {

  "use strict";

  var _baseFacetsMid = module.id.replace(/refinement/, "facets/");

  return function(context) {

    var Value = context.get("pentaho/type/value"),
        _refinementMeta;

    /**
     * @name pentaho.type.Refinement.Meta
     * @class
     * @extends pentaho.type.Value.Meta
     *
     * @classDesc The type class of refinement types.
     *
     * For more information see {@link pentaho.type.Refinement}.
     */

    // Removed @extends pentaho.type.Value on purpose
    // so as to not misguide users on thinking that the inherited
    // instance members could ever be used...
    /**
     * @name pentaho.type.Refinement
     * @amd pentaho/type/refinement
     * @class
     *
     * @classDesc A refinement type represents a _refinement_ of a representation type.
     *
     * ### Representation types
     *
     * **Representation types** are the types that contribute to
     * an instance's implementation, or representation, and thus define its behavior.
     * Instances are created by the instance constructors of concrete representation types.
     *
     * The **representation types** of this system are
     * {@link pentaho.type.Element} and {@link pentaho.type.List}, and its subtypes.
     *
     * ### Refinement types
     *
     * On the contrary, **refinement types** are intrinsically **abstract**
     * and never _create_ instances (or are the base types of types that do).
     *
     * A refinement type reduces the set of **valid** instances of the associated representation type,
     * by requiring these to satisfy additional conditions.
     * The valid instances of the refinement type are a subset of the valid instances of its representation type.
     * It follows that, conceptually,
     * a refinement type is **an abstract subtype** of its (usually concrete) representation type.
     *
     * A refinement type can be used wherever its representation type can be:
     *
     * 1. as the [value type]{@link pentaho.type.Property.Meta#type} of a property, or
     * 2. as the [element type]{@link pentaho.type.List.Meta#of} of a list.
     *
     * Besides supporting refined validation,
     * refinement types are also useful to enable more refined type configuration.
     *
     * ### Instance interface
     *
     * The instance interface of a refinement type - represented by _this_ class - is meaningless.
     *
     * The fact that an instance constructor exists in this system is a matter of
     * uniformity and convenience.
     *
     * Calling the instance constructor
     * actually calls the representation type's instance constructor under the hood,
     * and returns a direct instance of it instead.
     *
     * ### Refinement type metadata
     *
     * A refinement type is a [Value]{@link pentaho.type.Value.Meta} type,
     * and, as such, metadata can be specified for it.
     *
     * Conveniently,
     * inheritable metadata attributes of a refinement type default to
     * the value of the same attributes of its representation type.
     *
     * The inheritable metadata attributes are
     * [label]{@link pentaho.type.Item.Meta#label},
     * [description]{@link pentaho.type.Item.Meta#description},
     * [category]{@link pentaho.type.Item.Meta#category},
     * [helpUrl]{@link pentaho.type.Item.Meta#helpUrl},
     * [browsable]{@link pentaho.type.Item.Meta#browsable},
     * [advanced]{@link pentaho.type.Item.Meta#advanced},
     * [ordinal]{@link pentaho.type.Item.Meta#ordinal}
     * and
     * [view]{@link pentaho.type.Value.Meta#view},
     *
     * Although the [styleClass]{@link pentaho.type.Item.Meta#styleClass} attribute
     * isn't inheritable,
     * the value of [inheritedStyleClasses]{@link pentaho.type.Item.Meta#inheritedStyleClasses}
     * of the representation type
     * is included in
     * the value of `inheritedStyleClasses`
     * of the refinement type.
     *
     * Although, conceptually, a refinement type is always abstract,
     * the refinement type's [abstract]{@link pentaho.type.Value.Meta#abstract} attribute,
     * instead, more usefully indicates whether its representation type is abstract or not.
     *
     * ### Defining a refinement type
     *
     * To define a refinement type call the [refine]{@link pentaho.type.Value.refine} method
     * of the representation type's instance constructor.
     *
     * An existing refinement type can be further refined simply by
     * calling its {@link pentaho.type.Refinement.extend} method.
     *
     * There are two ways to specify the additional validation constraints of a refinement type:
     *
     * 1. Override the [_validate]{@link pentaho.type.Refinement.Meta#_validate} method
     *    and perform arbitrary validation
     * 2. Mix any number of **refinement facets** into the refinement type,
     *    using property [facets]{@link pentaho.type.Refinement.Meta#facets},
     *    and specify the configuration attributes these define.
     *
     * The latter is the preferred method as the configuration attributes
     * defined by refinement facets can be used elsewhere,
     * for example, to add a UI control to directly constrain input values.
     *
     * ### Examples
     *
     * In the following example,
     * the refinement type `PositiveNumber` is defined using the `_validate` method:
     *
     * ```js
     * define(["module"], function(module) {
     *
     *   // return type factory
     *   return function(context) {
     *
     *     // Get the representation type's instance constructor
     *     var Number = context.get("number");
     *
     *     // Call its refine method and return the
     *     // newly created refinement type's instance constructor
     *     return Number.refine("my.PositiveNumber", {
     *       meta: {
     *         id: module.id,
     *         label: "Positive number",
     *
     *         _validate: function(num) {
     *           if(num <= 0)
     *             return [new Error("Not a positive number.")];
     *         }
     *       }
     *     });
     *   };
     *
     * });
     * ```
     *
     * In the following,
     * the same refinement type, <code>PositiveNumber</code>,
     * is defined using the refinement facet method instead,
     * making use of the provided refinement facet mixin,
     * {@link pentaho.type.facets.OrdinalDomain}:
     *
     * ```js
     * define(["module"], function(module) {
     *
     *   // return type factory
     *   return function(context) {
     *
     *     // Get the representation type's instance constructor
     *     var Number = context.get("number");
     *
     *     // Call its refine method and return the
     *     // newly created refinement type's instance constructor
     *     return Number.refine("my.PositiveNumber", {
     *       meta: {
     *         id: module.id,
     *         label: "Positive number",
     *
     *         // Mixin desired refinement facets
     *         facets: ["ordinalDomain"],
     *
     *         // Configure facet attributes
     *         min: 0,
     *         minInclusive: false
     *       }
     *     });
     *   };
     *
     * });
     * ```
     *
     * Refinement types can also be defined inline, as the following example shows:
     *
     * ```js
     * define(["module"], function(module) {
     *
     *   // return type factory
     *   return function(context) {
     *
     *     // Get the base type's instance constructor
     *     var Complex = context.get("complex");
     *
     *     // Define a complex type
     *     return Complex.extend("my.Product", {
     *       meta: {
     *         id: module.id,
     *         label: "My Product",
     *
     *         props: [
     *           {
     *             name:  "id",
     *             label: "Product Id",
     *             type:  "string",
     *             required: true
     *           },
     *           {
     *             name:  "price",
     *             label: "Product Unit Price",
     *             type: {
     *               base:   "refinement",
     *               of:     "number",
     *               facets: ["ordinalDomain"],
     *               min:    0
     *             },
     *             required: true
     *           }
     *         ]
     *       }
     *     });
     *   };
     *
     * });
     * ```
     *
     * @description The constructor of a refinement type always returns instances of the representation type.
     *
     * @see https://en.wikipedia.org/wiki/Refinement_(computing)#Refinement_types
     */
    var Refinement = Value.extend("pentaho.type.Refinement", {

      // Constructor always returns a mesa instance of `of`.
      constructor: function() {
        var refinedMeta = this.meta.of;
        return refinedMeta.create.apply(refinedMeta, arguments);
      },

      // TODO: implement inheritedStyleClasses

      meta: /** @lends pentaho.type.Refinement.Meta# */{

        // Note: constructor/_init only called on sub-classes of Refinement.Meta,
        // and not on Refinement.Meta itself.
        _init: function(instSpec) {
          this.base.apply(this, arguments);

          // Anticipate application of the refined type
          var of = instSpec.of;
          if(of) {
            // Ugly but effective in not processing the property twice...
            delete instSpec.of;

            this.of = of;

          } else if(!this._of) {
            // Required validation
            this.of = null; // throws...
          }

          // Anticipate application of the refinement facet types
          // so that other instSpec properties can use attributes these mix in.
          var facets = instSpec.facets;
          if(facets) {
            // Ugly but effective in not processing the property twice...
            delete instSpec.facets;

            this.facets = facets;
          }
        },

        id: module.id,

        //region facets property
        _facets: [],

        /**
         * Gets the refinement facet classes that are mixed in this refinement type.
         *
         * @type Array.<pentaho.type.RefinementFacet>
         * @readonly
         */
        get facets() {
          return this._facets;
        },

        // for configuration only
        set facets(values) {
          var facets = O.getOwn(this, "_facets");
          if(!facets)
            facets = this._facets = this._facets.slice();

          // Add new refinements from values
          if(Array.isArray(values))
            values.forEach(addRefinement, this);
          else
            addRefinement.call(this, values);

          function addRefinement(Facet) {
            if(typeof Facet === "string") {
              Facet = resolveFacet(Facet);
            }

            if(!F.is(Facet) || !(Facet.prototype instanceof RefinementFacet))
              throw error.argInvalidType("facets", "pentaho/type/facets/Refinement");

            if(facets.indexOf(Facet) < 0) {
              facets.push(Facet);

              // Only mixing the instance part.
              // Static part contains the validate method called on each mixin at validation.
              this.extend(Facet.prototype);
            }
          }

          function resolveFacet(id) {
            if(id.indexOf("/") < 0)
              id = _baseFacetsMid + id;

            return localRequire(id);
          }
        },
        //endregion

        //region of property
        _of: null,

        /**
         * Gets the representation type refined by this refinement type.
         *
         * @type {!(pentaho.type.Element.Meta|pentaho.type.List.Meta)}
         * @readonly
         */
        get of() {
          return this._of;
        },

        // construction only
        set of(value) {
          if(value == null) throw error.argRequired("of");

          // Value returns refinement === undefined...
          var ofMeta = this.context.get(value).meta;
          if(ofMeta.refinement !== false)
            throw error.argInvalidType("of", ["pentaho/type/element", "pentaho/type/list"]);

          // Throws when set again with a different value.
          O.setConst(this, "_of", ofMeta);
        },
        //endregion

        //region abstract property
        // TODO: Rhino probably gives a syntax error on this.
        // However, cannot use the `get "abstract"()` syntax cause then Phantom JS 1.9.8 starts failing
        /**
         * Gets a value that indicates if this type is abstract.
         *
         * This implementation is sealed and always returns
         * the value of the representation type.
         *
         * @type {boolean}
         * @readOnly
         * @sealed
         */
        get abstract() {
          return this.of["abstract"];
        },

        set abstract(value) {
          // nully is reset, which is false, so !! works well.
          if((!!value) !== this["abstract"])
            throw error.operInvalid("Attribute cannot be changed.");
        },
        //endregion

        //region list property
        //@override
        /**
         * Gets a value that indicates if this type is a list type.
         *
         * This implementation is sealed and always returns
         * the value of the representation type.
         *
         * @type boolean
         * @readOnly
         * @sealed
         */
        get list() {
          return this.of.list;
        },
        //endregion

        //region refinement property
        /**
         * Gets a value that indicates if this type is a refinement type.
         *
         * This implementation is sealed and always returns `true`.
         *
         * @type boolean
         * @readOnly
         * @sealed
         */
          // Providing a default implementation is less code
        get refinement() {
          return true;
        },
        //endregion

        /**
         * Determines if this is a subtype of another.
         *
         * A type is considered a subtype of itself.
         *
         * A refinement type is a subtype of its representation type, [of]{@link pentaho.type.Refinement.Meta#of}.
         *
         * @param {?pentaho.type.Item.Meta} superType The candidate super-type.
         * @return {boolean} `true` if this is a subtype of `superType` type, `false` otherwise.
         */
        isSubtypeOf: function(superType) {
          return !!superType && (this.base(superType) || this.of.isSubtypeOf(superType));
        },

        //region label property
        _label: undefined, // local Refinement root marker

        get label() {
          var v = this._label;
          return v !== undefined ? v : this.of.label;
        },

        _resetLabel: function() {
          if(this !== _refinementMeta) {
            this.base();
          }
        },
        //endregion

        //region description property
        _description: undefined, // local Refinement root marker

        get description() {
          var v = this._description;
          return v !== undefined ? v : this.of.description;
        },

        _resetDescription: function() {
          if(this !== _refinementMeta) {
            this.base();
          }
        },
        //endregion

        //region category property
        _category: undefined, // local Refinement root marker

        get category() {
          var v = this._category;
          return v !== undefined ? v : this.of.category;
        },

        _resetCategory: function() {
          if(this !== _refinementMeta) {
            this.base();
          }
        },
        //endregion

        //region helpUrl property
        _helpUrl: undefined, // local Refinement root marker

        get helpUrl() {
          var v = this._helpUrl;
          return v !== undefined ? v : this.of.helpUrl;
        },

        _resetHelpUrl: function() {
          if(this !== _refinementMeta) {
            this.base();
          }
        },
        //endregion

        //region browsable property
        _browsable: undefined, // local Refinement root marker

        get browsable() {
          var v = this._browsable;
          return v !== undefined ? v : this.of.browsable;
        },

        _resetBrowsable: function() {
          if(this !== _refinementMeta) {
            this.base();
          }
        },
        //endregion

        //region advanced property
        _advanced: undefined, // local Refinement root marker

        get advanced() {
          var v = this._advanced;
          return v !== undefined ? v : this.of.advanced;
        },

        _resetAdvanced: function() {
          if(this !== _refinementMeta) {
            this.base();
          }
        },
        //endregion

        //region styleClass
        // Local property requires no change to implementation.
        // The function that collects all classes will need to be overridden though.
        //endregion

        //region ordinal property
        _ordinal: undefined, // local Refinement root marker

        get ordinal() {
          var v = this._ordinal;
          return v !== undefined ? v : this.of.ordinal;
        },

        _resetOrdinal: function() {
          if(this !== _refinementMeta) {
            this.base();
          }
        },
        //endregion

        //region view property
        _view: undefined, // local Refinement root marker

        get view() {
          var v = this._view;
          return v !== undefined ? (v && v.value) : this.of.view;
        },

        _resetView: function() {
          if(this !== _refinementMeta) {
            this.base();
          }
        },
        //endregion

        // Redirect to of.
        is: function(value) {
          return this.of.is(value);
        },

        // Redirect to of.
        create: function() {
          return this.of.create.apply(this.of, arguments);
        },

        //region validation

        //@override
        /**
         * Determines if a value,
         * that _is an instance of this type_,
         * is also a **valid instance** of this (and its) type.
         *
         * Thus, `this.is(value)` must be true.
         *
         * The default implementation calls `value.validate()` and,
         * if the latter returns no errors,
         * additionally validates the value against this type's refinement conditions,
         * by calling [_validate]{@link pentaho.type.Refinement.Meta#_validate}.
         *
         * @param {!pentaho.type.Value} value The value to validate.
         *
         * @return {?Array.<!Error>} A non-empty array of `Error` or `null`.
         *
         * @overridable
         *
         * @see pentaho.type.Value#validate
         * @see pentaho.type.Value.Meta#validate
         * @see pentaho.type.Refinement.Meta#_validate
         */
        validateInstance: function(value) {
          var errors = this.base(value);
          if(errors) return errors;

          return valueHelper.normalizeErrors(this._validate(value));
        },

        //@override
        /**
         * Determines if a value that
         * _is an instance of this type_ and
         * _a valid instance of its actual type_
         * is also a **valid instance** of this refinement type.
         *
         * Thus, `this.is(value)` and `value.meta.isValid(value)` must be true.
         *
         * The default implementation validates `value` against
         * registered refinement facets.
         *
         * @param {!pentaho.type.Value} value The value to validate.
         *
         * @return {Nully|Error|Array.<!Error>} An `Error`, a non-empty array of `Error` or a `Nully` value.
         *
         * @protected
         * @overridable
         *
         * @see pentaho.type.Value.Meta#validate
         * @see pentaho.type.Refinement.Meta#validateInstance
         */
        _validate: function(value) {
          return this._validateFacets(value);
        },

        /**
         * Determines if a value that
         * _is an instance of this type_ and
         * _a valid instance of its actual type_
         * is also a valid instance of this refinement type,
         * according to the registered refinement facets.
         *
         * For all registered refinement facets,
         * their [validate]{@link pentaho.type.facets.RefinementFacet.validate} method
         * is called and any reported errors collected.
         *
         * This method is called by the default implementation of
         * [_validate]{@link pentaho.type.Refinement.Meta#_validate}.
         * It is provided just in case you need to override the latter implementation.
         *
         * @param {!pentaho.type.Value} value The value to validate.
         *
         * @return {?Array.<!Error>} An array of `Error` or `null`.
         *
         * @protected
         * @ignore
         */
        _validateFacets: function(value) {
          return this.facets.reduce(function(errors, Facet) {
            return valueHelper.combineErrors(errors, Facet.validate.call(this, value));
          }.bind(this), null);
        }
        //endregion
      }
    }, /** @lends pentaho.type.Refinement */{
      _extend: function(name, instSpec) {

        // Refinement types cannot specify any instance property.
        for(var p in instSpec) // nully tolerant
          if(p !== "meta")
            throw error.operInvalid(bundle.structured.errors.refinement.cannotExtendInstance);

        return this.base.apply(this, arguments);
      }
    },
    /*keyArgs:*/{
      isRoot: true
    });

    _refinementMeta = Refinement.meta;

    return Refinement;
  };
});
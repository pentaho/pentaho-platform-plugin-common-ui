/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "./util",
  "../util/object",
  "../util/error",
  "../util/fun",
  "../i18n!types"
], function(localRequire, module, RefinementFacet, typeUtil, O, error, F, bundle) {

  "use strict";

  var _baseFacetsMid = module.id.replace(/refinement/, "facets/");

  return function(context) {

    var Value = context.get("pentaho/type/value");
    var _refinementType;

    /**
     * @name pentaho.type.Refinement.Type
     * @class
     * @extends pentaho.type.Value.Type
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
     * @amd {pentaho.type.Factory<pentaho.type.Refinement>} pentaho/type/refinement
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
     * {@link pentaho.type.Element} and {@link pentaho.type.List} and its subtypes.
     *
     * ### Refinement types
     *
     * On the contrary, **refinement types** are intrinsically **abstract** and never _create_ instances.
     * Refinement types are also never the base types of types that do _create_ instances.
     *
     * A refinement type reduces the set of **valid** instances of the associated representation type,
     * by requiring these to satisfy additional conditions.
     * The valid instances of the refinement type are a subset of the valid instances of its representation type.
     * It follows that, conceptually,
     * a refinement type is **an abstract subtype** of its (usually concrete) representation type.
     *
     * A refinement type can be used wherever its representation type can be:
     *
     * 1. As the [value type]{@link pentaho.type.Property.Type#type} of a property
     * 2. As the [element type]{@link pentaho.type.List.Type#of} of a list
     *
     * Besides supporting refined validation,
     * refinement types are also useful to enable more refined type configuration.
     *
     * ### Instance interface
     *
     * The instance interface of a refinement type, represented by _this_ class, is meaningless.
     *
     * The fact that an instance constructor exists in this system is a matter of
     * uniformity and convenience.
     *
     * Calling the instance constructor
     * actually calls the representation type's instance constructor under the hood,
     * and returns a direct instance of it instead.
     *
     * ### Attributes of refinement types
     *
     * A refinement type is a [Value]{@link pentaho.type.Value.Type} type
     * and, as such, metadata can be specified for it.
     *
     * Conveniently,
     * inheritable metadata attributes of a refinement type default to
     * the value of the same attributes of its representation type.
     *
     * The inheritable metadata attributes are
     * [label]{@link pentaho.type.Type#label},
     * [description]{@link pentaho.type.Type#description},
     * [category]{@link pentaho.type.Type#category},
     * [helpUrl]{@link pentaho.type.Type#helpUrl},
     * [isBrowsable]{@link pentaho.type.Type#isBrowsable},
     * [isAdvanced]{@link pentaho.type.Type#isAdvanced},
     * [ordinal]{@link pentaho.type.Type#ordinal}
     * and
     * [defaultView]{@link pentaho.type.Value.Type#defaultView},
     *
     * Although the [styleClass]{@link pentaho.type.Type#styleClass} attribute
     * is not inheritable,
     * the value of [inheritedStyleClasses]{@link pentaho.type.Type#inheritedStyleClasses}
     * of the representation type
     * is included in
     * the value of `inheritedStyleClasses`
     * of the refinement type.
     *
     * Although, conceptually, a refinement type is always abstract,
     * the refinement type's [isAbstract]{@link pentaho.type.Value.Type#isAbstract} attribute,
     * instead, more usefully indicates whether its representation type is abstract or not.
     *
     * ### Defining a refinement type
     *
     * To define a refinement type, call the [refine]{@link pentaho.type.Value.refine} method
     * of the representation type's instance constructor.
     *
     * An existing refinement type can be further refined simply by
     * calling its {@link pentaho.type.Refinement.extend} method.
     *
     * There are two ways to specify the additional validation constraints of a refinement type:
     *
     * 1. Override the [validateInstance]{@link pentaho.type.Refinement.Type#validateInstance} method
     *    and perform arbitrary validation.
     * 2. Mix any number of **refinement facets** into the refinement type,
     *    using property [facets]{@link pentaho.type.Refinement.Type#facets},
     *    and specify the configuration attributes these define.
     *
     * The latter is the preferred method since the configuration attributes
     * defined by refinement facets can be used elsewhere.
     * For example, to add a UI control to directly constrain input values.
     *
     * ### Examples
     *
     * In the following example,
     * the refinement type `PositiveNumber` is defined using the `validateInstance` method:
     *
     * ```js
     * define(["module", "pentaho/type/ValidationError"], function(module, ValidationError) {
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
     *       type: {
     *         id: module.id,
     *         label: "Positive number",
     *
     *         validateInstance: function(num) {
     *           var errors = this.base(num);
     *           if(!errors) {
     *             if(num <= 0) errors = [new ValidationError("Not a positive number.")];
     *           }
     *           return errors;
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
     *       type: {
     *         id: module.id,
     *         label: "Positive number",
     *
     *         // Mixin desired refinement facets
     *         facets: ["OrdinalDomain"],
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
     *     return Complex.extend({
     *       type: {
     *         id: module.id,
     *         label: "My Product",
     *
     *         props: [
     *           {
     *             name:  "id",
     *             label: "Product Id",
     *             type:  "string",
     *             isRequired: true
     *           },
     *           {
     *             name:  "price",
     *             label: "Product Unit Price",
     *             type: {
     *               base:   "refinement",
     *               of:     "number",
     *               facets: ["OrdinalDomain"],
     *               min:    0
     *             },
     *             isRequired: true
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
    var Refinement = Value.extend({

      // Constructor always returns an instance Instance of type `of`.
      constructor: function() {
        var refinedType = this.type.of;
        return refinedType.create.apply(refinedType, arguments);
      },

      // TODO: implement inheritedStyleClasses

      type: /** @lends pentaho.type.Refinement.Type# */{

        // Anticipate extend of these properties
        extend_order: ["of", "facets"],

        // Note: constructor/_init only called on sub-classes of Refinement.Type,
        // and not on Refinement.Type itself.
        /** @inheritDoc */
        _init: function(instSpec) {
          this.base.apply(this, arguments);

          // Anticipate `of` validation
          if(!instSpec.of && !this._of) {
            // Required validation
            this.of = null; // throws...
          }
        },

        id: module.id,
        alias: "refinement",

        // region facets property
        _facets: [],

        /**
         * Gets or sets the refinement facet classes
         * that are mixed in this refinement type.
         *
         * Can be set to either refinement facet identifiers or classes,
         * to add facets to the refinement type.
         *
         * The attributes defined by the added refinement facets become available for
         * extension/configuration on the refinement type.
         *
         * @type {Array.<pentaho.type.RefinementFacet>}
         *
         * @see pentaho.type.spec.IRefinementTypeProto#facets
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
            /* jshint validthis:true*/

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
        // endregion

        // region of property
        _of: null,

        /**
         * Gets or sets the representation type refined by this refinement type.
         *
         * When set to a {@link Nully} value, an error is thrown.
         *
         * Must and can only be specified at a top-refinement type, upon definition.
         *
         * @type {!(pentaho.type.Element.Type|pentaho.type.List.Type)}
         *
         * @see pentaho.type.spec.IRefinementTypeProto#of
         */
        get of() {
          return this._of;
        },

        // construction only
        set of(value) {
          if(value == null) throw error.argRequired("of");

          // Must be a non-refinement, Value strict subtype.
          var ofType = this.context.get(value).type;
          var isValid = ofType !== Value.type && ofType.isSubtypeOf(Value.type) && !ofType.isRefinement;
          if(!isValid)
            throw error.argInvalidType("of", ["pentaho/type/element", "pentaho/type/list"]);

          // Throws when set again with a different value.
          O.setConst(this, "_of", ofType);
        },
        // endregion

        // region isAbstract property
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
        get isAbstract() {
          var of = this.of;
          return !of || of.isAbstract;
        },
        // endregion

        get isRefinement() {
          return true;
        },

        get isContainer() {
          var of = this.of;
          return !!of && of.isContainer;
        },

        get isList() {
          var of = this.of;
          return !!of && of.isList;
        },

        get isElement() {
          var of = this.of;
          return !!of && of.isElement;
        },

        get isComplex() {
          var of = this.of;
          return !!of && of.isComplex;
        },

        get isSimple() {
          var of = this.of;
          return !!of && of.isSimple;
        },

        /**
         * Determines if this is a subtype of another.
         *
         * A type is considered a subtype of itself.
         *
         * A refinement type is a subtype of its representation type, [of]{@link pentaho.type.Refinement.Type#of}.
         *
         * @param {?pentaho.type.Type} superType - The candidate super-type.
         * @return {boolean} `true` if this is a subtype of `superType` type; `false`, otherwise.
         */
        isSubtypeOf: function(superType) {
          var of;
          return !!superType && (this.base(superType) || (!!(of = this.of) && of.isSubtypeOf(superType)));
        },

        // region label property
        _label: undefined, // local Refinement root marker

        get label() {
          var of;
          var v = this._label;
          return v !== undefined || !(of = this.of) ? v : of.label;
        },

        _resetLabel: function() {
          if(this !== _refinementType) {
            this.base();
          }
        },
        // endregion

        // region description property
        _description: undefined, // local Refinement root marker

        get description() {
          var of;
          var v = this._description;
          return v !== undefined || !(of = this.of) ? v : of.description;
        },

        _resetDescription: function() {
          if(this !== _refinementType) {
            this.base();
          }
        },
        // endregion

        // region category property
        _category: undefined, // local Refinement root marker

        get category() {
          var of;
          var v = this._category;
          return v !== undefined || !(of = this.of) ? v : of.category;
        },

        _resetCategory: function() {
          if(this !== _refinementType) {
            this.base();
          }
        },
        // endregion

        // region helpUrl property
        _helpUrl: undefined, // local Refinement root marker

        get helpUrl() {
          var of;
          var v = this._helpUrl;
          return v !== undefined || !(of = this.of) ? v : of.helpUrl;
        },

        _resetHelpUrl: function() {
          if(this !== _refinementType) {
            this.base();
          }
        },
        // endregion

        // region isBrowsable property
        _isBrowsable: undefined, // local Refinement root marker

        get isBrowsable() {
          var of;
          var v = this._isBrowsable;
          return v !== undefined || !(of = this.of) ? v : of.isBrowsable;
        },

        _resetIsBrowsable: function() {
          if(this !== _refinementType) {
            this.base();
          }
        },
        // endregion

        // region isAdvanced property
        _isAdvanced: undefined, // local Refinement root marker

        get isAdvanced() {
          var of;
          var v = this._isAdvanced;
          return v !== undefined || !(of = this.of) ? v : of.isAdvanced;
        },

        _resetIsAdvanced: function() {
          if(this !== _refinementType) {
            this.base();
          }
        },
        // endregion

        // region styleClass
        // Local property requires no change to implementation.

        get inheritedStyleClasses() {
          var of;
          var styleClasses = this.base();
          // 'pentaho-type-instance',
          // 'pentaho-type-value',
          // 'pentaho-type-refinement',
          // 'foo-refinement'

          if((of = this.of)) {
            // The first two base types would be repeated with `of`...
            // 'pentaho-type-instance',
            // 'pentaho-type-value',
            // 'pentaho-type-simple',
            // 'pentaho-type-string',
            // 'pentaho-type-refinement',
            // 'foo-refinement'
            styleClasses = of.inheritedStyleClasses.concat(styleClasses.slice(2));
          }

          return styleClasses;
        },
        // endregion

        // region ordinal property
        _ordinal: undefined, // local Refinement root marker

        get ordinal() {
          var of;
          var v = this._ordinal;
          return v !== undefined || !(of = this.of) ? v : of.ordinal;
        },

        _resetOrdinal: function() {
          if(this !== _refinementType) {
            this.base();
          }
        },
        // endregion

        // region view property
        _defaultView: undefined, // local Refinement root marker

        get defaultView() {
          var of;
          var v = this._defaultView;
          return v !== undefined || !(of = this.of) ? (v && v.value) : of.defaultView;
        },

        _resetDefaultView: function() {
          if(this !== _refinementType) {
            this.base();
          }
        },
        // endregion

        // Redirect to of.
        is: function(value) {
          var of = this.of;
          return !!of && of.is(value);
        },

        // Redirect to of.
        create: function() {
          var of = this.of;
          if(!of) this._throwAbstractType();

          return of.create.apply(of, arguments);
        },

        // region validation
        /**
         * Determines if a value,
         * that _is an instance of this type_,
         * is also a **valid instance** of this (and its) type.
         *
         * Thus, `this.is(value)` must be true.
         *
         * The default implementation calls `value.validate()` and,
         * if the latter returns no errors,
         * it additionally validates the value against this type's refinement facets,
         * by calling [_validateFacets]{@link pentaho.type.Refinement.Type#_validateFacets}.
         *
         * @param {!pentaho.type.Value} value - The value to validate.
         *
         * @return {?Array.<!pentaho.type.ValidationError>} A non-empty array of errors or `null`.
         *
         * @see pentaho.type.Value#validate
         * @see pentaho.type.Refinement.Type#_validateFacets
         */
        validateInstance: function(value) {
          var errors = value.validate();
          if(errors) return errors;

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
         * [validateInstance]{@link pentaho.type.Refinement.Type#validateInstance}.
         * It is provided just in case you need to override the latter implementation.
         *
         * @param {!pentaho.type.Value} value - The value to validate.
         *
         * @return {?Array.<!pentaho.type.ValidationError>} An array of errors or `null`.
         *
         * @protected
         */
        _validateFacets: function(value) {
          return this.facets.reduce(function(errors, Facet) {
            return typeUtil.combineErrors(errors, Facet.validate.call(this, value));
          }.bind(this), null);
        },
        // endregion

        // region serialization
        /** @inheritDoc */
        _fillSpecInContext: function(spec, keyArgs) {
          var any = false;

          var ofType = O.getOwn(this, "_of");
          if(ofType) {
            any = true;
            spec.of = ofType.toRefInContext(keyArgs);
          }

          // "facets" attribute
          var facets = this.facets;
          var L = facets.length;
          var i;

          // Include only "facets" added locally, not inherited ones.
          // Local facets are placed after inherited facets.
          if(this !== _refinementType && (i = this.ancestor._facets.length) < L) {
            any = true;
            var localFacetIds = spec.facets = [];
            do { localFacetIds.push(facets[i].shortId); } while(++i < L);
          }

          // Base attributes
          any = this.base(spec, keyArgs) || any;

          // All facets' local attributes
          i = -1;
          while(++i < L)
            any = facets[i].fillSpecInContext.call(this, spec, keyArgs) || any;

          return any;
        }
        // endregion
      }
    }, /** @lends pentaho.type.Refinement */{
      // override the documentation to specialize the argument types.
      /**
       * Creates a subtype of this one.
       *
       * For more information on class extension, in general,
       * see {@link pentaho.lang.Base.extend}.
       *
       * @name extend
       * @memberOf pentaho.type.Refinement
       * @method
       *
       * @param {string} [name] The name of the created class; used for debugging purposes.
       * @param {{type: pentaho.type.spec.IRefinementTypeProto}} [instSpec] The refinement type specification.
       * @param {Object} [classSpec] The static specification.
       * @param {Object} [keyArgs] The keyword arguments.
       *
       * @return {!Class.<pentaho.type.Refinement>} The new refinement instance subclass.
       *
       * @see pentaho.lang.Value.extend
       */

      _extend: function(name, instSpec) {

        // Refinement types cannot specify any instance property.
        if(instSpec) {
          for(var p in instSpec)
            if(p !== "type")
              throw error.operInvalid(bundle.structured.errors.refinement.cannotExtendInstance);

          var typeSpec = instSpec.type;
          if(typeSpec && typeSpec.instance)
            throw error.operInvalid(bundle.structured.errors.refinement.cannotExtendInstance);

        }

        return this.base.apply(this, arguments);
      }
    }, /* keyArgs: */{
      isRoot: true
    });

    _refinementType = Refinement.type;

    return Refinement;
  };
});

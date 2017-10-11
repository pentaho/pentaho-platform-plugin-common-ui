/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "./Cell",
  "./Member",
  "./StructurePosition",
  "./MemberCollection",
  "../lang/_Annotatable",
  "../lang/Base",
  "../util/arg",
  "../util/error",
  "../util/date"
], function(Cell, Member, StructurePosition, MemberCollection, Annotatable, Base, arg, error, date) {

  var Attribute = Base.extend("pentaho.data.Attribute", /** @lends pentaho.data.Attribute# */{
    /**
     * @alias Attribute
     * @memberOf pentaho.data
     * @class
     * @ignore
     *
     * @implements pentaho.lang.ISpecifiable
     * @implements pentaho.lang.IAnnotatable
     * @implements pentaho.lang.IListElement
     * @implements pentaho.lang.IWithKey
     *
     * @classDesc The `Attribute` class represents an attribute that can be
     * attributed to entities of a model.
     *
     * Attributes and their values can be attributed to an entity to form a description of it.
     *
     * An attribute is an {@link pentaho.lang.IAnnotatable}.
     * As such, any desired data can be associated with it.
     *
     * The following are standard annotations recognized in attributes:
     * 1. "color" - a string with the preferred color of the attribute;
     *     visualizations may use this color, when appropriate,
     *     to enable easy distinction between the attributes' representations
     * 2. "geoRole" - a string with either one of the standard geographical roles,
     *     {@link pentaho.data.WellKnownGeoRole},
     *     or a custom one.
     *
     * ### AMD
     *
     * To obtain the constructor of this class,
     * require the module `"pentaho/data/Attribute"`.
     *
     * @description Creates an attribute.
     *
     * @param {pentaho.data.spec.IAttribute} spec The specification of the attribute.
     * @param {!Object} keyArgs The keyword arguments.
     * @param {number} keyArgs.ordinal The ordinal of the attribute in its model's attribute collection.
     */
    constructor: function(spec, keyArgs) {

      if(typeof spec === "string") spec = {name: spec};

      this._ord = arg.required(keyArgs, "ordinal", "keyArgs");

      /**
       * Gets the name of the attribute.
       *
       * Identifies an attribute within its model's attribute collection.
       *
       * Cannot be an empty string, `""`.
       *
       * @type string
       * @readonly
       */
      this.name = spec.name;
      if(!this.name) throw error.argRequired("spec.name");

      /**
       * Gets the label of the attribute, if it has one, or `undefined`, otherwise.
       *
       * @type string|undefined
       * @readonly
       */
      this.label = spec.label != null ? spec.label : undefined;

      /**
       * Gets the format provider of the attribute, if it has one, or `null`, otherwise.

       * @type ?pentaho.data.spec.IFormatProvider
       */
      this.format = spec.format || null;

      var type = spec.type;
      if(!type) {
        type = "string";
      } else {
        type = type.toLowerCase();

        if(type === "datetime")
          type = "date";
      }

      /**
       * Gets the name of the type of the attribute.
       *
       * @type !pentaho.data.AtomicTypeName
       * @readonly
       */
      this.type = type;

      var isDiscrete = type !== "number" && type !== "date";
      if(!isDiscrete && spec.isDiscrete != null)
        isDiscrete = !!spec.isDiscrete;

      /**
       * Indicates if the attribute is considered discrete.
       *
       * When the attribute's type is one of
       * {@link pentaho.data.AtomicTypeName.STRING} or
       * {@link pentaho.data.AtomicTypeName.BOOLEAN}
       * this property is always `true`.
       *
       * A non-discrete attribute is said to be a _continuous_ attribute.
       *
       * @type boolean
       * @readonly
       * @see pentaho.data.Attribute#type
       * @see pentaho.data.Attribute#members
       * @see pentaho.data.Attribute#isPercent
       */
      this.isDiscrete = isDiscrete;

      this._cast = type === "number" ? castToNumber : (type === "date" ? date.parseDateEcma262v7 : identity);

      var attrKeyArgs = {attribute: this, ordinal: 0};

      this.memberBase = new Member.Adhoc({v: ""}, attrKeyArgs);
      this.cellBase = new Cell.Adhoc({}, attrKeyArgs);
      this.structurePositionBase = new StructurePosition.Adhoc(attrKeyArgs);

      if(isDiscrete) {
        /**
         * Gets the members collection of the attribute.
         *
         * This property is only defined when the attribute is discrete,
         * in which case it is never `null`.
         *
         * The position of members in the members collection **is relevant**.
         * It conveys a partial ordering of the contained attribute members.
         * See also {@link pentaho.data.Member#ordinal}.
         *
         * @type pentaho.data.MemberCollection
         * @readonly
         * @see pentaho.data.Attribute#isDiscrete
         */
        this.members = MemberCollection.to(spec.members || [], attrKeyArgs);
      } else if(type === "number") {
        /**
         * Indicates if the attribute represents
         * a numeric value that is a percentage of something.
         *
         * This property is relevant only for attributes of type
         * {@link pentaho.data.AtomicTypeName.NUMBER}.
         *
         * @type boolean
         * @readonly
         * @see pentaho.data.Attribute#type
         */
        this.isPercent = spec.isPercent != null && !!spec.isPercent;
      }

      Annotatable.call(this, spec);
    },

    // region IListElement
    /**
     * Gets the singular name of `Attribute` list-elements.
     * @type string
     * @readonly
     * @default "attribute"
     */
    elemName: "attribute",
    // endregion

    // region IWithKey implementation
    /**
     * Gets the singular name of `Attribute` keys.
     * @type string
     * @readonly
     * @default "name"
     */
    keyName: "name",

    /**
     * Gets the key of the attribute.
     *
     * The key of an attribute is its name.
     *
     * @type string
     * @readonly
     */
    get key() {
      return this.name;
    },
    // endregion

    // region IWithOrdinal implementation
    /**
     * Gets the ordinal of the attribute in its model's attributes collection.
     *
     * The ordinal of an attribute conveys a partial ordering of the attributes of its model.
     *
     * @type number
     * @readonly
     */
    get ordinal() {
      return this._ord;
    },
    // endregion

    /**
     * Gets the measurement level of this attribute.
     *
     * One of the values: `"nominal"`, `"ordinal"`, `"quantitative"`.
     *
     * @type {string}
     * @readOnly
     */
    get level() {
      return this.isDiscrete ? "ordinal" : "quantitative";
    },

    /**
     * Converts a value to the type of value supported by the attribute.
     *
     * If the given value is not supported, `null` is returned.
     *
     * @param {any} v - The value to cast.
     * @return {any} The converted value or `null`, when invalid.
     */
    cast: function(v) {
      return this._cast(v);
    },

    /**
     * Converts a member specification to a member of this attribute.
     *
     * @param {!(pentaho.data.spec.IMember|pentaho.data.Atomic)} memberSpec A member specification
     *     or, directly, a member's atomic value.
     * @param {!Object} keyArgs The keyword arguments.
     * @param {number} keyArgs.ordinal The ordinal of the member in the attribute's member collection.
     * @return {pentaho.data.Member} A member of this attribute.
     */
    toMemberOf: function(memberSpec, keyArgs) {
      if(memberSpec == null) throw error.argRequired("memberSpec");
      if(typeof memberSpec !== "object") memberSpec = {v: memberSpec};

      var member = Object.create(this.memberBase);
      Member.call(member, memberSpec, keyArgs);
      return member;
    },

    /**
     * Converts a cell specification to a cell of this attribute.
     *
     * @param {pentaho.data.spec.ICell|pentaho.data.Atomic} cellSpec A cell specification
     *     or, directly, a cell's value, possibly _nully_.
     * @return {pentaho.data.Cell} A cell of this attribute.
     */
    toCellOf: function(cellSpec) {
      var cell = Object.create(this.cellBase);
      Cell.call(cell, cellSpec);
      return cell;
    },

    // @ignore Structure and StructurePosition are not documented.
    /**
     * @ignore
     *
     * @description Creates structure position of this attribute.
     *
     * Preferably,
     * to create a structure position,
     * method {@link pentaho.data.StructurePosition.to} should
     * be used instead.
     *
     * @param {!Object} keyArgs The keyword arguments.
     * @param {number} keyArgs.ordinal The ordinal of the structure position.
     *
     * @return {pentaho.data.StructurePosition} A structure position of this attribute.
     */
    toStructurePositionOf: function(keyArgs) {
      var structPos = Object.create(this.structurePositionBase);
      StructurePosition.call(structPos, keyArgs);
      return structPos;
    },

    // region ISpecifiable implementation
    /**
     * Creates a specification of the attribute.
     *
     * @return {pentaho.data.spec.IAttribute} A new specification of the attribute.
     */
    toSpec: function() {
      var attrSpec = {
        name:  this.name,
        label: this.label,
        type:  this.type,
        format: this.format
      };

      if(this.isDiscrete)
        attrSpec.members = this.members.toSpec();
      else
        attrSpec.isPercent = this.isPercent;

      Annotatable.toSpec(this, attrSpec);

      return attrSpec;
    },
    // endregion

    /**
     * Gets the string representation of the attribute.
     *
     * If the attribute's `label` is defined, it is returned.
     *
     * Otherwise, the attribute's `name` is returned.
     *
     * @return {string} The attribute's string representation.
     */
    toString: function() {
      return this.label || this.name;
    }
  }, /** @lends pentaho.data.Attribute */{

    // spec:
    //   "attrName"
    //   Attribute
    //   {attr: attrName | Attribute}
    fromOfAttributeSpec: function(spec, model) {
      if(!spec) return null;

      var attr = getAttributeByStringOrInstance(spec, model);
      if(!attr && spec.attr)
        attr = getAttributeByStringOrInstance(spec.attr, model);

      return attr;
    }
  })
  .implement(Annotatable);

  return Attribute;

  function getAttributeByStringOrInstance(nameOrAttr, model) {
    if(typeof nameOrAttr === "string") return model.attributes.getExisting(nameOrAttr);
    if(nameOrAttr instanceof Attribute) return nameOrAttr;
    return null;
  }

  function castToNumber(s) {
    if(s == null) return null;
    var v = Number(s);
    return isNaN(v) ? null : v;
  }

  function identity(v) {
    return v;
  }
});

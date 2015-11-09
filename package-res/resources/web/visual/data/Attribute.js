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
  "./Cell",
  "./Member",
  "./StructurePosition",
  "./MemberCollection",
  "./_Annotatable",
  "../_utils"
], function(Cell, Member, StructurePosition, MemberCollection, Annotatable, utils) {

  /**
   * @classdesc The `Attribute` class represents an attribute that can be
   * attributed to entities of a model.
   *
   * Attributes and their values can be attributed to an entity to form a description of it.
   *
   * An attribute is an {@link pentaho.visual.data.IAnnotatable}.
   * As such, any desired data can be associated with it.
   *
   * The following are standard annotations recognized in attributes:
   * 1. "color" - a string with the preferred color of the attribute;
   *     visualizations may use this color, when appropriate,
   *     to enable easy distinction between the attributes' representations
   * 2. "geoRole" - a string with either one of the standard geographical roles,
   *     {@link pentaho.visual.data.WellKnownGeoRole},
   *     or a custom one.
   *
   * ### AMD
   *
   * To obtain the constructor of this class,
   * require the module `"pentaho/visual/data/Attribute"`.
   *
   * @class
   * @memberOf pentaho.visual.data
   * @implements pentaho.visual.data.ISpecifiable
   * @implements pentaho.visual.data.IAnnotatable
   * @implements pentaho.visual.data.IListElement
   * @implements pentaho.visual.data.IWithKey
   *
   * @param {pentaho.visual.data.IAttributeSpec} spec The specification of the attribute.
   * @param {!Object} keyArgs The keyword arguments.
   * @param {number} keyArgs.ordinal The ordinal of the attribute in its model's attribute collection.
   */
  function Attribute(spec, keyArgs) {

    if(typeof spec === "string") spec = {name: spec};

    this._ord = utils.required(keyArgs, "ordinal", "keyArgs");

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
    if(!this.name) throw utils.error.argRequired("spec.name");

    /**
     * Gets the label of the attribute, if it has one, or `undefined`, otherwise.
     *
     * @type string|undefined
     * @readonly
     */
    this.label = spec.label != null ? spec.label : undefined;

    /**
     * Gets the format provider of the attribute, if it has one, or `null`, otherwise.

     * @type ?pentaho.visual.data.IFormatProviderSpec
     */
    this.format = spec.format || null;

    var type = spec.type;

    /**
     * Gets the name of the type of the attribute.
     *
     * @type !pentaho.visual.data.AtomicTypeName
     * @readonly
     */
    this.type = type = !type ? "string" : type.toLowerCase();

    var isDiscrete = type !== "number" && type !== "date";
    if(!isDiscrete && spec.isDiscrete != null)
      isDiscrete = !!spec.isDiscrete;

    /**
     * Indicates if the attribute is considered discrete.
     *
     * When the attribute's type is one of
     * {@link pentaho.visual.data.AtomicTypeName.STRING} or
     * {@link pentaho.visual.data.AtomicTypeName.BOOLEAN}
     * this property is always `true`.
     *
     * A non-discrete attribute is said to be a _continuous_ attribute.
     *
     * @type boolean
     * @readonly
     * @see pentaho.visual.data.Attribute#type
     * @see pentaho.visual.data.Attribute#members
     * @see pentaho.visual.data.Attribute#isPercent
     */
    this.isDiscrete = isDiscrete;

    var attrKeyArgs = {attribute: this, ordinal: 0};
    this.memberBase = Member.Adhoc.to({v: ""}, attrKeyArgs);
    this.memberBase.constructor = Member.Adhoc;

    this.cellBase = new Cell.Adhoc(attrKeyArgs);
    this.cellBase.constructor = Cell.Adhoc;

    this.structurePositionBase = new StructurePosition.Adhoc(attrKeyArgs);
    this.structurePositionBase.constructor = StructurePosition.Adhoc;

    if(isDiscrete) {
      /**
       * Gets the members collection of the attribute.
       *
       * This property is only defined when the attribute is discrete,
       * in which case it is never `null`.
       *
       * The position of members in the members collection **is relevant**.
       * It conveys a partial ordering of the contained attribute members.
       * See also {@link pentaho.visual.data.Member#ordinal}.
       *
       * @type pentaho.visual.data.MemberCollection
       * @readonly
       * @see pentaho.visual.data.Attribute#isDiscrete
       */
      this.members = MemberCollection.to(spec.members || [], attrKeyArgs);
    } else if(type === "number") {
      /**
       * Indicates if the attribute represents
       * a numeric value that is a percentage of something.
       *
       * This property is relevant only for attributes of type
       * {@link pentaho.visual.data.AtomicTypeName.NUMBER}.
       *
       * @type boolean
       * @readonly
       * @see pentaho.visual.data.Attribute#type
       */
      this.isPercent = spec.isPercent != null && !!spec.isPercent;
    }

    if(spec.p) this.p = spec.p;
    Annotatable.call(this);
  }

  var annotProto = Annotatable.prototype;

  utils.implement(Attribute, Annotatable, /** @lends pentaho.visual.data.Attribute# */{
    //region IListElement
    /**
     * Gets the singular name of `Attribute` list-elements.
     * @type string
     * @readonly
     * @default "attribute"
     */
    elemName: "attribute",
    //endregion

    //region IWithKey implementation
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
    //endregion

    //region IWithOrdinal implementation
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
    //endregion

    /**
     * Converts a member specification to a member of this attribute.
     *
     * @param {!(pentaho.visual.data.IMemberSpec|pentaho.visual.data.Atomic)} memberSpec A member specification
     *     or, directly, a member's atomic value.
     * @oaram {!Object} keyArgs The keyword arguments.
     * @oaram {number} keyArgs.ordinal The ordinal of the member in the attribute's member collection.
     * @return {pentaho.visual.data.Member} A member of this attribute.
     */
    toMemberOf: function(memberSpec, keyArgs) {
      if(memberSpec == null) throw utils.error.argRequired("memberSpec");
      if(typeof memberSpec !== "object") memberSpec = {v: memberSpec};

      var member = utils.setBase(memberSpec, this.memberBase);

      Member.call(member, keyArgs);

      return member;
    },

    /**
     * Converts a cell specification to a cell of this attribute.
     *
     * @param {pentaho.visual.data.ICellSpec|pentaho.visual.data.Atomic} cellSpec A cell specification
     *     or, directly, a cell's value, possibly _nully_.
     * @return {pentaho.visual.data.Cell} A cell of this attribute.
     */
    toCellOf: function(cellSpec) {
      if(cellSpec == null || typeof cellSpec !== "object") cellSpec = {v: cellSpec};

      var cell = utils.setBase(cellSpec, this.cellBase);
      Cell.call(cell);
      return cell;
    },

    //region ISpecifiable implementation
    /**
     * Creates a specification of the attribute.
     *
     * @return {pentaho.visual.data.IAttributeSpec} A new specification of the attribute.
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

      annotProto.toSpec.call(this, attrSpec);

      return attrSpec;
    },
    //endregion

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
  });

  // ------

  // Makes it easier to implement lists of attributes
  Attribute.to = function(attrSpec, keyArgs) {
    return attrSpec instanceof Attribute ? attrSpec : new Attribute(attrSpec, keyArgs);
  };

  // ------

  // spec:
  //   "attrName"
  //   Attribute
  //   {attr: attrName | Attribute}
  Attribute.fromOfAttributeSpec = function(spec, model) {
    if(!spec) return null;

    var attr = getAttributeByStringOrInstance(spec, model);
    if(!attr && spec.attr)
        attr = getAttributeByStringOrInstance(spec.attr, model);

    return attr;
  };

  function getAttributeByStringOrInstance(nameOrAttr, model) {
    if(typeof nameOrAttr === "string") return model.attributes.getExisting(nameOrAttr);
    if(nameOrAttr instanceof Attribute) return nameOrAttr;
    return null;
  }

  // ------

  return Attribute;
});
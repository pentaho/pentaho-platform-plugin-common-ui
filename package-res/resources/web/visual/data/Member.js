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
  "./_OfAttribute",
  "./_Annotatable",
  "../_utils"
], function(OfAttribute, Annotatable, utils) {

  /**
   * @classdesc The `Member` class is an abstract base class that
   * represents a value that a discrete attribute can hold.
   *
   * ### AMD
   *
   * To obtain the constructor of this class,
   * require the module `"pentaho/visual/data/Member"`.
   *
   * ### Remarks
   *
   * A member holds a reference to its attribute through property
   * {@link pentaho.visual.data.Member#attribute}.
   *
   * The value of a member defines it — it is unique amongst its attribute's members.
   * See property {@link pentaho.visual.data.Member#value}.
   *
   * A member can also hold a _context agnostic_, human-readable
   * label of its value. See property {@link pentaho.visual.data.Member#label}.
   *
   * A member is an {@link pentaho.visual.data.IAnnotatable}.
   * As such, any desired data can be associated with it.
   *
   * The following are standard annotations recognized in attribute members:
   * 1. "color" - a string with the preferred color of the member;
   *     visualizations may use this color, when appropriate,
   *     to enable easy distinction between the representation of members
   *
   * @description An initialization constructor that
   * initializes a member instance assuming it was
   * converted from a member specification object,
   * {@link pentaho.visual.data.IMemberSpec}.
   *
   * Members cannot be constructed directly.
   * Instead, because members always have an associated attribute,
   * they should be created by using its attribute's
   * {@link pentaho.visual.data.Attribute#toMemberOf} method.
   *
   * @class
   * @abstract
   * @memberOf pentaho.visual.data
   *
   * @param {!Object} keyArgs The keyword arguments.
   * @oaram {number} keyArgs.ordinal The ordinal of the member in the attribute's member collection.
   *
   * @implements pentaho.visual.data.ISpecifiable
   * @implements pentaho.visual.data.IAnnotatable
   * @implements pentaho.visual.data.IListElement
   * @implements pentaho.visual.data.IWithKey
   */
  function Member(keyArgs) {
    this._ord = utils.required(keyArgs, "ordinal", "keyArgs");

    this.value = this.v;
    this.label = this.f;

    Annotatable.call(this);
  }

  var annotProto = Annotatable.prototype;

  utils.implement(Member, Annotatable, /** @lends pentaho.visual.data.Member# */{
    //region IListElement
    /**
     * Gets the singular name of `Member` list-elements.
     * @type string
     * @readonly
     * @default "member"
     */
    elemName: "member",
    //endregion

    //region IWithKey implementation
    /**
     * Gets the singular name of `Member` keys.
     * @type string
     * @readonly
     * @default "value"
     */
    keyName: "value",

    /**
     * Gets the key of the member.
     *
     * The key of a member is the string representation of its value.
     *
     * @type string
     * @readonly
     */
    get key() {
      return this.v.toString();
    },
    //endregion

    //region IOfAttribute abstract implementation
    /**
     * Gets the attribute of the member.
     *
     * @type !pentaho.visual.data.Attribute
     * @abstract
     * @readonly
     */
    get attribute() {
      throw new Error("abstract");
    },
    //endregion

    //region IWithOrdinal implementation
    /**
     * Gets the ordinal of the member in its attribute's members collection.
     *
     * The ordinal of a member conveys a partial ordering of the members of its attribute.
     *
     * @type number
     * @readonly
     */
    get ordinal() {
      return this._ord;
    },
    //endregion

    /**
     * Gets or sets the value of the member.
     *
     * Note that the value of a member cannot be `nully`.
     *
     * @type !pentaho.visual.data.Atomic
     */
    get value() {
      return this.v;
    },

    set value(v) {
      if(v == null) throw utils.error.argInvalid("value", "Cannot be nully.");
      this.v = v;
    },

    /**
     * Gets or sets the label of the member.
     *
     * If `null` is specified, it is instead taken to be `undefined`.
     *
     * The default value is `undefined`.
     *
     * @type string|undefined
     */
    get label() {
      return this.f;
    },

    set label(f) {
      this.f = f == null ? undefined : String(f);
    },

    /**
     * Gets a best-effort string representation of the member.
     *
     * If the member's `label` is defined, it is returned.
     *
     * Otherwise, the string representation of the member's `value` is returned.
     *
     * @return {string} The member's string representation.
     */
    toString: function() {
      var f;
      return (f = this.f) != null ? f : this.v.toString();
    },

    //region ISpecifiable implementation
    /**
     * Creates a specification of the member.
     *
     * @return {!pentaho.visual.data.IMemberSpec} A new specification of the member.
     */
    toSpec: function() {
      var memberSpec = {v: this.v};

      if(this.f != null) memberSpec.f = this.f;
      if(this.p) annotProto.toSpec.call(this, memberSpec);

      return memberSpec;
    }
    //endregion
  });

  function AdhocMember(keyArgs) {
    OfAttribute.call(this, keyArgs);
    Member.call(this, keyArgs);
  }

  utils.inherit(AdhocMember, Member, OfAttribute);

  AdhocMember.to = function(spec, keyArgs) {
    if(typeof spec !== "object") spec = {v: spec};
    return utils.setClass(spec, AdhocMember, keyArgs);
  };

  Member.Adhoc = AdhocMember;

  return Member;
});
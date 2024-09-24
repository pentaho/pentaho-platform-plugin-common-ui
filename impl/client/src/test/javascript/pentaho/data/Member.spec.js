/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
  "pentaho/data/Model",
  "pentaho/data/Attribute",
  "pentaho/data/Member",
  "tests/pentaho/util/errorMatch"
], function(Model, Attribute, Member, errorMatch) {

  function expectMember(memberSpec) {
    var model = new Model([{name: "test", type: "string", members: [memberSpec]}]);

    expect(model.attributes.length).toBe(1);

    var attr = model.attributes[0];
    expect(attr instanceof Attribute).toBe(true);

    expect(attr.members.length).toBe(1);

    var member = attr.members[0];
    expect(member instanceof Member).toBe(true);

    return member;
  }

  describe("data/Member -", function() {
    describe("when spec is a string", function() {
      var member;
      beforeEach(function() {
        member = expectMember("member1");
      });

      it("should create a member with that value", function() {
        expect(member.value).toBe("member1");
      });

      it("should create a member whose label is undefined", function() {
        expect(member.label).toBe(undefined);
      });
    });

    describe("#value", function() {
      it("should have the value of the specified `v` property", function() {
        var member = expectMember({v: "member1"});
        expect(member.value).toBe("member1");
      });

      it("should throw if the specified `v` is null or undefined", function() {
        expect(function() {
          expectMember({v: undefined});
        }).toThrow(errorMatch.argInvalid("value"));

        expect(function() {
          expectMember({v: null});
        }).toThrow(errorMatch.argInvalid("value"));
      });
    });

    describe("#label", function() {
      it("should have the value of the specified `f` property", function() {
        var attr = expectMember({v: "member1", f: "Member1"});
        expect(attr.label).toBe("Member1");
      });
    });

    describe("#property(name) -", function() {
      it("should return the value of the specified member property", function() {
        var foo = {},
            member = expectMember({v: "A", p: {foo: foo}});

        expect(member.property("foo")).toBe(foo);
      });

      it("should return `undefined` for an member property which is not defined", function() {
        var member = expectMember({v: "A", p: {bar: "x"}});

        expect(member.property("foo")).toBe(undefined);

        member = expectMember({v: "A"});

        expect(member.property("foo")).toBe(undefined);
      });
    });

    describe("#property(name, value) -", function() {
      it("should set the value of the specified member property", function() {
        var foo = {},
            guru = {},
            member = expectMember({v: "A", p: {bar: "x"}});

        member.property("bar", foo);
        expect(member.property("bar")).toBe(foo);

        member.property("guru", guru);
        expect(member.property("guru")).toBe(guru);

        member = expectMember({v: "A"});
        member.property("bar", foo);
        expect(member.property("bar")).toBe(foo);
      });
    });
  });
});
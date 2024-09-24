/*!
 * Copyright 2010 - 2018 Hitachi Vantara.  All rights reserved.
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
  "pentaho/type/_baseLoader",
  "pentaho/type/Complex",
  "pentaho/type/SpecificationScope"
], function(baseLoader, Complex, SpecificationScope) {

  "use strict";

  return {
    createRoot: createRoot,
    extend: extend,
    itDynamicAttribute: itDynamicAttribute
  };

  function createRoot(declaringType, typeSpec) {

    var baseId = typeSpec && typeSpec.base;
    var Property = baseLoader.resolveType(baseId || "property");

    var SubProperty = Property.extend({
      $type: typeSpec
    }, null, {
      declaringType: declaringType,
      index: 1,
      isRoot: true
    });

    return SubProperty.type;
  }

  function extend(declaringType, baseProperty, subPropTypeSpec) {

    var basePropType = declaringType.ancestor.get(baseProperty);
    var BaseProperty = basePropType.instance.constructor;
    var SubProperty = BaseProperty.extend({
      $type: subPropTypeSpec
    }, null, {
      declaringType: declaringType,
      index: -1,
      isRoot: false
    });

    return SubProperty.type;
  }

  function itDynamicAttribute(name, value, base, groupName) {

    it("should not serialize when not specified", function() {

      var Derived = Complex.extend();
      var scope = new SpecificationScope();
      var propType = createRoot(Derived.type, {name: "foo", base: base});

      var spec = {};
      var keyArgs = {};
      var result = propType._fillSpecInContext(spec, keyArgs);

      scope.dispose();

      expect(result).toBe(false);

      var groupSpec;
      if(groupName) {
        groupSpec = spec[groupName];
      } else {
        groupSpec = spec;
      }

      if(groupSpec) {
        expect(name in groupSpec).toBe(false);
      }
    });

    it("should serialize when specified as a non-function value", function() {

      var Derived = Complex.extend();
      var scope = new SpecificationScope();
      var propTypeSpec = {name: "foo", base: base};

      var propTypeGroupSpec;
      if(groupName) {
        propTypeGroupSpec = (propTypeSpec[groupName] = {});
      } else {
        propTypeGroupSpec = propTypeSpec;
      }

      propTypeGroupSpec[name] = value;

      var propType = createRoot(Derived.type, propTypeSpec);

      var spec = {};
      var keyArgs = {};
      var result = propType._fillSpecInContext(spec, keyArgs);

      scope.dispose();

      expect(result).toBe(true);

      var groupSpec;
      if(groupName) {
        groupSpec = spec[groupName];
        expect(groupSpec != null).toBe(true);
      } else {
        groupSpec = spec;
      }

      expect(groupSpec[name]).toBe(value);
    });

    it("should serialize when specified as a function value and isJson: false", function() {

      var Derived = Complex.extend();
      var scope = new SpecificationScope();
      var propTypeSpec = {name: "foo", base: base};
      var fValue = function() { return value; };

      var propTypeGroupSpec;
      if(groupName) {
        propTypeGroupSpec = (propTypeSpec[groupName] = {});
      } else {
        propTypeGroupSpec = propTypeSpec;
      }

      propTypeGroupSpec[name] = fValue;

      var propType = createRoot(Derived.type, propTypeSpec);

      var spec = {};
      var keyArgs = {};
      var result = propType._fillSpecInContext(spec, keyArgs);

      scope.dispose();

      expect(result).toBe(true);

      var groupSpec;
      if(groupName) {
        groupSpec = spec[groupName];
        expect(groupSpec != null).toBe(true);
      } else {
        groupSpec = spec;
      }

      expect(groupSpec[name]).toBe(fValue);
    });

    it("should not serialize when specified as a function value and isJson: true", function() {

      var Derived = Complex.extend();
      var scope = new SpecificationScope();
      var propTypeSpec = {name: "foo", base: base};
      var fValue = function() { return value; };

      var propTypeGroupSpec;
      if(groupName) {
        propTypeGroupSpec = (propTypeSpec[groupName] = {});
      } else {
        propTypeGroupSpec = propTypeSpec;
      }

      propTypeGroupSpec[name] = fValue;

      var propType = createRoot(Derived.type, propTypeSpec);

      var spec = {};
      var keyArgs = {isJson: true};
      var result = propType._fillSpecInContext(spec, keyArgs);

      scope.dispose();

      expect(result).toBe(false);

      var groupSpec;
      if(groupName) {
        groupSpec = spec[groupName];
      } else {
        groupSpec = spec;
      }

      if(groupSpec) {
        expect(name in groupSpec).toBe(false);
      }
    });

    it("should not serialize when inherited", function() {

      var Base = Complex.extend();

      var propTypeSpec = {name: "foo", base: base};
      var propTypeGroupSpec;
      if(groupName) {
        propTypeGroupSpec = (propTypeSpec[groupName] = {});
      } else {
        propTypeGroupSpec = propTypeSpec;
      }

      propTypeGroupSpec[name] = value;

      Base.type.add(propTypeSpec);

      var Derived = Base.extend();

      var scope = new SpecificationScope();

      var propType = extend(Derived.type, "foo", {});

      var spec = {};
      var keyArgs = {};
      var result = propType._fillSpecInContext(spec, keyArgs);

      scope.dispose();

      expect(result).toBe(false);

      var groupSpec;
      if(groupName) {
        groupSpec = spec[groupName];
      } else {
        groupSpec = spec;
      }

      if(groupSpec) {
        expect(name in groupSpec).toBe(false);
      }
    });
  }
});


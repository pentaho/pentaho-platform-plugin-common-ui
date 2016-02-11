/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "pentaho/util/MessageBundle",
  "pentaho/util/error"
], function(MessageBundle, error) {
  "use strict";

  var isEmpty = function(obj) {
    return obj != null && Object.keys(obj).length === 0;
  };

  describe("MessageBundle -", function() {
    it("is defined", function() {
      expect(MessageBundle).toBeTruthy();
      expect(typeof MessageBundle).toBe("function");
    });

    it("should define an empty source object when created without arguments.", function() {
      var emptyBundle = new MessageBundle();
      var source = emptyBundle.source;

      expect(source).not.toBeNull();
      expect(typeof source).toBe('object');
      expect(isEmpty(source)).toBe(true);
    });

    describe("bundle -", function() {
      beforeEach(function() {
        this.bundle = new MessageBundle({
          'folder_01.leaf_01': 'folder_01_leaf_01_value',
          'folder_01.leaf_02': 'folder_01_leaf_02_value',
          'folder_02.leaf_01': 'folder_02_leaf_01_value',
          'folder_02.leaf_02': 'folder_02_leaf_02_value',
          'folder_03.leaf_01': '{f}_03_{l}_01_{v}'
        });
      });

      describe("#has -", function() {
        it("should return true for existing key", function() {
          expect(this.bundle.has('folder_01.leaf_01')).toBeTruthy();
        });

        it("should return false for non-existing key", function() {
          expect(this.bundle.has('folder_na.leaf_na')).toBeFalsy();
        });
      });

      describe("#get -", function() {
        it("should return value for existing key", function() {
          expect(this.bundle.get('folder_01.leaf_01')).toBe('folder_01_leaf_01_value');
        });

        it("should return key for non-existing key", function() {
          expect(this.bundle.get('folder_na.leaf_na')).toBe('folder_na.leaf_na');
        });

        it("should return default value for non-existing key", function() {
          expect(this.bundle.get('folder_na.leaf_na', 'default_value')).toBe('default_value');
        });

        it("should use values stored in the scope or return default_value for non-existing key", function() {
          var scope = {'f': 'folder', 'l': 'leaf', 'v': 'value'};
          var scope2 = {'f': 'folder', 'l': 'leaf'};

          expect(this.bundle.get('folder_03.leaf_01', scope, 'default_value')).toBe('folder_03_leaf_01_value');
          expect(this.bundle.get('folder_03.leaf_01', scope2, 'default_value')).toBe('folder_03_leaf_01_[?]');
          expect(this.bundle.get('folder_03.leaf_na', scope, 'default_value')).toBe('default_value');
        });
      });

      it("shouldn't build structured object if not needed", function() {
        expect(this.bundle._structured).toBeNull();
      });

      it("should build structured object if needed", function() {
        var obj = this.bundle.structured;
        expect(this.bundle._structured).not.toBeNull();
      });

      it("should provide structured object", function() {
        expect(this.bundle.structured.folder_01.leaf_01).toBe('folder_01_leaf_01_value');
        expect(this.bundle.structured.folder_01.leaf_02).toBe('folder_01_leaf_02_value');
        expect(this.bundle.structured.folder_02.leaf_01).toBe('folder_02_leaf_01_value');
        expect(this.bundle.structured.folder_02.leaf_02).toBe('folder_02_leaf_02_value');
      });

      describe("#format -", function() {
        var scope_obj = {
          'foo': 'FooBar'
        };

        var scope_array = ["FooBar"];

        var scope_fun = function(prop) {
          return "_" + prop + "_";
        };

        it("should throw an error when no string is given.", function() {
          var that = this;
          function expectThrowError(text) {
            expect(function() {
              that.bundle.format(text);
            }).toThrowError(error.argRequired("text").message);
          }

          expectThrowError(null);
          expectThrowError(undefined);
        });

        it("should return '[?]' when the property doesn't exist.", function() {
          expect(this.bundle.format("Testing {foo}")).toBe("Testing [?]");
          expect(this.bundle.format("Testing {bar}", scope_obj)).toBe("Testing [?]");
          expect(this.bundle.format("Testing {1}", scope_array)).toBe("Testing [?]");
        });

        it("should accept an object as scope.", function() {
          expect(this.bundle.format("Testing {foo}", scope_obj)).toBe("Testing FooBar");
        });

        it("should accept an array as scope.", function() {
          expect(this.bundle.format("Testing {0}", scope_array)).toBe("Testing FooBar");
        });

        it("should accept a function as scope.", function() {
          expect(this.bundle.format("Testing {FooBar}", scope_fun)).toBe("Testing _FooBar_");
        });
      });

      describe("MessageBundle.format -", function() {
        it("should be defined and be a 'function'", function() {
          expect(typeof MessageBundle.format).toBe('function');

        });it("should be the same as '#format'", function() {
          expect(MessageBundle.format).toBe(this.bundle.format);
        });
      });
    });
  });
});

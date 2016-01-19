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
define(["pentaho/util/MessageBundle"], function(MessageBundle) {
  describe("MessageBundle -", function() {
    it("is defined", function() {
      expect(MessageBundle).toBeTruthy();
      expect(typeof MessageBundle).toBe("function");
    });

    describe("bundle -", function() {
      beforeEach(function() {
        this.bundle = new MessageBundle({
          'folder_01.leaf_01': 'folder_01_leaf_01_value',
          'folder_01.leaf_02': 'folder_01_leaf_02_value',
          'folder_02.leaf_01': 'folder_02_leaf_01_value',
          'folder_02.leaf_02': 'folder_02_leaf_02_value',
        });
      });

      it("should return true for existing key", function() {
        expect(this.bundle.has('folder_01.leaf_01')).toBeTruthy();
      });

      it("should return false for non-existing key", function() {
        expect(this.bundle.has('folder_na.leaf_na')).toBeFalsy();
      });

      it("should return value for existing key", function() {
        expect(this.bundle.get('folder_01.leaf_01')).toBe('folder_01_leaf_01_value');
      });

      it("should return key for non-existing key", function() {
        expect(this.bundle.get('folder_na.leaf_na')).toBe('folder_na.leaf_na');
      });

      it("should return default value for non-existing key", function() {
        expect(this.bundle.get('folder_na.leaf_na', 'default_value')).toBe('default_value');
      });

      it("shouldn't build structured object if not needed", function() {
        expect(this.bundle._structured).toBeNull();
      });

      it("shoul build structured object if needed", function() {
        var obj = this.bundle.structured;
        expect(this.bundle._structured).not.toBeNull();
      });

      it("should provide structured object", function() {
        expect(this.bundle.structured.folder_01.leaf_01).toBe('folder_01_leaf_01_value');
        expect(this.bundle.structured.folder_01.leaf_02).toBe('folder_01_leaf_02_value');
        expect(this.bundle.structured.folder_02.leaf_01).toBe('folder_02_leaf_01_value');
        expect(this.bundle.structured.folder_02.leaf_02).toBe('folder_02_leaf_02_value');
      });
    });
  });
});

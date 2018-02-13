/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/lang/DomNode"
], function(DomNode) {

  /* globals it, describe, beforeEach */

  describe("pentaho.lang.DomNode", function() {

    describe("new ()", function() {
      var domNode;

      beforeEach(function() {
        domNode = new DomNode();
      });

      it("should be possible to create an instance", function() {
        expect(domNode instanceof DomNode).toBe(true);
      });

      it("should have a null parent", function() {
        expect(domNode.parent).toBe(null);
      });

      it("should have an index of -1", function() {
        expect(domNode.index).toBe(-1);
      });

      it("should have a children array with 0 length", function() {
        expect(Array.isArray(domNode.children)).toBe(true);
        expect(domNode.children.length).toBe(0);
      });
    });

    describe("#appendChild(child)", function() {

      describe("parent change", function() {

        it("should append a child which has no parent", function() {
          var parent = new DomNode();
          var child = new DomNode();

          parent.appendChild(child);

          expect(parent.hasOwnProperty("children")).toBe(true);
          expect(parent.children.length).toBe(1);
          expect(parent.children[0]).toBe(child);
          expect(child.parent).toBe(parent);
          expect(child.index).toBe(0);
        });

        it("should append a child which has a parent but should remove it from the old parent first", function() {
          var oldParent = new DomNode();
          var child = new DomNode();
          oldParent.appendChild(child);

          // ---

          var newParent = new DomNode();

          newParent.appendChild(child);

          // ---

          expect(oldParent.hasOwnProperty("children")).toBe(true);
          expect(oldParent.children.length).toBe(0);
          expect(child.parent).not.toBe(oldParent);
          // ---

          expect(newParent.hasOwnProperty("children")).toBe(true);
          expect(newParent.children.length).toBe(1);
          expect(newParent.children[0]).toBe(child);
          expect(child.parent).toBe(newParent);
          expect(child.index).toBe(0);
        });

        it("should call child#_onParentChange and then parent#_onChildAdded when child had no parent", function() {

          var parent = new DomNode();
          var child = new DomNode();

          spyOn(child, "_onParentChange").and.callThrough();
          spyOn(parent, "_onChildAdded").and.callThrough();

          parent.appendChild(child);

          expect(child._onParentChange).toHaveBeenCalledWith(parent, 0, /*oldParent*/null, /*oldIndex*/null);
          expect(parent._onChildAdded).toHaveBeenCalledWith(child, 0);
        });

        it("should call child#_onParentChange and then oldParent#_onChildRemoved and then newParent#_onChildAdded " +
            "when child changed parents", function() {

          var oldParent = new DomNode();
          var child = new DomNode();

          oldParent.appendChild(child);

          // ---

          var newParent = new DomNode();
          var counter = 0;
          var counterAtRemoved;
          var counterAtAdded;
          spyOn(child, "_onParentChange").and.callThrough();
          spyOn(oldParent, "_onChildRemoved").and.callFake(function() { counterAtRemoved = ++counter; });
          spyOn(oldParent, "_onChildAdded").and.callThrough();

          spyOn(newParent, "_onChildRemoved").and.callThrough();
          spyOn(newParent, "_onChildAdded").and.callFake(function() { counterAtAdded = ++counter; });

          newParent.appendChild(child);

          expect(child._onParentChange).toHaveBeenCalledWith(newParent, 0, oldParent, 0);

          expect(oldParent._onChildRemoved).toHaveBeenCalledWith(child, 0);
          expect(oldParent._onChildAdded).not.toHaveBeenCalled();

          expect(newParent._onChildRemoved).not.toHaveBeenCalled();
          expect(newParent._onChildAdded).toHaveBeenCalledWith(child, 0);

          expect(counterAtRemoved).toBe(1);
          expect(counterAtAdded).toBe(2);
        });

        it("should append a child if it already has other children", function() {

          var parent = new DomNode();
          var child1 = new DomNode();
          var child2 = new DomNode();

          parent.appendChild(child1);
          parent.appendChild(child2);

          expect(parent.children.length).toBe(2);
          expect(parent.children[0]).toBe(child1);
          expect(parent.children[1]).toBe(child2);

          expect(child1.parent).toBe(parent);
          expect(child2.parent).toBe(parent);
          expect(child1.index).toBe(0);
          expect(child2.index).toBe(1);
        });
      });

      describe("position change", function() {

        it("should move a child to the end position if it is not the last child", function() {

          var parent = new DomNode();
          var child1 = new DomNode();
          var child2 = new DomNode();

          parent.appendChild(child1);
          parent.appendChild(child2);

          // ---

          parent.appendChild(child1);

          // ---

          expect(parent.children.length).toBe(2);
          expect(parent.children[0]).toBe(child2);
          expect(parent.children[1]).toBe(child1);
          expect(child2.index).toBe(0);
          expect(child1.index).toBe(1);
        });

        it("should call parent._onChildMoved", function() {

          var parent = new DomNode();
          var child1 = new DomNode();
          var child2 = new DomNode();

          parent.appendChild(child1);
          parent.appendChild(child2);

          spyOn(parent, "_onChildMoved").and.callThrough();

          // ---

          parent.appendChild(child1);

          // ---

          expect(parent._onChildMoved).toHaveBeenCalledWith(child1, 1, 0);
        });
      });

      it("should return the new child", function() {
        var parent = new DomNode();
        var child = new DomNode();

        var result = parent.appendChild(child);

        expect(result).toBe(child);
      });
    });

    describe("#removeChild(child)", function() {

      it("should ignore if child is not a child of parent and return child", function() {

        var parent = new DomNode();
        var child = new DomNode();

        var result = parent.removeChild(child);

        expect(result).toBe(child);
      });

      it("should remove child if it is a child and return it", function() {

        var parent = new DomNode();
        var child = new DomNode();

        parent.appendChild(child);

        // ---

        var result = parent.removeChild(child);

        expect(result).toBe(child);

        expect(parent.children.length).toBe(0);
        expect(child.parent).toBe(null);
        expect(child.index).toBe(-1);
      });

      it("should remove child if it is a child and preserve other children", function() {

        var parent = new DomNode();
        var child1 = new DomNode();
        var child2 = new DomNode();
        var child3 = new DomNode();

        parent.appendChild(child1);
        parent.appendChild(child2);
        parent.appendChild(child3);

        // ---

        parent.removeChild(child2);

        expect(parent.children.length).toBe(2);

        expect(parent.children[0]).toBe(child1);
        expect(child1.parent).toBe(parent);
        expect(child1.index).toBe(0);

        expect(parent.children[1]).toBe(child3);
        expect(child3.parent).toBe(parent);
        expect(child3.index).toBe(1);

        expect(child2.parent).toBe(null);
        expect(child2.index).toBe(-1);
      });

      it("should call child._onParentChange parent._onChildRemoved", function() {

        var parent = new DomNode();

        var child1 = new DomNode();
        var child2 = new DomNode();
        var child3 = new DomNode();

        parent.appendChild(child1);
        parent.appendChild(child2);
        parent.appendChild(child3);

        // ---

        spyOn(child1, "_onParentChange").and.callThrough();
        spyOn(child2, "_onParentChange").and.callThrough();
        spyOn(child3, "_onParentChange").and.callThrough();

        spyOn(parent, "_onChildAdded").and.callThrough();
        spyOn(parent, "_onChildMoved").and.callThrough();
        spyOn(parent, "_onChildRemoved").and.callThrough();

        // ---

        parent.removeChild(child2);

        // ---

        expect(child1._onParentChange).not.toHaveBeenCalled();
        expect(child2._onParentChange).toHaveBeenCalledWith(null, null, parent, 1);
        expect(child3._onParentChange).not.toHaveBeenCalled();

        expect(parent._onChildRemoved).toHaveBeenCalledWith(child2, 1);
        expect(parent._onChildAdded).not.toHaveBeenCalled();
        expect(parent._onChildMoved).not.toHaveBeenCalled();
      });
    });

    describe("#removeChildAt(index)", function() {

      it("should return null if index is negative and leave the nodes unchanged", function() {

        var parent = new DomNode();
        var child = new DomNode();
        parent.appendChild(child);

        var result = parent.removeChildAt(-1);

        expect(result).toBe(null);
        expect(parent.children.length).toBe(1);
      });

      it("should return null if index is 0 and parent has no children and never had", function() {

        var parent = new DomNode();

        var result = parent.removeChildAt(0);

        expect(result).toBe(null);
        expect(parent.children.length).toBe(0);
      });

      it("should return null if index is greater or equal to L and leave the nodes unchanged", function() {

        var parent = new DomNode();
        var child = new DomNode();
        parent.appendChild(child);

        var result = parent.removeChildAt(1);

        expect(result).toBe(null);
        expect(parent.children.length).toBe(1);
      });

      it("should remove child at index and preserve other children (middle)", function() {

        var parent = new DomNode();
        var child1 = new DomNode();
        var child2 = new DomNode();
        var child3 = new DomNode();

        parent.appendChild(child1);
        parent.appendChild(child2);
        parent.appendChild(child3);

        // ---

        parent.removeChildAt(1);

        expect(parent.children.length).toBe(2);

        expect(parent.children[0]).toBe(child1);
        expect(child1.parent).toBe(parent);
        expect(child1.index).toBe(0);

        expect(parent.children[1]).toBe(child3);
        expect(child3.parent).toBe(parent);
        expect(child3.index).toBe(1);

        expect(child2.parent).toBe(null);
        expect(child2.index).toBe(-1);
      });

      it("should remove child at index and preserve other children (first)", function() {

        var parent = new DomNode();
        var child1 = new DomNode();
        var child2 = new DomNode();
        var child3 = new DomNode();

        parent.appendChild(child1);
        parent.appendChild(child2);
        parent.appendChild(child3);

        // ---

        parent.removeChildAt(0);

        expect(parent.children.length).toBe(2);

        expect(parent.children[0]).toBe(child2);
        expect(child2.parent).toBe(parent);
        expect(child2.index).toBe(0);

        expect(parent.children[1]).toBe(child3);
        expect(child3.parent).toBe(parent);
        expect(child3.index).toBe(1);

        expect(child1.parent).toBe(null);
        expect(child1.index).toBe(-1);
      });

      it("should remove child at index and preserve other children (last)", function() {

        var parent = new DomNode();
        var child1 = new DomNode();
        var child2 = new DomNode();
        var child3 = new DomNode();

        parent.appendChild(child1);
        parent.appendChild(child2);
        parent.appendChild(child3);

        // ---

        parent.removeChildAt(2);

        expect(parent.children.length).toBe(2);

        expect(parent.children[0]).toBe(child1);
        expect(child1.parent).toBe(parent);
        expect(child1.index).toBe(0);

        expect(parent.children[1]).toBe(child2);
        expect(child2.parent).toBe(parent);
        expect(child2.index).toBe(1);

        expect(child3.parent).toBe(null);
        expect(child3.index).toBe(-1);
      });

      it("should remove child at index and return it", function() {

        var parent = new DomNode();
        var child1 = new DomNode();
        var child2 = new DomNode();
        var child3 = new DomNode();

        parent.appendChild(child1);
        parent.appendChild(child2);
        parent.appendChild(child3);

        // ---

        var result = parent.removeChildAt(1);

        expect(result).toBe(child2);
      });

      it("should call child._onParentChange parent._onChildRemoved", function() {

        var parent = new DomNode();

        var child1 = new DomNode();
        var child2 = new DomNode();
        var child3 = new DomNode();

        parent.appendChild(child1);
        parent.appendChild(child2);
        parent.appendChild(child3);

        // ---

        spyOn(child1, "_onParentChange").and.callThrough();
        spyOn(child2, "_onParentChange").and.callThrough();
        spyOn(child3, "_onParentChange").and.callThrough();

        spyOn(parent, "_onChildAdded").and.callThrough();
        spyOn(parent, "_onChildMoved").and.callThrough();
        spyOn(parent, "_onChildRemoved").and.callThrough();

        // ---

        parent.removeChildAt(1);

        // ---

        expect(child1._onParentChange).not.toHaveBeenCalled();
        expect(child2._onParentChange).toHaveBeenCalledWith(null, null, parent, 1);
        expect(child3._onParentChange).not.toHaveBeenCalled();

        expect(parent._onChildRemoved).toHaveBeenCalledWith(child2, 1);
        expect(parent._onChildAdded).not.toHaveBeenCalled();
        expect(parent._onChildMoved).not.toHaveBeenCalled();
      });
    });
  });
});

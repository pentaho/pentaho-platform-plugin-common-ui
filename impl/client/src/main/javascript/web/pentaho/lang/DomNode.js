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
  "module",
  "pentaho/lang/Base",
  "pentaho/util/object"
], function(module, Base, O) {

  // Parts of the following code are based on Protovis' DomNode class:
  //  https://github.com/mbostock/protovis/blob/master/src/data/Dom.js#L96
  //
  // More specifically, it is based on WebDetails's transition branch of the Protovis code:
  //  https://github.com/webdetails/protovis/blob/transition/src/data/Dom.js#L96.

  /**
   * @classDesc The `DomNode` class represents a node in a document tree and exposes an API which
   * is similar in spirit to that of the [DOM API]{@link https://en.wikipedia.org/wiki/Document_Object_Model}.
   *
   * @memberOf pentaho.lang
   * @lass
   * @extends pentaho.lang.Base
   *
   * @description Constructs a `DomNode` instance.
   */
  var DomNode = Base.extend(module.id, /** @lends pentaho.lang.DomNode# */{

    constructor: function() {
      // Avoid base this.extend()
    },

    /**
     * The index of the node. May be out-of-date.
     * @type {number}
     * @private
     */
    __index:  -1,

    /**
     * The first child index which is out-of-date.
     * @type {number}
     * @default Infinity
     * @private
     */
    __firstDirtyChildIndex: Infinity,

    /**
     * Gets the parent node, if any, or `null` if none.
     *
     * @type {pentaho.lang.DomNode}
     * @readOnly
     */
    parent: null,

    /**
     * Gets the array of child nodes.
     *
     * The returned array cannot be modified directly.
     *
     * @type {!Array.<!pentaho.lang.DomNode>}
     * @readOnly
     * @see pentaho.lang.DomNode#appendChild
     * @see pentaho.lang.DomNode#removeChild
     * @see pentaho.lang.DomNode#removeChildAt
     */
    children: Object.freeze([]),

    /**
     * Gets the child index of this node, if it has a parent, or `-1` if not.
     *
     * @type {number}
     * @readOnly
     */
    get index() {
      var parent = this.parent;
      return parent === null ? -1 : (parent.__updateChildIndexes(), this.__index);
    },

    /**
     * Appends a child node to the list of children.
     *
     * If the given node is already a child of this node, it is moved to the end of the children's list.
     *
     * Otherwise,
     * if the given node has another parent node, it is first removed from that parent and
     * only then added as a child of this one.
     *
     * @param {!pentaho.lang.DomNode} child - The child node.
     * @return {!pentaho.lang.DomNode} The child node.
     */
    appendChild: function(child) {

      child.__setParent(this, null);

      return child;
    },

    /**
     * Removes a given child node from the list of children.
     *
     * If the given node is in fact a child of this node, it is removed. Otherwise, the method does nothing.
     *
     * @param {!pentaho.lang.DomNode} child - The child node.
     *
     * @return {!pentaho.lang.DomNode} The given child node.
     */
    removeChild: function(child) {
      var parent = child.parent;
      if(parent === this) {
        child.__setParent(null, null);
      }

      return child;
    },

    /**
     * Removes a child node of a given index from the list of children.
     *
     * If the given index is defined, it is removed. Otherwise, the method does nothing.
     *
     * @param {number} index - The child node index.
     *
     * @return {pentaho.lang.DomNode} The child node if one is defined; `null`, otherwise.
     */
    removeChildAt: function(index) {
      // When no children, the inherited children array has 0 elements
      if(index < 0 || index >= this.children.length) {
        return null;
      }

      var child = this.children[index];

      child.__setParent(null, index);

      return child;
    },

    /**
     * Changes the parent node of this node to a new parent node, possibly `null`.
     * If the current/old index of this node is known, in its current/old parent,
     * it can be specified in the `oldIndex` argument.
     *
     * This method performs the parent change _atomically_, i.e.,
     * without calling the notification-related protected methods,
     * {@link pentaho.lang.DomNode#_onParentChange} or
     * {@link pentaho.lang.DomNode#_onChildMoved},
     * until the whole change is performed.
     *
     * @param {pentaho.lang.DomNode} newParent - The new parent node, if any.
     * @param {?number} oldIndex - The old index, if known.
     */
    __setParent: function(newParent, oldIndex) {
      var newIndex;

      var oldParent = this.parent;
      var isParentChange = oldParent !== newParent;

      if(oldParent !== null) {
        if(oldIndex === null) {
          oldIndex = oldParent.__getChildIndexNoUpdate(this);
        }

        oldParent.__removeChildAtCore(oldIndex);
      }

      if(isParentChange) {
        this.parent = newParent;
      }

      this.__index = newIndex = newParent !== null ? newParent.__appendChildCore(this) : null;

      // ---

      if(isParentChange) {
        this._onParentChange(newParent, newIndex, oldParent, oldIndex);
      } else {
        // It would be too costly to support child._onMoved, cause all moved children would have to be notified...
        newParent._onChildMoved(this, newIndex, oldIndex);
      }
    },

    /**
     * Ensures that the indexes of all child nodes are updated.
     * @private
     */
    __updateChildIndexes: function() {
      var firstDirtyChildIndex;
      if((firstDirtyChildIndex = this.__firstDirtyChildIndex) < Infinity) {
        var children = this.children;
        var childCount = children.length;
        while(firstDirtyChildIndex < childCount) {
          children[firstDirtyChildIndex].__index = firstDirtyChildIndex;
          firstDirtyChildIndex++;
        }
        this.__firstDirtyChildIndex = Infinity;
      }
    },

    /**
     * Obtains the index of a given child node without bothering to update all children's child indexes.
     *
     * This method is useful when in the middle of structural changes to several of the child nodes.
     *
     * @param {!pentaho.lang.DomNode} child - The child node.
     * @return {number} The index of the given child node.
     * @private
     */
    __getChildIndexNoUpdate: function(child) {
      return this.__firstDirtyChildIndex < Infinity
          ? this.children.indexOf(this)
          : child.__index;
    },

    /**
     * Appends a given child node in the local children array, creating one if this is the first child.
     *
     * @param {!pentaho.lang.DomNode} child - The child node.
     * @return {number} The index at which the given child node was inserted.
     * @private
     */
    __appendChildCore: function(child) {

      var children = O.getOwn(this, "children") || (this.children = []);
      var index = children.length;

      children.push(child);

      return index;
    },

    /**
     * Removes the child node at the given index, which must be defined, from the children array.
     *
     * Updates the `__firstDirtyChildIndex` property accordingly.
     *
     * @param {number} index - The index of the child node to remove.
     * @return {!pentaho.lang.DomNode} The remove child node.
     * @private
     */
    __removeChildAtCore: function(index) {
      var children = this.children;
      var child = children[index];

      children.splice(index, 1);

      // note children.length is now less 1
      if(index < children.length && index < this.__firstDirtyChildIndex) {
        this.__firstDirtyChildIndex = index;
      }

      return child;
    },

    /**
     * Called when the parent of a node has changed.
     *
     * The default implementation notifies the parent nodes of the change,
     * by calling [_onChildRemoved]{@link pentaho.lang.DomNode#_onChildRemoved} for the old parent
     * and/or then [_onChildAdded]{@link pentaho.lang.DomNode#_onChildAdded} for the new parent.
     * If you override this method you must call the base implementation.
     *
     * Note that if a child does not change parent but changes position within a parent,
     * then [_onChildMoved]{@link pentaho.lang.DomNode#_onChildMoved} is called instead.
     *
     * @param {pentaho.lang.DomNode} newParent - The new parent, if any; `null` otherwise.
     * @param {?number} newIndex — The new child index, if there is a new parent; `null` otherwise.
     * @param {pentaho.lang.DomNode} oldParent - The old parent, if any; `null` otherwise.
     * @param {?number} oldIndex — The old child index, if there was an old parent; `null` otherwise.
     *
     * @protected
     *
     * @see pentaho.lang.DomNode#_onChildRemoved
     * @see pentaho.lang.DomNode#_onChildAdded
     * @see pentaho.lang.DomNode#_onChildMoved
     */
    _onParentChange: function(newParent, newIndex, oldParent, oldIndex) {

      if(oldParent !== null) {
        oldParent._onChildRemoved(this, oldIndex);
      }

      if(newParent !== null) {
        newParent._onChildAdded(this, newIndex);
      }
    },

    /**
     * Called when a child node has been added.
     *
     * The default implementation does nothing.
     *
     * @param {!pentaho.lang.DomNode} child — The new child node.
     * @param {number} index — The new child index.
     *
     * @protected
     *
     * @see pentaho.lang.DomNode#_onChildRemoved
     * @see pentaho.lang.DomNode#_onChildMoved
     */
    _onChildAdded: function(child, index) {
    },

    /**
     * Called when a child node has been removed.
     *
     * The default implementation does nothing.
     *
     * @param {!pentaho.lang.DomNode} child — The old child node.
     * @param {number} index — The old child index.
     *
     * @protected
     *
     * @see pentaho.lang.DomNode#_onChildAdded
     * @see pentaho.lang.DomNode#_onChildMoved
     */
    _onChildRemoved: function(child, index) {
    },

    /**
     * Called when a child node has changed its position.
     *
     * The default implementation does nothing.
     *
     * @param {!pentaho.lang.DomNode} child — The child node.
     * @param {number} newIndex — The new child index.
     * @param {number} oldIndex — The old child index.
     *
     * @protected
     *
     * @see pentaho.lang.DomNode#_onChildAdded
     * @see pentaho.lang.DomNode#_onChildRemoved
     */
    _onChildMoved: function(child, newIndex, oldIndex) {
    }
  });

  return DomNode;
});

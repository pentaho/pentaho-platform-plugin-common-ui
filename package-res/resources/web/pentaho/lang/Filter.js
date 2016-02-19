define([
  "cdf/lib/Base"
], function(Base) {
  "use strict";

  var Node = Base.extend({
    constructor: function(value) {
      this._value = value;
    },
    predicate: function(v) {
      return false;
    }
  });

  var AbstractPropertyFilter = Node.extend({
    get type() { return "abstract";},
    constructor: function(value, property) {
      this.base(value);
      this._property = property;
    },
    _method: null,
    predicate: function(v) {
      return this._method(v[this._property]);
    }
  });

  var IsEqual = AbstractPropertyFilter.extend({
    get type() { return "isEqual";},
    _method: function(v) {
      return this._value === v;
    }
  });

  var IsIn = AbstractPropertyFilter.extend({
    get type() { return "isIn";},
    _method: function(v) {
      var n = this._value.length;
      while(n--){
        if(this._value[n] === v)
          return true;
      }
      return false;
    }
  });


  var Tree = Node.extend({
    get type() { return "tree";},
    constructor: function() {
      this._children = [];
    },

    _children: null,
    get children() {
      return this._children;
    },

    insert: function(element) {
      this._children.push(element);
    },

    combine: function(a, b) {
      return false;
    },
    predicate: function(v) {
      var me = this;
      return this._children.reduce(function(memo, child) {
        return me.combine(memo, child.predicate(v));
      });
    }
  });

  var AbstractFilter = Tree.extend({
    contains: function(element){
      return false || true;
    },
    union: function(filter){
      return null || filter;
    },
    intersection: function(filter){
      return null || filter;
    },
    filter: function(rows){
      return null || rows;
    }
  });

  var FilterOr = AbstractFilter.extend({
    get type() { return "or";},
    combine: function(a, b) {
      return a || b;
    }
  });

  var FilterAnd = AbstractFilter.extend({
    get type() { return "and";},
    combine: function(a, b) {
      return a && b;
    }
  });

  var FilterRoot = FilterOr.extend({
  });

  return {
    // Leaf nodes
    IsEqual: IsEqual,
    IsIn: IsIn,
    // Non-leaf nodes
    Or: FilterOr,
    And: FilterAnd,
    Filter: FilterRoot
  };

});
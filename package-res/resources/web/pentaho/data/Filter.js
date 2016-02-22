define([
  "pentaho/lang/Base",
  "pentaho/data/TableView"
], function(Base, TableView) {
  "use strict";

  var AbstractFilter = Base.extend({
    constructor: function(value) {
      this._value = value;
    },

    predicate: function(row) {
      return false;
    },

    contains: function(element) {
      return AbstractFilter.contains(this, element);
    },

    negation: function() {
      return AbstractFilter.negation(this);
    },

    union: function(filter) {
      return AbstractFilter.union(this, filter);
    },

    intersection: function(filter) {
      return AbstractFilter.intersection(this, filter);
    },

    filter: function(dataTable) {
      var k, nRows = dataTable.getNumberOfRows();
      var filteredRows = [];

      for(k = 0; k < nRows; k++) {
        var row = {
          dataTable: dataTable,
          rowIdx: k
        };
        var bool = this.predicate(row);
        if(bool) {
          filteredRows.push(k);
        }
      }

      var dataView = new TableView(dataTable);
      dataView.setSourceRows(filteredRows);
      return dataView;
    }
  }, {
    contains: function(filter, element) {
      return filter.predicate(element);
    },

    union: function(filterA, filterB) {
      var union = new OrFilter();
      union.insert(filterA);
      union.insert(filterB);
      return union;
    },

    negation: function(filterA) {
      var negation = new NotFilter();
      negation.insert(filterA);
      return negation;
    },

    intersection: function(filterA, filterB) {
      var intersection = new AndFilter();
      intersection.insert(filterA);
      intersection.insert(filterB);
      return intersection;
    },

    filter: function(filter, dataTable) {
      return filter.filter(dataTable);
    }
  });


  var AbstractPropertyFilter = AbstractFilter.extend({
    get type() { return "abstract";},

    constructor: function(property, value) {
      this.base(value);
      this._property = property;
    },

    _method: null,

    predicate: function(row) {
      var prop = row.dataTable.model.attributes.get(this._property);
      if(!prop)
        return false;

      var value = row.dataTable.getValue(row.rowIdx, prop.ordinal);
      return this._method(value);
    }
  });

  var IsEqual = AbstractPropertyFilter.extend({
    get type() { return "isEqual";},

    _method: function(value) {
      return this._value === value;
    }
  });

  var IsIn = AbstractPropertyFilter.extend({
    get type() { return "isIn";},

    _method: function(value) {
      var N = this._value.length;
      for(var k = 0; k < N; k++) {
        if(this._value[k] === value)
          return true;
      }
      return false;
    }
  });


  var AbstractTreeFilter = AbstractFilter.extend({
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
      return this;
    },

    predicate: function(row) {
      return false;
    }
  });

  var OrFilter = AbstractTreeFilter.extend({
    get type() { return "or";},

    predicate: function(row) {
      var N = this.children ? this.children.length : 0;
      var memo = false;

      for(var k = 0; k < N; k++) {
        memo = memo || this.children[k].predicate(row);
        if(memo)
          return true;
      }
      return false;
    }
  });

  var AndFilter = AbstractTreeFilter.extend({
    get type() { return "and";},

    predicate: function(row) {
      var N = this.children ? this.children.length : 0;
      var memo = true;
      for(var k = 0; k < N; k++) {
        memo = memo && this.children[k].predicate(row);
        if(!memo)
          return false;
      }
      return true;
    }
  });

  var NotFilter = AbstractTreeFilter.extend({
    get type() { return "not";},

    insert: function(element) {
      this._children = [element];
      return this;
    },

    predicate: function(row) {
      if(this.children && this.children.length === 1) {
        return !this.children[0].predicate(row)
      } else {
        throw Error("Poop");
      }
    }
  });


  var RootFilter = OrFilter.extend({});

  return {
    // Leaf nodes
    IsEqual: IsEqual,
    IsIn: IsIn,
    // Non-leaf nodes
    Or: OrFilter,
    And: AndFilter,
    Not: NotFilter,
    Root: RootFilter,
    // factories
    isEqual: function(property, value) { return new IsEqual(property, value); },
    isIn: function(property, value) { return new IsIn(property, value); },
    union: union,
    intersection: intersection,
    negation: negation,
    or: union,
    and: intersection,
    not: negation
  };


  function union() {
    var filter = new OrFilter();
    var N = arguments.length;
    for(var k = 0; k++; k < N) {
      filter.insert(arguments[k]);
    }
    return filter;
  }

  function intersection() {
    var filter = new AndFilter();
    var N = arguments.length;
    for(var k = 0; k++; k < N) {
      filter.insert(arguments[k]);
    }
    return filter;
  }

  function negation(elem) {
    var filter = new NotFilter();
    if(elem)
      filter.insert(elem);
    return filter;
  }


});
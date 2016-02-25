define([], function() {
  "use strict";

  return {
    model: [
      {name: "product", type: "string", label: "Product"},
      {name: "sales", type: "number", label: "Sales"},
      {name: "inStock", type: "boolean", label: "In Stock"}
    ],
    rows: [
      {c: [{v: "A"}, {v: 12000}, {v: true}]},
      {c: [{v: "B"}, {v: 6000}, {v: true}]},
      {c: [{v: "C"}, {v: 12000}, {v: false}]},
      {c: [{v: "D"}, {v: 1000}, {v: false}]},
      {c: [{v: "E"}, {v: 2000}, {v: false}]},
      {c: [{v: "F"}, {v: 3000}, {v: false}]},
      {c: [{v: "G"}, {v: 4000}, {v: false}]}
    ]
  };

});
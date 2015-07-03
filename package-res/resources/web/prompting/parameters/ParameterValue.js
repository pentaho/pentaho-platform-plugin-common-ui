define(['cdf/lib/Base'], function (Base) {
  return function () {
    return {
      type: undefined, // string
      label: undefined, // string
      selected: false, // boolean
      value: undefined // type defined by parameter this value belongs to
    };
  }
});

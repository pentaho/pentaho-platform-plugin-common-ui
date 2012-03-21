// Implementation of the .bind method now included in ECMAScript 5th Edition
// (This is the exact implementation from Prototype.js)
//
// Used to encapsulate scope for a function call:
// (function(a, b) {
//   return this.doSomething(a) + b;
// }).bind(this);
//
if (!Function.prototype.bind) { // check if native implementation available
  Function.prototype.bind = function(){
    var fn = this, args = Array.prototype.slice.call(arguments),
      object = args.shift();
    return function(){
      return fn.apply(object,
        args.concat(Array.prototype.slice.call(arguments)));
    };
  };
}
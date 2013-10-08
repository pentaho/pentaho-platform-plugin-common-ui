/*!
* Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
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
*
*/

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

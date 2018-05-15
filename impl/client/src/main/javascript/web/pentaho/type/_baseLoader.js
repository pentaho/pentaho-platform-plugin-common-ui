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
  "./impl/Loader"
], function(Loader) {

  "use strict";

  // `./_baseLoader` creates/contains the `ILoader` singleton instance and nothing more.

  // Request `./loader` instead to be sure that all standard types can be requested synchronously.

  // For convenience, requesting the `Complex` class (like, for example, when defining a new complex type)
  // also loads some of the other standard types.

  return new Loader();
});

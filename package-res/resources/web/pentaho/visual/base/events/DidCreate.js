/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "../../../lang/Event"
], function(Event) {
  "use strict";

  /**
   * @name DidCreate
   * @memberOf pentaho.visual.base.events
   * @class
   * @extends pentaho.lang.Event
   *
   * @classDesc This event is emitted before the first time the visualization is updated without any errors.
   *
   * @constructor
   * @description Creates a `DidCreate` event.
   *
   * @param {!pentaho.visual.base.View} source - The view object that is emitting the event.
   */
  return Event.extend("pentaho.visual.base.events.DidCreate",
    /** @lends pentaho.visual.base.events.DidCreate# */{

      constructor: function(source) {
        this.base("did:create", source, false);
      },

      /**
       * Gets the visualization's DOM node created in the {@link pentaho.visual.base.Model#update|Model#update} loop.
       * 
       * This getter is syntax sugar for `this.source.domNode`.
       *
       * @type {Node|Text|HTMLElement} The visualization's DOM node.
       */
      get domNode() {
        return this.source.domNode;
      }
    }, /** @lends pentaho.visual.base.events.DidCreate */{

      /**
       * Gets the event type.
       *
       * @type string
       * @readonly
       */
      get type() {
        return "did:create";
      }
    });
});

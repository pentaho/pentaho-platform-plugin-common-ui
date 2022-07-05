/*!
 * Copyright 2010 - 2022 Hitachi Vantara. All rights reserved.
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
    "pentaho/module!_",
    "./Interaction"
], function(module, Interaction) {

    "use strict";

    return Interaction.extend(module.id, /** @lends pentaho.visual.action.Message# */{

        constructor: function (spec) {
            this.base(spec);

            this.msgId = spec.msgId;
            this.msgDesc = spec.msgDesc;
        },

        /** @inheritDoc */
        _fillSpec: function(spec) {
            this.base(spec)
            spec.msgId = this.msgId || "";
            spec.msgDesc = this.msgDesc || "";
        }

    },  /** @lends pentaho.visual.action.Message */{
        /** @inheritDoc */
        get id() {
            return module.id;
        }
    });
});
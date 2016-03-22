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

/**
 * @module pentaho.visual
 */

/**
 * This class is a **documentation artifact** that
 * describes possible _select mode_ values
 * as understood by the {{#crossLink "IVisual/select:event"}}{{/crossLink}} event.
 *
 * @class SelectionMode
 * @static
 */

/**
 * The _replace_ selection mode
 * replaces the current highlights with the
 * selections resulting from the
 * {{#crossLink "IVisual/select:event"}}{{/crossLink}} event.
 *
 * @property Replace
 * @type String
 * @default "REPLACE"
 * @final
 */

/**
 * The _toggle_ selection mode
 * preserves the current highlights,
 * yet toggling the _highlighted_ state of
 * each of the specified selections.
 *
 * @property Toggle
 * @type String
 * @default "TOGGLE"
 * @final
 */

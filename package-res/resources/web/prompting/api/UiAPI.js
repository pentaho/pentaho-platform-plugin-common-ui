/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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

/**
 * This is the prompting user interface API class. Contains all general functions for working with the prompting user interface.
 *
 * @name UiAPI
 * @class
 */
define([], function() {
  return function(api) {
    /**
     * Makes visible the progress indicator.
     * By default it adds elements to the DOM to give the appearance and behavior of blocking user interaction.
     * For example, this API function can be used during long-running calls or to show a special popup with messages.
     * To cancel this action can be used {@link UiAPI#hideProgressIndicator}.
     *
     * @name UiAPI#showProgressIndicator
     * @method
     * @example
     *     api.ui.showProgressIndicator();
     */
    this.showProgressIndicator = function() {
      api.operation._getPromptPanel().showProgressIndicator();
    };

    /**
     * Hides the progress indicator.
     * The main use-case of this API function is cancel the {@link UiAPI#showProgressIndicator} action.
     * By default it removes elements from the DOM to hide the progress indicator and unblock user interaction.
     *
     * @name UiAPI#hideProgressIndicator
     * @method
     * @example
     *     api.ui.hideProgressIndicator();
     */
    this.hideProgressIndicator = function() {
      api.operation._getPromptPanel().hideProgressIndicator();
    };
  };
});

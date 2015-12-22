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
     * Shows the progress indicator by calling the function PromptPanel#showProgressIndicator.
     *
     * @name UiAPI#showProgressIndicator
     * @method
     * @example
     *     api.ui.showProgressIndicator();
     */
    this.showProgressIndicator = function() {
      api.operation._getPromptPanel().showProgressIndicator();
    };
  };
});

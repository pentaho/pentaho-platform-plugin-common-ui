/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


/**
 * Starts a periodical check for the expired session
 */
define("common-ui/util/SessionExpiryCheckStartingPoint", [], function () {
  return {

    POLLING_MILLISECONDS: 5000,

    isRunningIFrameInSameOrigin: false,

    init: function () {
      try {
        var ignoredCheckCanReachOutToParent = window.top.mantle_initialized;
        this.isRunningIFrameInSameOrigin = true;
      } catch (ignoredSameOriginPolicyViolation) {
        // IFrame is running embedded in a web page in another domain
        this.isRunningIFrameInSameOrigin = false;
      }

      if (this.isRunningIFrameInSameOrigin && window.top.executeCommand) {
        //Starts the check
        window.top.executeCommand("SessionExpiredCommand", {pollingInterval: this.POLLING_MILLISECONDS});
      }
    }

  }
});

require(["common-ui/util/SessionExpiryCheckStartingPoint"], function (AuthenticationPrompt) {
  AuthenticationPrompt.init();
});

/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/



define(['cdf/lib/Base', '../components/ScrollingPromptPanelLayoutComponent'],
    function (Base, ScrollingPromptPanelLayoutComponent) {

      return Base.extend({
        build: function (promptPanel) {

          var name = 'prompt' + promptPanel.guid;
          return new ScrollingPromptPanelLayoutComponent({
            name: name,
            type: 'ScrollingPromptPanelLayoutComponent',
            htmlObject: promptPanel.destinationId,
            promptPanel: promptPanel,
            components: promptPanel.buildPanelComponents(),
            postExecution: function () {
              promptPanel._ready();
            }
          });
        }
      });
    });

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
define([
  "module",
  "common-ui/angularjs",
  "common-ui/angularjs-animate",
  "pentaho/common/angularjs/hostDialogModule",
  "common-ui/uirouter/angularjs"
], function(module, angularJs, angularJsAnimate, hostDialogModule) {

  "use strict";

  var deps = [
    "ngAnimate",
    "ui.router",
    hostDialogModule.name
  ];

  var angularJsModule = angularJs.module(module.id, deps);

  // UI-Router config
  angularJsModule.config(["$stateProvider", function($stateProvider) {

    $stateProvider
        .state("intro", {
          template: "<intro></intro>"
        })
        .state('summary', {
          template: "<summary></summary>"
        });
  }]);

  angularJsModule.run(["$state", function($state) {
    $state.go("intro");
  }]);

  angularJsModule.component("intro", {
    bindings: {},
    controllerAs: "vm",
    template:
        "<div>\n" +
          "<div class=\"dialog-content\">\n" +
            "<h2>{{::vm.message}}</h2>\n" +
          "</div>\n" +
          "<div class=\"button-panel\">\n" +
            "<button class=\"pentaho-button\" type=\"button\" ng-click=\"vm.cancel()\">Cancel</button>\n" +
            "<button class=\"pentaho-button\" type=\"button\" ng-click=\"vm.goSummary()\">Go Summary</button>\n" +
          "</div>\n" +
        "</div>",

    controller: ["$state", hostDialogModule.$serviceName, function($state, hostDialogService) {

      this.message = "Hello from `intro` component.";

      this.$onInit = function() {
        hostDialogService.setTitle("Sample Dialog - Introduction Step");
      };

      this.cancel = function() {
        hostDialogService.cancel();
      };

      this.goSummary = function() {
        $state.go("summary");
      };
    }]
  });

  angularJsModule.component("summary", {
    bindings: {},
    controllerAs: "vm",
    template:
        "<div>\n" +
          "<div class=\"dialog-content\">\n" +
            "<h2>{{::vm.message}}</h2>\n" +
          "</div>\n" +
          "<div class=\"button-panel\">\n" +
            "<button class=\"pentaho-button\" type=\"button\" ng-click=\"vm.cancel()\">Cancel</button>\n" +
            "<button class=\"pentaho-button\" type=\"button\" ng-click=\"vm.goIntro()\">Go Intro</button>\n" +
            "<button class=\"pentaho-button\" type=\"button\" ng-click=\"vm.accept()\">Accept</button>\n" +
          "</div>\n" +
        "</div>",

    controller: ["$state", hostDialogModule.$serviceName, function($state, hostDialogService) {

      this.message = "Hello from `summary` component.";

      this.$onInit = function() {
        hostDialogService.setTitle("Sample Dialog - Summary Step");
      };

      this.goIntro = function() {
        $state.go("intro");
      };

      this.cancel = function() {
        hostDialogService.cancel();
      };

      this.accept = function() {
        hostDialogService.accept();
      };
    }]
  });

  return angularJsModule;
});


/*
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright 2014 Pentaho Corporation.  All rights reserved.
 */

pen.require([
  'common-ui/angular',
  'common-ui/angular-directives/angular-directives'
  ],
  function(angular) {
    angular.module('folderBrowserSample', ['folderBrowser'])
      .controller('FolderBrowserSampleController', 
        ["$scope", "$http", function($scope, $http) {
          $scope.sample = {
            addFolder: undefined,
            externalSelect: undefined,
            treeModel: {},
            isLoading: false,
            onSelect: function(selectedNode) {

            },
            selectedNode: undefined,
            refreshTree: function() {
              $scope.sample.isLoading = true;
              $http.get('folderBrowserSample/treeModel.json')
                .then(function(response){
                  $scope.sample.treeModel = response.data;
                })["finally"]( function() {
                  $scope.sample.isLoading = false;
                });
            },
            newFolder: "",
            addNewFolder: function() {
              var f = this.newFolder;
              this.addFolder = { name: f, localizedName: f };
            },
            selectThis: function(node) {
              this.externalSelect = { attr: 'path', val: node };
            }
          };

          $scope.sample.refreshTree();
        }
      ]);
  }
);


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
            onSelect: function(selectedNode) {

            },
            selectedNode: undefined,
            refreshTree: function() {
              $http.get('folderBrowserSample/treeModel.json')
                .then(function(response){
                  $scope.sample.treeModel = response.data;
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

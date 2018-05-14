/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Steve
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

define([
  'common-ui/angular',
  'common-ui/util/spin',
  'common-ui/util/PentahoSpinner'
],

    function (angular, Spinner, spin) {

      angular.module('folderBrowser', [])
          .directive('treecontrol', ['$compile', '$location', '$anchorScroll',
            function ($compile, $location, $anchorScroll) {
              return {
                restrict: 'A',
                require: "treecontrol",
                transclude: true,
                scope: {
                  treeModel: "=",
                  extSelect: "=",
                  addFolder: "=",
                  selectedNode: "=",
                  onSelection: "&",
                  nodeChildren: "@",
                  loading: "=?"
                },

                controller: function ($scope) {

                  $scope.nodeChildren = $scope.nodeChildren || 'children';
                  $scope.expandedNodes = {};
                  $location.hash("");
                  $scope.spinner = undefined;

                  $scope.headClass = function (node) {

                    if (angular.isArray(node[$scope.nodeChildren]) && node[$scope.nodeChildren].length > 0 && !$scope.expandedNodes[node.path])
                      style = "tree-collapsed";
                    else if (angular.isArray(node[$scope.nodeChildren]) && node[$scope.nodeChildren].length > 0 && $scope.expandedNodes[node.path])
                      style = "tree-expanded";
                    else
                      style = "tree-collapsed";
                    return style;
                  };

                  $scope.selectorClass = function (node) {
                    var style = "";
                    if (angular.isArray(node[$scope.nodeChildren]) && node[$scope.nodeChildren].length > 0 && !$scope.expandedNodes[node.path])
                      style = "arrow-collapsed";
                    else if (angular.isArray(node[$scope.nodeChildren]) && node[$scope.nodeChildren].length > 0 && $scope.expandedNodes[node.path])
                      style = "arrow-expanded";
                    else
                      style = "blank"
                    return style;
                  };

                  $scope.findNodeByAttr = function (attr, val) {

                    $scope.treeModel;
                    var foundNode = false;
                    var nodeWithAttr;
                    var rootChildren = $scope.treeModel.children;

                    recurseChildren = function (children) {
                      if (foundNode == false) {

                        for (var i = 0; i < children.length; i++) {

                          if (children[i][attr] == val) {
                            foundNode = true;
                            nodeWithAttr = children[i];

                          } else {
                            if (angular.isArray(children[i].children) && children[i].children.length > 0) {
                              recurseChildren(children[i].children);
                            }
                          }
                          if (foundNode == true) {
                            break;
                          }
                        }
                      }
                    }

                    recurseChildren(rootChildren);
                    return {
                      node: nodeWithAttr
                    };

                  };

                  $scope.nodeExpanded = function (node) {
                    return $scope.expandedNodes[node.path];
                  };

                  $scope.expandParents = function (node) {
                    //clear existing selections
                    $scope.expandedNodes = [];
                    var path = node.path;

                    if (path) {
                      //break down path and add each node id to expanded nodes
                      while ((path.split("/").length - 1) > 1) {
                        var index = path.lastIndexOf("/");
                        //new path at previous level
                        path = path.replace(path.substring(index, path.length), "");
                        //set node to expanded
                        $scope.expandedNodes[path] = true;
                      }

                      //add root folder to expanded nodes
                      $scope.expandedNodes[path] = true;

                    }

                  };

                  $scope.selectNodeHead = function (node) {
                    $scope.expandedNodes[node.path] = !$scope.expandedNodes[node.path];
                  };

                  $scope.selectNodeHeadExt = function (node) {
                    if (!$scope.expandedNodes[node.path]) {
                      $scope.expandedNodes[node.path] = true;
                    }
                  };

                  $scope.selectNodeLabel = function (selectedNode) {

                    $scope.selectedScope = selectedNode.path;
                    $scope.selectedNode = selectedNode;
                    if ($scope.onSelection)
                      $scope.onSelection({
                        node: selectedNode
                      });

                  };

                  $scope.selectedClass = function (node) {

                    var style = ""
                    if ($scope.selectedScope == node.path) {
                      angular.element(".tree-selected").removeClass('tree-selected');
                      angular.element("#" + node.id).addClass("tree-selected");
                      style = "tree-selected";
                      if ($scope.extSelect && node.path == $scope.extSelect.val) {
                        //Scroll to div
                        var locationHash = $location.hash();
                        if (locationHash != node.id) {
                          $location.hash(node.id);
                          $anchorScroll();

                        }
                      }

                    }

                    return style;
                  };


                  //tree templates
                  var childTemplate =
                      '<ul class="treecontrol">' +
                          '<li ng-repeat="node in node.' + $scope.nodeChildren + '" ng-class="headClass(node)">' +
                          '<div id="{{node.id}}">' +
                          '<span ng-class="selectorClass(node)" ng-click="selectNodeHead(node)"></span>' +
                          '<i class="tree-has-children" ng-click="selectNodeLabel(node)" ng-dblclick="selectNodeHead(node)"></i>' +
                          '<i class="tree-normal"></i>' +
                          '<div class="tree-label" ng-class="selectedClass(node)" ng-click="selectNodeLabel(node)" ng-dblclick="selectNodeHead(node)" tree-transclude></div>' +
                          '</div>' +
                          '<div treeitem class="treeitem" ng-if="nodeExpanded(node)"></>' +
                          '</li>' +
                          '</ul>';

                  var rootTemplate =
                      '<div class="treeControlView treeControlLoading" ng-show="loading"><div class="spin"></div></div>' +
                          '<div class="treeControlView" ng-hide="loading">' +
                          childTemplate +
                          '</div>';

                  return {
                    templateRoot: $compile(rootTemplate),
                    templateChild: $compile(childTemplate)
                  }

                },

                compile: function (element, attrs, childTranscludeFn) {
                  return function (scope, element, attrs, treemodelCntr) {

                    function updateNodeOnRootScope(newValue) {
                      if (angular.isArray(newValue)) {
                        scope.node = {};
                        scope.node[scope.nodeChildren] = newValue;
                      } else {
                        scope.node = newValue;
                      }
                    }

                    function extSelectEvent() {
                      if (scope.extSelect && scope.extSelect.attr) {
                        var obj = scope.findNodeByAttr(scope.extSelect.attr, scope.extSelect.val);
                        scope.selectedNode = obj.node;
                        scope.expandParents(scope.selectedNode);
                        scope.selectNodeHeadExt(scope.selectedNode);
                        scope.selectNodeLabel(scope.selectedNode);
                      } else {
                        scope.expandedNodes = {};
                        scope.selectedNode = {};
                      }
                    }


                    function addFolderEvent() {
                      //make sure that addFolder is populated and we have a node selected
                      if (scope.addFolder && scope.addFolder.id && scope.addFolder.name && scope.selectedNode) {

                        var nodePath = "";
                        if (scope.addFolder.path) {
                          nodePath = scope.addFolder.path;
                        }
                        else {
                          nodePath = scope.selectedNode.path + "/" + scope.addFolder.name;
                        }

                        //Clean up optional attributes of the node
                        if (!scope.addFolder.children) {
                          scope.addFolder.children = [];
                        }

                        if (!scope.addFolder.permissions) {
                          scope.addFolder.permissions = scope.selectedNode.permissions;
                        }

                        if (!scope.addFolder.localizedName) {
                          scope.addFolder.localizedName = scope.addFolder.name;
                        }

                        var newFolder =
                        {
                          id: scope.addFolder.id,
                          name: scope.addFolder.name,
                          localizedName: scope.addFolder.localizedName,
                          isFolder: true,
                          path: nodePath,
                          children: scope.addFolder.children,
                          permissions: scope.addFolder.permissions
                        }
                        //push new folder onto root of current selection
                        scope.selectedNode.children.push(newFolder);

                        //select new folder
                        scope.selectedNode = newFolder;
                        scope.expandParents(scope.selectedNode);
                        scope.selectNodeHeadExt(scope.selectedNode);
                        scope.selectNodeLabel(scope.selectedNode);
                      }
                    }

                    initSpinner = function () {
                      if (spin.getLargeConfig && !scope.spinner) {
                        var config = spin.getLargeConfig();
                        var spinContainer = angular.element(".treeControlView.treeControlLoading .spin")[0];
                        var spinnage = new Spinner(config);
                        spinnage.spin(spinContainer);
                        scope.spinner = spinnage;
                      }
                    }

                    scope.$watch("treeModel", updateNodeOnRootScope);
                    updateNodeOnRootScope(scope.treeModel);

                    scope.$watch("extSelect", extSelectEvent);

                    scope.$watch("addFolder", addFolderEvent);

                    scope.$watch("loading", initSpinner);

                    //Rendering template for a root node
                    treemodelCntr.templateRoot(scope, function (clone) {
                      element.html('').append(clone);
                    });
                    // save the transclude function from compile (which is not bound to a scope as apposed to the one from link)
                    // we can fix this to work with the link transclude function with angular 1.2.6. as for angular 1.2.0 we need
                    // to keep using the compile function
                    scope.$treeTransclude = childTranscludeFn;

                  }
                }
              };
            }
          ])
          .directive("treeitem", function () {
            return {
              restrict: 'EA',
              require: "^treecontrol",
              link: function (scope, element, attrs, treemodelCntr) {

                // Rendering template for the current node
                treemodelCntr.templateChild(scope, function (clone) {
                  element.html('').append(clone);
                });
              }
            }
          })
          .directive("treeTransclude", function () {
            return {
              link: function (scope, element, attrs, controller) {
                scope.$treeTransclude(scope, function (clone) {
                  element.empty();
                  element.append(clone);
                });
              }
            }
          });

    });
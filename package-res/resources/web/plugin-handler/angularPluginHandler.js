/*
 * An implementation of the plugin handler for use with AngularJS. Also requires jQuery
 *
 * THIS MUST BE RUN BEFORE THE DOCUMENT IS BOOTSTRAPPED
 * To allow for lazy loading of plugins, when configuring the module where the plugin will be stored,
 * the module must have specific providers attached to the module. You must use the convenience 
 * function "module" to create the module to do this work for you. Your own configurations can also be provided
 * and not conflict with the actions performed in "makePluggable" called from "module".
 *
 * CONFIG for Plugin
 * {
 *		moduleName : String
 *		routerCallback : function($routeProvider) {},
 *		controllerCallback : function($controllerProvider) {},
 *		serviceCallback : function($serviceProvider) {},
 *		factoryCallback : function($factoryProvider) {},
 *		filterCallback : function($filterProvider) {},
 *		directiveCallback : function($directiveProvider) {}
 * }
 */

var deps = [
	'common-ui/Plugin',
	'common-ui/PluginHandler', 
	'common-ui/angular', 
	'common-ui/angular-route'
];

pen.define(deps, function(PentahoPlugin, PentahoPluginHandler) {

	var AngularPluginHandler = ring.create([PentahoPluginHandler], {

		init : function() {
			this.$super();

			this.docBootstrapped = false;
		},

		// Provide function for onRegister
		_onRegister : function(plugin) {

			// Retrieve module
			var module = angular.module(plugin.moduleName);	

			// Verify the module has been made pluggable
			if (!module.isPluggable) {
				throw "Module '" + plugin.moduleName + "' has not been made pluggable";
			}

			// Define custom RouteProvider
			var RouteProvider = {
				when : function(url, properties) {
					url = _getNamespacedUrl(url, plugin.moduleName);

					plugin.routes.push(url);

					if (this.docBootstrapped) {
						module.$routeProvider.when(url, properties)					
					} else {
						module.config(['$routeProvider', function($routeProvider) {
							$routeProvider.when(url, properties);
						}])
					}				

					return RouteProvider;
				},
				otherwise : function() {
					console.log("Angular's OTHERWISE property is not allowed to be used");
				}
			}

			// Define custom Controller
			var Controller = function(name, def) {
				plugin.controllers.push(name);

				this.docBootstrapped ? 
					module.$controllerProvider.register(name, def) :
					module.controller(name, def);			
			}

			// Define custom Service
			var Service = function(name, def) {			
				plugin.services.push(name);

				this.docBootstrapped ?
					module.$provide.service(name, def) :
					module.service(name, def);
			}

			// Define custom Factory provider
			var Factory = function(name, def) {
				plugin.factories.push(name);

				this.docBootstrapped ? 
					module.$provide.factory(name, def) :
					module.factory(name, def);
			}

			var Filter = function(name, def) {
				plugin.filters.push(name);

				this.docBootstrapped ? 
					module.$filterProvider.register(name, def) :
					module.filter(name, def);
			}

			var Directive = function(name, def) {
				plugin.directives.push(name);

				this.docBootstrapped ? 
					module.$compileProvider.directive(name, def) :
					module.directive(name, def)
			}

			// Create routes			
			if (plugin.config.routerCallback) {
				plugin.config.routerCallback.call(this, RouteProvider);
			}

			// Call controller callback
			if (plugin.config.controllerCallback) {
				plugin.config.controllerCallback.call(this, Controller);	
			}
			
			// Call service callback
			if (plugin.config.serviceCallback) {
				plugin.config.serviceCallback.call(this, Service);	
			}

			if (plugin.config.factoryCallback) {
				plugin.config.factoryCallback.call(this, Factory)
			}

			if (plugin.config.filterCallback) {
				plugin.config.filterCallback.call(this, Filter);
			}

			if (plugin.config.directiveCallback) {
				plugin.config.directiveCallback.call(this, Directive);
			}
		},

		// Provide function for onUnregister
		_onUnregister : function(plugin) {
			// Retrieve module
			var module = angular.module(plugin.moduleName);

			// Unbind Controllers
			$(plugin.controllers).each(function(i, controller) {
				module.$controllerProvider.register(controller, null);
			})

			// Unbind Services
			$(plugin.services).each(function(i, service) {
				module.$provide.service(service, null);
			})
			
			// Unbind routes
			$(plugin.routes).each(function(i, route) {
				module.$routeProvider
					.when(route, {
						// TODO : find way to retrieve default location of otherwise binding
						redirectTo : "/"
					});
				});

			// Unbind factories
			$(plugin.factories).each(function(i, factory) {
				module.$provide.factory(factory, null);
			})

			// Unbind filters
			$(plugin.filters).each(function(i, filter) {
				module.$filterProvider.register(filter, null);
			})

			// Unbind directives
			$(plugin.directives).each(function(i, directive) {
				module.$compileProvider.directive(name, null);
			})
		},

		// Provide a method for creating the angular module and adding the necessary dependencies
		module : function(moduleName, deps, config) {

			// Include ngRoute
			deps.push('ngRoute');

			// Create module
			var module = angular.module(moduleName, deps, config);

			// Provide the ability to plug in to the module post bootstrap
			this._makePluggable(module);

			return module;
		},

		// This attaches the appropriate methods and objects directly to the module to allow the module
		// to be pluggable later
		_makePluggable : function(module) {
			module.isPluggable = true;

			module.config(['$routeProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', 
				function ($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
					module.$controllerProvider = $controllerProvider;
			        module.$compileProvider    = $compileProvider;
			        module.$routeProvider      = $routeProvider;
			        module.$filterProvider     = $filterProvider;
			        module.$provide            = $provide;

			        this.docBootstrapped = true;
			    }]);

			// Add location to any module for $location navigation
			var self = this;
			module.run(["$location", "$rootScope", function($location, $rootScope) {
				module.$location = $location;
				module.$rootScope = $rootScope;

				// Provide goto and goHome at the root scope
				$rootScope.goto = function(url) {
					self.goto(url, module.name);
				}
				$rootScope.goHome = function() {
					self.goHome(module.name);
				}
			}])
		},

		// Requires a module name as a namespace
		goto : function(hashUrl, moduleName) {
			_gotoDirect(_getNamespacedUrl(hashUrl, moduleName), angular.module(moduleName));
		},

		// Goes directly back to the root;
		goHome : function(moduleName) {
			_gotoDirect("/", angular.module(moduleName));
		}
	});

	// Navigates to a location in the browsers
	var _gotoDirect = function(hashUrl, module) {
		module.$location.path(_cleanHashUrl(hashUrl));

		if(!module.$rootScope.$$phase) {
			module.$rootScope.$apply();
		}
	}

	// Returns a namespaced url
	var _getNamespacedUrl = function(hashUrl, moduleName) {
		return "/" + moduleName + "/" + _cleanHashUrl(hashUrl);
	}

	// Strips all leading elements from the hash url
	var _cleanHashUrl = function(hashUrl) {
		var firstChar = hashUrl.charAt(0);
		while (firstChar == "#" || firstChar == "/") {
			hashUrl = hashUrl.slice(1);
			firstChar = hashUrl.charAt(0)
 		}

 		return hashUrl;
	}

	return AngularPluginHandler;
});
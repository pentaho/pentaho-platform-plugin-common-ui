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
 *			routerCallback : function($routeProvider) {},
 *			controllerCallback : function($controllerProvider) {},
 *			serviceCallback : function($serviceProvider) {},
 *			factoryCallback : function($factoryProvider) {},
 *			filterCallback : function($filterProvider) {}
 *		}
 * }
 */

var deps = [
	'common-ui/PluginHandler', 
	'common-ui/angular', 
	'common-ui/angular-route'
];

pen.define(deps, function(PluginHandler) {
	
	// Define an extended plugin of PluginHandler.Plugin
	var Plugin = function(moduleName, config, onRegister, onUnregister) {
		$.extend(this, new PluginHandler.Plugin([_onRegister, onRegister], [_onUnregister, onUnregister]));		

		this.moduleName 	= moduleName;		
		this.config 		= config;
		this.routes 		= [];
		this.controllers 	= [];
		this.services 		= [];
		this.factories 		= [];
		this.filters 		= [];

		this.goto = function(url) {
			goto(url, moduleName);
		}

		this.goHome = function() {
			goHome(moduleName);
		}

		var baseToString = this.toString;
		this.toString = function() {
			return "ANGULAR_PLUGIN[" + moduleName + "] -- " + baseToString.call(this);
		}
	};	

	var docBootstrapped = false;

	// Provide function for onRegister
	var _onRegister = function(plugin) {

		// Retrieve module
		var module = angular.module(plugin.moduleName);	

		// Verify the module has been made pluggable
		if (!module.isPluggable) {
			throw "Module '" + plugin.moduleName + "' has not been made pluggable";
		}

		// Define custom RouteProvider
		var RouteProvider = {
			when : function(url, properties) {
				url = getNamespacedUrl(url, plugin.moduleName);

				plugin.routes.push(url);

				if (docBootstrapped) {
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

			docBootstrapped ? 
				module.$controllerProvider.register(name, def) :
				module.controller(name, def);			
		}

		// Define custom Service
		var Service = function(name, def) {			
			plugin.services.push(name);

			docBootstrapped ?
				module.$provide.service(name, def) :
				module.service(name, def);
		}

		// Define custom Factory provider
		var Factory = function(name, def) {
			plugin.factories.push(name);

			docBootstrapped ? 
				module.$provide.factory(name, def) :
				module.factory(name, def);
		}

		var Filter = function(name, def) {
			plugin.filters.push(name);

			docBootstrapped ? 
				module.$filterProvider.register(name, def) :
				module.filter(name, def);
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
	}

	// Provide function for onUnregister
	var _onUnregister = function(plugin) {
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
	}

	// Provide a method for creating the angular module and adding the necessary dependencies
	var module = function(moduleName, deps, config) {

		// Include ngRoute
		deps.push('ngRoute');

		// Create module
		var module = angular.module(moduleName, deps, config);

		// Provide the ability to plug in to the module post bootstrap
		this.makePluggable(module);

		return module;
	}

	// This attaches the appropriate methods and objects directly to the module to allow the module
	// to be pluggable later
	var makePluggable = function(module) {
		module.isPluggable = true;

		module.config(['$routeProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', 
			function ($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
				module.$controllerProvider = $controllerProvider;
		        module.$compileProvider    = $compileProvider;
		        module.$routeProvider      = $routeProvider;
		        module.$filterProvider     = $filterProvider;
		        module.$provide            = $provide;

		        docBootstrapped = true;
		    }]);

		// Add location to any module for $location navigation
		module.run(["$location", "$rootScope", function($location, $rootScope) {
			module.$location = $location;
			module.$rootScope = $rootScope;

			// Provide goto and goHome at the root scope
			$rootScope.goto = function(url) {
				goto(url, module.name);
			}
			$rootScope.goHome = function() {
				goHome(module.name);
			}
		}])
	}
	
	// Navigates to a location in the browsers
	var gotoDirect = function(hashUrl, module) {
		module.$location.path(cleanHashUrl(hashUrl));

		if(!module.$rootScope.$$phase) {
			module.$rootScope.$apply();
		}
	}

	// Returns a namespaced url
	var getNamespacedUrl = function(hashUrl, moduleName) {
		return "/" + moduleName + "/" + cleanHashUrl(hashUrl);
	}

	// Strips all leading elements from the hash url
	var cleanHashUrl = function(hashUrl) {
		var firstChar = hashUrl.charAt(0);
		while (firstChar == "#" || firstChar == "/") {
			hashUrl = hashUrl.slice(1);
			firstChar = hashUrl.charAt(0)
 		}

 		return hashUrl;
	}

	// Requires a module name as a namespace
	var goto = function(hashUrl, moduleName) {
		gotoDirect(getNamespacedUrl(hashUrl, moduleName), angular.module(moduleName));
	}

	// Goes directly back to the root;
	var goHome = function(moduleName) {
		gotoDirect("/", angular.module(moduleName));
	}


	// Extend the PluginHandler into a new object
	var returnObj = $.extend({
		Plugin : Plugin,
		module : module,
		makePluggable : makePluggable,
		goto : goto,
		goHome : goHome
	}, PluginHandler);

	// Override plugin from PluginHandler with current instance
	returnObj.Plugin = Plugin;

	return returnObj;
});
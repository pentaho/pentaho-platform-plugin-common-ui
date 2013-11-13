/*
 * An implementation of the plugin handler for use with AngularJS. Also requires jQuery
 *
 * THIS MUST BE RUN BEFORE THE DOCUMENT IS BOOTSTRAPPED
 * To allow for lazy loading of plugins, when configuring the module where the plugin will be stored,
 * the module must have specific providers attached to the module. You must use the convenience 
 * function "makePluggable" to do this work for you. Your own configuration can also be provided
 * and not conflict with the actions performed in "makePluggable".
 *
 * RouterCallback : This is a function that recieves a $routeProvider as its only parameter
 * EXAMPLE: var routerCallback = function($routeProvider) {
 * 		$routeProvider
 *			.when(##url##, ##properties##)
 *			.when(##url##, ##properties##);
 * }
 * NOTE: Due to support for multiple views, .otherwise is not supported
 *
 * ControllerCallback : This is a function that receives the controller provider as its only parameter
 * EXAMPLE: var controllerCallback = function($controller) {
 *		$controller(##controller-name##, ##controller-definition##)
 *		$controller(##controller-name##, ##controller-definition##)
 * }
 *
 * ServiceCallback : This is a function that receives the service provider as its only parameter
 * EXAMPLE: var serviceCallback = function($service) {
 *		$service(##service-name##, ##service-definition##)
 *		$service(##service-name##, ##service-definition##)
 * }
 */

pen.define(['common-ui/PluginHandler', 'common-ui/jquery', 'common-ui/angular', 'common-ui/angular-route'], function(PluginHandler) {
	// Define an extended plugin of PluginHandler.Plugin
	var AngularPlugin = function(moduleName, routerCallback, controllerCallback, serviceCallback, onRegister, onUnregister) {
		$.extend(this, new PluginHandler.Plugin([_onRegister, onRegister], [_onUnregister, onUnregister]));		

		this.moduleName = moduleName;		
		this.routerCallback = routerCallback;
		this.controllerCallback = controllerCallback;
		this.serviceCallback = serviceCallback;
		this.routes = [];
		this.controllers = [];
		this.services = [];
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

		// Create routes			
		if (plugin.routerCallback) {
			plugin.routerCallback.call(this, RouteProvider);
		}

		// Call controller callback
		if (plugin.controllerCallback) {
			plugin.controllerCallback.call(this, Controller);	
		}
		
		// Call service callback
		if (plugin.serviceCallback) {
			plugin.serviceCallback.call(this, Service);	
		}
	}

	// Provide function for onUnregister
	var _onUnregister = function(plugin) {
		// Retrieve module
		var module = angular.module(plugin.moduleName);

		// Unbind Controllers
		$(plugin.controllers).each(function(i, controller) {
			module.$controllerProvider.register(controller.name, null);
		})

		// Unbind Services
		$(plugin.services).each(function(i, service) {
			module.$provide.service(service.name, null);
		})
		
		// Unbind routes
		$(plugin.routes).each(function(i, route) {
			module.$routeProvider
				.when(route.url, {
					// TODO : find way to retrieve default location of otherwise binding
					redirectTo : "/"
				});
			});
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

	return $.extend({
		AngularPlugin : AngularPlugin,
		makePluggable : makePluggable,
		goto : goto,
		goHome : goHome
	}, PluginHandler)
});
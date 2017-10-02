/* Overridden to gracefully support r.js compilation */

define([
	'exports',
	'require',
	'../has'
], function(exports, require, has){
	var defId = has('config-requestProvider'),
		platformId;

	if(has('host-browser')){
		platformId = './xhr';
	}else if(has('host-node')){
		platformId = './node';
	/* TODO:
	}else if(has('host-rhino')){
		platformId = './rhino';
   */
	}

	if(!defId){
		defId = platformId;
	}

	exports.getPlatformDefaultId = function(){
		return platformId;
	};

	exports.load = function(id, parentRequire, loaded, config){
    // When compiling in r.js, just signal not to include the resource in the bundle.
    if(config && config.isBuild) {
      return loaded();
    }

		require([id == 'platform' ? platformId : defId], function(provider){
			loaded(provider);
		});
	};
});

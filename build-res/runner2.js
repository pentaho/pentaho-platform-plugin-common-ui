window.testUrl = "";
window.testModule = "";

// parse out our test URL and our Dojo URL from the query string
var qstr = window.location.search.substr(1);
if(qstr.length){
    var qparts = qstr.split("&");
    for(var x=0; x<qparts.length; x++){
        var tp = qparts[x].split("="), name=tp[0], value=tp[1].replace(/[<>"':\(\)]/g, "");	// replace() to avoid XSS attack
        //Avoid URLs that use the same protocol but on other domains, for security reasons.
        if (value.indexOf("//") === 0 || value.indexOf("\\\\") === 0) {
            throw "Insupported URL";
        }
        switch(name){
            case "dojoUrl":
            case "testUrl":
            case "testModule":
                window[name] = value;
                break;
            case "registerModulePath":
                var modules = value.split(";");
                window.registerModulePath=[];
                for (var i=0; i<modules.length;i++){
                    window.registerModulePath.push(modules[i].split(","));
                }
            break;
        }
    }
}

function resetCoverage() {
    var coverage = top.opener._$jscoverage;
    if(!coverage) {
        coverage = top._$jscoverage;
    };
    for(var file in coverage) {
        for(var idx=0; idx<coverage[file].length; idx++) {
            if(coverage[file][idx]) {
                coverage[file][idx] = 0;
            }
        }
    }
}
            
try{
    dojo.require("doh.runner");
}catch(e){
     document.write("<scr"+"ipt type='text/javascript' src='"+CONTEXT_PATH+"/content/common_ui/resources/web/dojo/util/doh/runner.js'></scr"+"ipt>");
}
if((''+window.testUrl.constructor).indexOf('Array') != -1) {
    for(var idx=0; idx<testUrl.length; idx++) {
        document.write("<scr"+"ipt type='text/javascript' src='../../../../../"+testUrl[idx]+".js'></scr"+"ipt>");
    }
}            
else if(testUrl.length){
    document.write("<scr"+"ipt type='text/javascript' src='"+testUrl+".js'></scr"+"ipt>");
}

function setupTestRunner() {

    var html = ''+
		'<table id="testLayout" cellpadding="0" cellspacing="0" style="margin: 0;">'+
			'<tr valign="top" height="40">'+
				'<td colspan="2" id="logoBar">'+
					'<h3 style="margin: 5px 5px 0px 5px; float: left;">D.O.H.: The Dojo Objective Harness</h3>'+
					'<button style="margin-top: 5px; float: left;" onclick="window.open(\''+CONTEXT_PATH+'content/code-coverage/resources/web/jscoverage.html\');">Coverage Report</button>'+
					'<button style="margin-top: 5px; float: left;" onclick="resetCoverage();">Reset</button>'+
					'<img src="'+CONTEXT_PATH+'content/common-ui/resources/web/dojo/util/doh/small_logo.png" height="40" style="margin: 0px 5px 0px 5px; float: right;">'+
					'<span style="margin: 10px 5px 0px 5px; float: right;">'+
						'<input type="checkbox" id="audio" name="audio">'+
						'<label for="audio">sounds?</label>'+
					'</span>'+
				'</td>'+
			'</tr>'+
			'<tr valign="top" height="10">'+
				'<td colspan="2"><div id="progressOuter" onclick="doh._jumpToSuite(arguments[0]);"></div></td>'+
			'</tr>'+
			'<tr valign="top" height="30">'+
				'<td width="30%" class="header">'+
					'<span id="toggleButtons" onclick="doh.togglePaused();">'+
						'<button id="play">&#9658;</button>'+
						'<button id="pause" style="display: none;">&#9553;</button>'+
					'</span>'+
					'<span id="runningStatus">'+
						'<span id="pausedMsg">Stopped</span>'+
						'<span id="playingMsg" style="display: none;">Tests Running</span>'+
					'</span>'+
				'</td>'+
				'<td width="*" class="header" valign="bottom">'+
					'<button class="tab" onclick="doh.showTestPage();">Test Page</button>'+
					'<button class="tab" onclick="doh.showLogPage();">Log</button>'+
                    '<button class="tab" onclick="doh.showPerfTestsPage();">Performance Tests Results</button>'+
				'</td>'+
			'</tr>'+
			'<tr valign="top" style="border: 0; padding: 0; margin: 0;">'+
				'<td height="100%" style="border: 0; padding: 0; margin: 0;">'+
					'<div id="testListContainer">'+
						'<table cellpadding="0" cellspacing="0" border="0" width="100%" id="testList" style="margin: 0;" onclick="doh._jumpToLog(arguments[0]);">'+
							'<thead>'+
								'<tr id="testListHeader" style="border: 0; padding: 0; margin: 0;" >'+
									'<th>&nbsp;</th>'+
									'<th width="20">'+
										'<input type="checkbox" checked onclick="doh.toggleRunAll();">'+
									'</th>'+
									'<th width="*" style="text-align: left;">test</th>'+
									'<th width="50">time</th>'+
								'</tr>'+
							'</thead>'+
							'<tbody valign="top">'+
								'<tr id="groupTemplate" style="display: none;">'+
									'<td style="font-family: Arial; width: 15px;">&#9658;</td>'+
									'<td>'+
										'<input type="checkbox" checked>'+
									'</td>'+
									'<td>group name</td>'+
									'<td>10ms</td>'+
								'</tr>'+
								'<tr id="testTemplate" style="display: none;">'+
									'<td>&nbsp;</td>'+
									'<td>&nbsp;</td>'+
									'<td style="padding-left: 20px;">test name</td>'+
									'<td>10ms</td>'+
								'</tr>'+
							'</tbody>'+
						'</table>'+
					'</div>'+
				'</td>'+
				'<td>'+
					'<div style="position: relative; width: 99%; height: 100%; top: 0px; left: 0px;">'+
						'<div class="tabBody" style="z-index: 1;">'+
							'<pre id="logBody"></pre>'+
							'<div id="perfTestsBody" style="background-color: white;"></div>'+
						'</div>'+
						'<iframe id="testBody" class="tabBody" style="z-index: -1;"></iframe>'+
					'</div>'+
				'</td>'+
			'</tr>'+
		'</table>'+
		'<span id="hiddenAudio"></span>';
        
    document.body.innerHTML = html;
}

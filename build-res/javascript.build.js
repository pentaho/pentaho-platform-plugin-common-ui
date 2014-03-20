/*!
* Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

({
  appDir: "./module-scripts",
  baseUrl: ".",
  dir: "../bin/scriptOutput",
  optimizeCss: "false",
  skipDirOptimize: true,

  //Put in a mapping so that 'requireLib' in the
  //modules section below will refer to the require.js
  //contents.
  paths: {
    requireLib: 'require'
  },
  mainConfigFile: 'requireCfg.js',


  modules: [
    {
      name: "angular-directives",
      include: ["common-ui/angular-directives/angular-directives"],
      create: true
    }
  ]
})
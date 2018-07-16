---
title: Step 1 - Preparing the environment
description: Walks you through setting up a basic sandbox for experimenting with visualizations.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
grand-parent-title: Create a Custom Visualization
grand-parent-path: ../../create
grand-grand-parent-title: Visualization API
grand-grand-parent-path: ../..
layout: default
---

{% include callout.html content="<h2>Fast-lane</h2>
<p>If you prefer, you can follow the walk-through step-by-step but skip writing the code itself. 
   Just clone the sample repository and install its dependencies:</p>

<pre class='highlight'><code># Clone the sample repository.
git clone https://github.com/pentaho/pentaho-engineering-samples
git checkout -b 8.1

# Go to the complete sample's directory.
cd pentaho-engineering-samples
cd Samples_for_Extending_Pentaho/javascript-apis/platform/visual-samples-bar-d3

# Install the dependencies.
npm install
</code></pre>

<p>Go directly to <a title='Visualize it' href='#visualize-it'>Visualize it</a>.</p>
" type="warning" %}

## Setup the sandbox environment

1. Create an empty folder and then initialize it:
  ```shell
    # Create the package.json file.
    npm init
    # Write "pentaho-visual-samples-bar-d3" as package name.
    # Accept the default for the other fields or write whatever you want.

    # Add and install the Visualization API dev dependency.
    # (the runtime dependency is provided by the platform)
    npm install https://github.com/pentaho/pentaho-platform-plugin-common-ui/releases/download/v3.0.0-beta3/pentaho-viz-api-v3.0.0.tgz --save-dev

    # Copy the sandbox files.
    ./node_modules/@pentaho/viz-api/init-sandbox
  ```

    To follow this tutorial you should use `pentaho-visual-samples-bar-d3` as your package name, as it will become your AMD/RequireJS module ID.

    Alternatively you can choose a different name but will have to change all references to `pentaho-visual-samples-bar-d3` throughout the tutorial.

2. You should now have the `sandbox.html` and `sandbox-data.json` files.

    Those files provide a minimal sandbox from which sandboxes for specific samples or experiments may be derived.
    As is, it simply displays the `pentaho/visual/samples/calc` visualization — 
    the only visualization that comes bundled with the Visualization API.

    If you prefer you can create the files yourself:

    1. Create a file named `sandbox-data.json` and place the following content in it:
      ```json
        {
          "model": [
              {"name": "productFamily", "type": "string", "label": "Product Family"},
              {"name": "sales",         "type": "number", "label": "Sales"}
          ],
          "rows": [
              {"c": [{"v": "cars-classic", "f": "Classic Cars"}, 2746782]},
              {"c": [{"v": "motorcycles", "f": "Motorcycles"}, 753753]},
              {"c": [{"v": "planes", "f": "Planes"}, 748324]},
              {"c": [{"v": "ships", "f": "Ships"}, 538982]},
              {"c": [{"v": "trains", "f": "Trains"}, 165215]},
              {"c": [{"v": "trucks-and-buses", "f": "Trucks and Buses"}, 756438]},
              {"c": [{"v": "cars-vintage", "f": "Vintage Cars"}, 1308470]}
          ]
        }
      ```

    2. Create a file named `sandbox.html` and place the following content in it:
      ```html
        <!doctype html>
        <html>

        <head>
          <style>
            .pentaho-visual-base-model {
              border: solid 1px #005da6;
            }
          </style>

          <!-- load requirejs -->
          <script type="text/javascript" src="node_modules/requirejs/require.js"></script>

          <!-- load the VizAPI dev bootstrap helper -->
          <script type="text/javascript" src="node_modules/@pentaho/viz-api/dev-bootstrap.js"></script>

          <script>
            // Configure AMD for the sample visualization.
            require.config({
              config: {
                "pentaho/environment": {
                  application: "viz-api-sandbox"
                }
              }
            });
         
            require([
              "vizapi-dev-init",
              "json!./package.json"
            ], function (devInit, package) {
              devInit(package);

              require([
                "pentaho/visual/samples/calc/Model",
                "pentaho/visual/base/View",
                "pentaho/data/Table",
                "json!./sandbox-data.json"
              ], function(CalcModel, BaseView, Table, dataSpec) {

                // Create the visualization model.
                var modelSpec = {
                  "data": new Table(dataSpec),
                  "levels": {fields: ["productFamily"]},
                  "measure": {fields: ["sales"]},
                  "operation": "avg"
                };
                                                
                var model = new CalcModel(modelSpec);
                                              
                // Create the visualization view.
                var viewSpec = {
                  width: 400,
                  height: 200,
                  domContainer: document.getElementById("viz_div"),
                  model: model
                };
                                                    
                // These are responsibilities of the visualization container application:
                // 1. Mark the container with the model's CSS classes, for styling purposes.
                viewSpec.domContainer.className = model.$type.inheritedStyleClasses.join(" ");
                                                
                // 2. Set the DOM container dimensions.
                viewSpec.domContainer.style.width = viewSpec.width + "px";
                viewSpec.domContainer.style.height = viewSpec.height + "px";
                        
                BaseView.createAsync(viewSpec)
                  .then(function(view) {
                    // Handle the execute action.
                    view.on("pentaho/visual/action/Execute", {
                      "do": function(event, action) {
                        alert("Executed " + action.dataFilter.$contentKey);
                      }
                    });

                    // Handle the select action.
                    view.on("pentaho/visual/action/Select", {
                      "finally": function(event, action) {
                        document.getElementById("messages_div").innerText = 
                          "Selected: " + view.model.selectionFilter.$contentKey;
                      }
                    });

                    // Render the visualization.
                    return view.update();
                  });
              });
            });
          </script>
        </head>

        <body>
          <!-- div that will contain the visualization -->
          <div id="viz_div"></div>

          <!-- div that will display messages -->
          <div id="messages_div"></div>
        </body>

        </html>
      ```

## Visualize it

Open `sandbox.html` in a browser.
You should see the result of the average operation: `The result is 1002566.2857142857`.

The page shows the simplest (and kind of useless) visualization: a
calculator, which just displays the result of aggregating the values of
one column of a data set.

That's why you have to create your own!

{% include callout.html content="<p>Directly opening the file through the filesystem will not work when using 
Google Chrome (and possibly other browsers), because of security restrictions that disallow the loading of 
local resources using XHR — a functionality that is required by the VizAPI to load localization bundles and 
other resources.</p>
<p>To overcome this limitation you need to serve the project files through an HTTP server. 
There are several simple-to-use solutions:</p>

<b>Node:</b><pre class='highlight'><code>npm install -g node-static
static -p 8000</code></pre>

<b>PHP:</b><pre class='highlight'><code>php -S localhost:8000</code></pre>

<b>Python 2:</b><pre class='highlight'><code>python -m SimpleHTTPServer 8000</code></pre>

<b>Python 3:</b><pre class='highlight'><code>python -m http.server 8000</code></pre>

<b>Ruby:</b><pre class='highlight'><code>ruby -run -e httpd . -p 8000</code></pre>

After one of the above, you can open <a href='http://localhost:8000/sandbox.html' target='_blank'>http://localhost:8000/sandbox.html</a> in the browser.
" type="warning" %}


**Continue** to [Creating the model](step2-model-creation).


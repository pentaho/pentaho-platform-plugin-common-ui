---
title: Create a Custom Visualization
description: Complete walk-through on how to create a visualization for the Pentaho platform.
parent-title: Visualization API
layout: default
---

This walk-through guides you through the creation of a custom visualization for the Pentaho platform, 
from developing the visualization itself to building an OSGi Artifact that can be deployed to Pentaho products.

## 1. Develop the Visualization in a Sandbox

You will start by developing the visualization in a controlled sandbox environment.
Then, you will package your visualization's files so it can be deployed to Pentaho products.

First, do the [Bar/D3 Visualization in Sandbox](samples/bar-d3-sandbox) walk-through, 
which guides you through the development of a custom visualization having a [D3](https://d3js.org/)-based view.
Then, continue here, to learn how to create a web package for it.

## 2. Create the Pentaho Web Package

In the previous section you developed a custom visualization and tested it in a controlled sandbox environment.

If you exclude the sandbox specific files, 
you are left with the `package.json`, `Model.js`, `View.js`, `clickD3.js`, `config.js` files and a `css` folder.
Those are the files to be packaged.

Additionally, any runtime client-side dependencies must also be provided to the platform.
In this case, the only runtime dependency is the D3 library 
(note that `@pentaho/visual-sandbox` is a development-time dependency).
Dependencies can be provided separately in their own package or bundled together with your visualization.

In short, for packaging your visualization you just need to _zip_ your files and runtime dependencies.

Care must be taken not to include temporary files, development-time dependencies, etc...
By using the `npm pack` command you ensure only your files **and** bundled dependencies are compressed 
in the resulting `tgz` file.

```xml
# Package your files.
npm pack
```

## 3. Next Steps

To learn how to deploy the visualization,
continue reading at [Deploy the visualization](.#deploying-the-visualization).

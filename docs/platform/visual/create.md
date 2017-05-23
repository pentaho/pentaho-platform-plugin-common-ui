---
title: Create a Custom Visualization
description: Complete walk-through on how to create a visualization for the Pentaho platform.
parent-title: Visualization API
layout: default
---

This walk-through guides you through the creation of a custom visualization for the Pentaho platform, 
from developing the visualization itself to building an OSGi Artifact that can be deployed to Pentaho products.
 
## Fast-lane

If you prefer, you can skip the walk-through and get the final OSGi Web Project, and build it.

```shell
# Clone the repository.
git clone https://github.com/pentaho/pentaho-engineering-samples

# Go to the sample's directory.
cd Samples_for_Extending_Pentaho/javascript-apis/platform/pentaho/visual/samples/bar-d3-bundle

# Build the OSGi Web Project
mvn clean package
```

## 1. Develop the Visualization in a Sandbox

You will start by developing the visualization in a controlled sandbox environment.
Then, you will drop the sandbox and package the visualization's files in a way that
it can be deployed to Pentaho products.

Do the [Bar/D3 Visualization in Sandbox](samples/bar-d3-sandbox) walk-through, 
which guides you through the development of a custom visualization having a [D3](https://d3js.org/)-based view.

## 2. Create the Pentaho Web Package

In the previous section you developed a custom visualization and tested it in a controlled sandbox environment.
To use the visualization in Pentaho products, 
it must take the form of a [Pentaho Web Package](../web-package). 
This essentially means that you need to create a `package.json` file that describes the contained JavaScript resources.

Apart from the mandatory `name` and `version` fields, and the D3 library dependency, 
you must also advertise the existence of your visualization to the platform, 
so that applications like Analyzer and PDI can offer it to users.
This is done by registering 
the visualization's [`Model`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.Model'}}) module
with [`pentaho/service`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.service'}}),
as a service of type `pentaho/visual/base`.

The default configuration module that you developed also needs to be advertised to the configuration system,
by registering it with `pentaho/service` as a service of type `pentaho.config.spec.IRuleSet`.

The result is the following `package.json` content:

```json
{ 
  "name": "pentaho/visual/samples/bar",
  "version": "1.0.0",
  
  "config": {
    "pentaho/service": {
      "pentaho/visual/samples/bar_1.0.0/model": "pentaho/visual/base",
      "pentaho/visual/samples/bar_1.0.0/config": "pentaho.config.spec.IRuleSet"
    }
  },
  
  "dependencies": {
    "d3": "^4.8.0"
  }
}
```

## 3. Create the OSGi Web Project

The Pentaho platform is built on top of an OSGi container, 
so developers must provide their code as an OSGi/Karaf artifact. 
Additionally, any client-side dependencies must also be provided to the platform as OSGi bundles.

The recommended way is to put the visualization bundle, its dependencies, 
and corresponding feature definition together into a single KAR file.

See [Create an OSGi Web Project for a Web Package and its Dependencies](../osgi-web-project) for instructions.

## 4. Next Steps

To learn how to deploy the visualization,
continue reading at [Deploy the visualization](.#deploy-the-visualization).

# @vernonia/core

![npm](https://img.shields.io/npm/v/@vernonia/core?style=flat-square) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/CityOfVernonia/core/Node.js%20CI?style=flat-square)

City of Vernonia widgets and friends for [Esri JavaScript API](https://developers.arcgis.com/javascript/latest/) using [Calcite Design System](https://developers.arcgis.com/calcite-design-system/).

## Install

```shell
npm install @vernonia/core --save
```

## Usage

This package has no built/compiled code. Modules can be used directly with build tools like [Vite](https://vitejs.dev/).

While some of these modules may be useful to others in use or as examples, many of the widgets and support modules are specific to the City of Vernonia, and it's web services and workflows.

## Sass / Vernonia Theme

In application's main `.scss` entry point:

1. Import `@vernonia/core/css/variables`.
1. Set variables for @arcgis/core widget css to include, and any application specific styles.
1. Import `@arcgis/core/assets/esri/themes/base/core`
1. Import `@vernonia/core/css/cov`.

Example usage: https://github.com/CityOfVernonia/vite-map-app/blob/main/src/main.scss

**Note:** All layouts and widgets in this package import their own `.scss` files. Build tools utilizing Typescript and Sass will handle all the compiling of CSS. If a module is dynamically imported it's `.scss` file does need to be imported in the application's `.scss` file.

## Documentation

The documentation is incomplete, sorely lacking, and unlikely to improve any time soon. Looking at the code itself and `interfaces.d.ts` is the best way to understand a module.

## Layouts

[cov/layouts/FullMap](./layouts/FullMap.markdown)

Full page map application layout.

[cov/layouts/Viewer](./layouts/Viewer.markdown)

Web map application layout with header and optional menu for most applications.

## Popups

## Support

[cov/support/basemaps](./support/basemaps.markdown)

Methods to return Vernonia hillshade and hybrid basemaps.

## View Models

[cov/viewModels/OAuthViewModel](./viewModels/OAuthViewModel.markdown)

A view model for handling OAuth and signing in and out of applications.

## Widgets

***

Made with :heart: and :coffee: in Vernonia, Oregon

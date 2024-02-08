import * as url from 'url';
import path from 'path';
import fs from 'fs-extra';
import replace from 'replace-in-file';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function copyArcgisCoreAssets() {
  const src = path.resolve(__dirname, './../node_modules/@arcgis/core/assets');
  const dest = path.resolve(__dirname, './../dev/public/arcgis');
  if (!src) {
    console.log('@argis/core must be installed');
    return;
  }
  if (dest) {
    await fs.remove(dest);
  }
  await fs.ensureDir(dest);
  fs.copy(src, dest);
}

copyArcgisCoreAssets();

async function copyCalciteComponents() {
  const src = path.resolve(__dirname, './../node_modules/@esri/calcite-components/dist/calcite');
  const dest = path.resolve(__dirname, './../dev/public/calcite');
  if (!src) {
    console.log('@esri/calcite-components must be installed');
    return;
  }
  if (dest) {
    await fs.remove(dest);
  }
  await fs.ensureDir(dest);
  await fs.copy(src, dest);

  copyCalciteIcons();
}

copyCalciteComponents();

async function copyCalciteIcons() {
  const src = path.resolve(__dirname, './../node_modules/@esri/calcite-ui-icons/js');
  const dest = path.resolve(__dirname, './../dev/public/calcite/assets/icon');
  if (!src) {
    console.log('@esri/calcite-ui-icons must be installed');
    return;
  }
  const files = await fs.readdir(src);
  files.forEach(async (file) => {
    if (file.includes('.json')) {
      const destFile = `${dest}/${file}`;
      const exists = await fs.exists(destFile);
      if (!exists) {
        await fs.copyFile(`${src}/${file}`, destFile);
      }
    }
  });
}

try {
  const results = replace.sync({
    files: 'node_modules/@arcgis/core/assets/esri/themes/base/_core.scss',
    from: '@import "@esri/calcite-components/dist/calcite/calcite";',
    to: '',
  });
  console.log(results);
} catch (error) {
  console.error(error);
}

try {
  const results = replace.sync({
    files: 'node_modules/@arcgis/core/assets/esri/themes/base/widgets/_Spinner.scss',
    from: '../base/images/Loading_Indicator_double_32.svg',
    to: './arcgis/esri/themes/base/images/Loading_Indicator_double_32.svg',
  });
  console.log(results);
} catch (error) {
  console.error(error);
}

try {
  const results = replace.sync({
    files: 'node_modules/@arcgis/core/assets/esri/themes/base/widgets/_BasemapToggle.scss',
    from: '../base/images/basemap-toggle-64.svg',
    to: './arcgis/esri/themes/base/images/basemap-toggle-64.svg',
  });
  console.log(results);
} catch (error) {
  console.error(error);
}

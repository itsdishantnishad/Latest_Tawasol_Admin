'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

/**
 * Fix: Support importing/require() of .webp files in older SPFx (older webpack)
 * We must use file-loader (asset modules are not supported here).
 */
build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfig) => {
    generatedConfig.module.rules.push({
      test: /\.webp(\?[^.]*)?$/,
      use: [
        {
          loader: require.resolve('file-loader'),
          options: {
            name: '[name].[hash].[ext]'
          }
        }
      ]
    });

    return generatedConfig;
  }
});

build.initialize(require('gulp'));

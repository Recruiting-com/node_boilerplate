var path = require('path');
var webpack = require('webpack');
var conf = require('./src/lib/conf');
var resolvPath = function(componentPath) {
  return path.join(__dirname, componentPath);
};

var plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
];

var entry = {
  index: ['./src/public/js/index']
};

var loaders = [
  { test: /\.css$/, loader: 'style!css', exclude: /node_modules/ },
  {
    test: /\.scss$/,
    loader: 'style!css!sass?includePaths[]='+ resolvPath('./src/public/scss'),
    exclude: /node_modules/
  },
  {
    test: /\.svg$/,
    loader: 'file-loader'
  },
  {
    test: /\.eot$/,
    loader: 'file-loader'
  },
  {
    test: /\.woff2$/,
    loader: 'file-loader'
  },
  {
    test: /\.woff$/,
    loader: 'file-loader'
  },
  {
    test: /\.ttf$/,
    loader: 'file-loader'
  }
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        unsafe: true,
        warnings: false
      },
      output: {comments: false}
    })
  );
  loaders.push(
    { test: /\.js?$/, exclude: /node_modules/, loaders: ['babel?optional[]=runtime&stage=0'] }
  );
}else {
  plugins.push(
    new webpack.NoErrorsPlugin()
  );
  loaders.push(
    { test: /\.js?$/, exclude: /node_modules/, loaders: ['babel?optional[]=runtime&stage=0'] }
  );
}

module.exports = {

  devtool: process.env.NODE_ENV !== 'production' ? 'inline-source-map' : '',

  entry: entry,

  output: {
    path: path.join(__dirname, './src/public/dist/js/'),
    filename: '[name]_bundle.js'
  },

  module: {
    loaders: loaders
  },

  node: {
    Buffer: false
  },

  plugins: plugins,

  resolve: {
    alias: {
      components: resolvPath('./src/components')
    }
  }

};

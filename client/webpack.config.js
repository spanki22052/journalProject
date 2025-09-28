const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.[contenthash].js',
      clean: true,
      publicPath: '/',
      assetModuleFilename: 'assets/[name].[contenthash][ext]',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        // FSD алиасы
        '@app': path.resolve(__dirname, 'src/app'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@widgets': path.resolve(__dirname, 'src/widgets'),
        '@features': path.resolve(__dirname, 'src/features'),
        '@entities': path.resolve(__dirname, 'src/entities'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        // Дополнительные алиасы
        '@': path.resolve(__dirname, 'src'),
        '@public': path.resolve(__dirname, 'public'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.module\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]__[local]--[hash:base64:5]',
                  exportLocalsConvention: 'camelCase',
                },
                esModule: false,
                importLoaders: 1,
              },
            },
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
      }),
      // Копируем статические файлы из public в dist
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            globOptions: {
              ignore: ['**/index.html'], // index.html обрабатывается HtmlWebpackPlugin
            },
          },
        ],
      }),
      // Добавляем Workbox только для production сборки
      ...(isProduction
        ? [
            new GenerateSW({
              // Исключаем service worker из кэширования
              exclude: [/sw\.js$/],
              // Максимальный размер кэша
              maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
              // Стратегии кэширования
              runtimeCaching: [
                {
                  urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
                  handler: 'StaleWhileRevalidate',
                  options: {
                    cacheName: 'google-fonts-stylesheets',
                  },
                },
                {
                  urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'google-fonts-webfonts',
                    expiration: {
                      maxEntries: 30,
                      maxAgeSeconds: 60 * 60 * 24 * 365, // 1 год
                    },
                  },
                },
                {
                  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'images',
                    expiration: {
                      maxEntries: 100,
                      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 дней
                    },
                  },
                },
                {
                  urlPattern: /\.(?:js|css)$/,
                  handler: 'StaleWhileRevalidate',
                  options: {
                    cacheName: 'static-resources',
                  },
                },
                {
                  urlPattern: /^https:\/\/api\./,
                  handler: 'NetworkFirst',
                  options: {
                    cacheName: 'api-cache',
                    networkTimeoutSeconds: 10,
                    expiration: {
                      maxEntries: 50,
                      maxAgeSeconds: 60 * 60 * 24, // 1 день
                    },
                  },
                },
              ],
              // Настройки для манифеста
              manifestTransforms: [
                manifestEntries => {
                  // Добавляем манифест в список кэшируемых файлов
                  manifestEntries.push({
                    url: '/manifest.json',
                    revision: null,
                  });
                  return { manifest: manifestEntries, warnings: [] };
                },
              ],
              // Дополнительные файлы для кэширования
              additionalManifestEntries: [
                {
                  url: '/manifest.json',
                  revision: null,
                },
                {
                  url: '/icons/icon-192x192.png',
                  revision: null,
                },
                {
                  url: '/icons/icon-512x512.png',
                  revision: null,
                },
              ],
              // Настройки для offline fallback
              navigateFallback: '/index.html',
              navigateFallbackDenylist: [/^\/api\//, /^\/_/, /^\/admin\//],
              // Настройки для skip waiting
              skipWaiting: true,
              clientsClaim: true,
            }),
          ]
        : []),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
        serveIndex: false,
      },
      compress: true,
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: {
        disableDotRule: true,
        index: '/index.html',
      },
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }
        return middlewares;
      },
      // Отключаем serve-index для избежания проблем с URI
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization',
      },
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    optimization: isProduction
      ? {
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
              },
            },
          },
          minimize: true,
        }
      : {},
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
};

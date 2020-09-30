/*eslint-disable */
module.exports = function(grunt) {
  const sass = require('node-sass');
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  const webpackDistConfig = require('./webpack.dist.config');
  const webpackDevConfig = require('./webpack.dev.config');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      dist: {
        files: {
          'build/assets/scripts/main.min.js': [
            'build/assets/scripts/main.min.js'
          ]
        }
      }
    },
    webpack: {
      dist: webpackDistConfig,
      dev: webpackDevConfig
    },
    mocha: {
      options: {
        run: true,
        log: true,
        logErrors: true,
        reporter: 'spec',
        quiet: false,
        clearRequireCache: false,
        clearCacheFilter: key => true,
        noFail: false,
        ui: 'tdd',
        require: 'babel-register'
      },
      src: ['test/**/*.html']
    },
    sass: {
      dist: {
        options: {
          implementation: sass,
          outputStyle: 'compressed',
          lineNumbers: false,
          sourceMap: false,
          includePaths: ['node_modules']
        },
        files: [
          {
            expand: true,
            cwd: 'src',
            src: ['*.sass'],
            dest: 'build/assets/styles',
            ext: '.min.css'
          }
        ]
      },
      dev: {
        options: {
          implementation: sass,
          outputStyle: 'expanded',
          lineNumbers: true,
          sourceMap: true,
          includePaths: ['node_modules']
        },
        files: [
          {
            expand: true,
            cwd: 'src',
            src: ['*.sass'],
            dest: 'build/assets/styles',
            ext: '.min.css'
          }
        ]
      }
    },

    postcss: {
      dist: {
        options: {
          map: false,
          processors: [
            require('autoprefixer')({
              browsers: ['last 2 version']
            })
          ]
        },
        src: 'build/assets/styles/main.min.css',
        dest: 'build/assets/styles/main.min.css'
      }
    },

    pug: {
      compile: {
        options: {
          pretty: true,
          data: {
            debug: false
          }
        },
        files: [
          {
            expand: true,
            cwd: 'src/pages',
            src: ['*.pug', '!_*.pug'],
            dest: 'build/',
            ext: '.html'
          }
        ]
      }
    },

    browserSync: {
      bsFiles: {
        src: [
          'build/assets/styles/main.min.css',
          'build/*.html',
          'build/assets/scripts/main.min.js'
        ]
      },
      options: {
        watchTask: true,
        server: {
          directory: true,
          baseDir: './'
        },
        port: 9000
      }
    },

    imagemin: {
      dynamic: {
        files: [
          {
            expand: true,
            cwd: 'build/assets/images',
            src: ['**/*.{png,jpg,gif,svg}'],
            dest: 'build/assets/images/'
          }
        ]
      }
    },

    clean: {
      dist: {
        src: ['build/**']
      }
    },

    sync: {
      dev: {
        files: [{ cwd: 'src/assets/', src: ['**'], dest: 'build/assets/' }],
        verbose: true,
        ignoreInDest: [
          '**/scripts',
          '**/scripts/*.js',
          '**/scripts/*.map',
          '**/styles',
          '**/styles/*.css',
          '**/styles/*.map'
        ],
        updateAndDelete: true
      },
      dist: {
        files: [{ cwd: 'src/assets/', src: ['**'], dest: 'build/assets/' }],
        verbose: true,
        ignoreInDest: [
          '**/scripts',
          '**/scripts/*.js',
          '**/styles',
          '**/styles/*.css'
        ],
        updateAndDelete: true
      }
    },

    watch: {
      scripts: {
        files: ['src/**/*.js'],
        tasks: ['webpack:dev']
      },
      sass: {
        files: ['src/**/*.sass', 'src/**/*.scss'],
        tasks: ['sass:dev']
      },
      pug: {
        files: ['src/**/*.pug'],
        tasks: ['pug:compile']
      },
      assets: {
        files: ['src/assets/**'],
        tasks: ['sync:dev']
      },
      options: {
        spawn: false,
        pretty: true
      }
    },
    concurrent: {
      dev: ['webpack:dev', 'sass:dev', 'sync:dev'],
      dev_watch: {
        tasks: ['watch:scripts', 'watch:sass', 'watch:pug', 'watch:assets'],
        options: {
          logConcurrentOutput: true
        }
      },

      prod: {
        tasks: ['watch:scripts', 'watch:sass', 'pug:compile', 'watch:assets'],
        options: {
          logConcurrentOutput: true
        }
      },

      build: ['webpack:dist', 'sass:dist', 'pug:compile'],
      minimal: ['uglify:dist', 'postcss:dist']
    }
  });
  grunt.registerTask('dev', [
    'concurrent:dev',
    'browserSync',
    'concurrent:dev_watch'
  ]);

  grunt.registerTask('prod', ['concurrent:prod']);

  grunt.registerTask('build', [
    'clean:dist',
    'concurrent:build',
    'concurrent:minimal',
    'sync:dist',
    'imagemin'
  ]);

  grunt.registerTask('images', ['imagemin']);
  grunt.registerTask('test', ['mocha']);
  grunt.registerTask('default', ['dev']);
};

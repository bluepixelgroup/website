'use strict';

module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Just in time plugin loader for grunt
  require('jit-grunt')(grunt);

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Define the configuration for all the tasks
  grunt.initConfig({
    // Project settings
    watch: {
      injectSass: {
        files: [
          'src/scss/*.scss',
          '!src/scss/style.scss'
        ],
        tasks: ['injector:scss']
      },
      sass: {
        files: [
          'src/scss/style.scss'
        ],
        tasks: ['sass'],
        options: {
          nospawn: true
        }
      },
      html: {
        files: [
          'src/html/index.html',
          'database.json'
        ],
        tasks: ['shell:buildDev']
      }
    },

    // Renames files for browser caching purposes
    rev: {
      options: {
        algorithm: 'md5',
        length: 8
      },
      dist: {
        files: {
          src: [
            'docs/{,*/}*.js',
            'docs/{,*/}*.css',
            'docs/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          ]
        }
      }
    },

    // Produce minified files in the static folder
    // Use this to minify the images and push them to github from time to time
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'static/tmp-img',
          src: '{,**/}*.{png,gif}',
          dest: 'static/img'
        }]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            'dist',
            '!docs/img'
          ]
        }]
      },
      images: {
        files: [{
          src: [
            'static/tmp-img'
          ]
        }]
      },
      dev: {
        files: [{
          src: [
            'dev'
          ]
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,          // required when using cwd
          dot: true,
          cwd: 'src',
          dest: 'docs/public',
          src: [
            '*.{ico,png,txt}',
            'assets/images/{,*/}*.{webp,png}',
            '*.html'
          ]
        }, {
          expand: true,
          cwd: 'dev/{,assets/}images',
          dest: 'docs/public/assets/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: 'src',
          src: ['landing/**/*', '!landing/**/*.js'], // copy all files and subfolders, except js files
          dest: 'docs/public/'
        }, {
          expand: true,
          cwd: 'dev',
          src: '**',
          dest: 'docs/',
          filter: 'isFile'
        }]
      },
      images: {
        files: [{
          expand: true,                  // required when using cwd
          dot: true,
          cwd: 'static/img',
          dest: 'static/tmp-img',
          src: '{,**/}*.{png,gif}',      // copy all files and subfolders
        }]
      },
      styles: {
        expand: true,
        cwd: 'src',
        dest: 'dist/',
        src: ['{app,components}/**/*.css']
      }
    },


    // Compiles Sass to CSS
    sass: {
      server: {
        options: {
          sourceMap: true
        },
        files: {
          'dev/css/style.css': 'src/scss/style.scss'
        }
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'dev/css',
          src: ['*.css', '!*.min.css'],
          dest: 'docs/css',
          ext: '.min.css'
        }]
      }
    },

    injector: {
      options: {

      },

      // Inject component scss into app.scss
      scss: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/src/scss/', './');
            return '@import \'' + filePath + '\';';
          },
          starttag: '// injector',
          endtag: '// endinjector'
        },
        files: {
          'src/scss/style.scss': [
            'src/scss/*.scss',
            '!src/scss/style.scss'
          ]
        }
      }
    },

    uglify: {
      options: {
        mangle: false,
        beautify: true
      },
      files: {
        'docs/script.min.js': ['dev/js/script.js'],
      }
    },

    shell: {
      buildDev: {
        command: 'python build.py > dev/index.html'
      },
      symlinkDevImgs: {
        command: 'ln -s ../docs/img dev/img'
      },
      symlinkDevJs: {
        command: 'ln -s ../docs/js dev/js'
      },
    }
  });


  grunt.registerTask('serve', function (target) {
    grunt.task.run([
      'clean:dev',
      'injector:scss',
      'sass',
      'shell:buildDev',
      'shell:symlinkDevImgs',
      'shell:symlinkDevJs',
      'watch'
    ]);
  });


  grunt.registerTask('build', [
    'clean:dist',
    'injector:scss',
    'sass',
    'copy:dist',
    'cssmin',
    'uglify',
    // 'rev',
  ]);


  /**
   * Minifies all the image files in place. Should be used to minify the images from
   * time to time (ideally after every image add) and push them to github.
   * */
  grunt.registerTask('minify-images', [
    'copy:images',
    'imagemin',
    'clean:images'
  ]);
};

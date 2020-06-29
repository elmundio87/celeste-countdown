module.exports = function(grunt) {

  grunt.initConfig({
    babel: {
      options: {
        sourceMap: true,
        "presets": ["@babel/preset-react"]
      },
      dist: {
        files: {
          'dist/app.js': 'src/app.jsx'
        }
      }
    },
    watch: {
			src: {
				files: ['src/**/*.js', 'src/**/*.jsx', '!dist/app.js'],
				tasks: ['babel'],
				options: {
					livereload: true
				}
			}
		},
		connect: {
			dev: {
				options: {
					hostname: 'localhost',
					port: 7012,
					open: true
				}
			}
		}
  });

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('dev', ['babel', 'connect', 'watch']);
  grunt.registerTask('default', ['babel']);

}

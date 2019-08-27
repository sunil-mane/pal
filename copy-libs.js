/**
 * Created by anjum on 05/12/16.
 */
var fs = require('fs-extra');

var dependencies = [
	 // ['node_modules/angular2-useful-swiper/lib/swiper.module.js','www/assets/libs/swiper/swiper.imn.js']
	// ['node_modules/js-md5/build/md5.min.js','www/libs/md5.min.js'],
	// ['node_modules/moment/min/moment.min.js','www/libs/moment.min.js'],
	// ['node_modules/font-awesome/css/font-awesome.min.css','www/libs/fa/font-awesome.min.css'],
];

dependencies.forEach(function(value) {
	fs.copy(value[0],value[1]);
});
"use strict";

/*jshint node: true */
/* global concat: true */

// ************************
// * Rise Vision Storage UI *
// * build script         *
// ************************

// Include gulp

var gulp = require('gulp'),
    replace = require("gulp-replace"),

    jsFiles = [
      "src/*.js",
    ],
    htmlFiles = [
      "src/*.html"
    ];

gulp.task("build", function () {
  return gulp.src(jsFiles)
  .pipe(replace('components/common-header/src/common-header.html', 'common-header.html'))
  .pipe(gulp.dest("dist/"))
  .pipe(gulp.src(htmlFiles))
  .pipe(gulp.dest("dist/"));
});


gulp.task("default", [], function () {
  console.log("\n***********************");
  console.log("* Tell me what to do: *");
  console.log("***********************");
  console.log("* gulp build          *");
  console.log("***********************\n");
  return true;
});

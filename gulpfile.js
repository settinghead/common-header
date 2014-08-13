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
    ],
    factory = require("widget-tester").gulpTaskFactory,
    runSequence = require("run-sequence"),
    html2js = require("gulp-html2js"),
    concat = require("gulp-concat");

gulp.task("build", function () {
  return gulp.src(jsFiles)
  .pipe(replace('components/common-header/src/common-header.html', 'common-header.html'))
  .pipe(gulp.dest("dist/"))
  .pipe(gulp.src(htmlFiles))
  .pipe(gulp.dest("dist/"));
});


gulp.task('html2js', function() {
  gulp.src('src/templates/*.html')
    .pipe(html2js({
      outputModuleName: 'risevision.common.header.templates',
      useStrict: true,
      base: "src/templates"
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('./src/'));
});
gulp.task("test:e2e:server", ["html2js"], factory.testServer());
gulp.task("test:e2e:server:close", factory.testServerClose());
gulp.task("test:webdrive_update", factory.webdriveUpdate());
gulp.task("test:e2e:core", ["test:webdrive_update"], factory.testE2EAngular());
gulp.task("test:e2e", function (cb) {
  return runSequence(
    "test:e2e:server", "test:e2e:core", "test:e2e:server:close", cb);
});


gulp.task("default", [], function () {
  console.log("\n***********************");
  console.log("* Tell me what to do: *");
  console.log("***********************");
  console.log("* gulp build          *");
  console.log("***********************\n");
  return true;
});

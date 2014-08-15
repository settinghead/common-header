"use strict";

/*jshint node: true */
/* global concat: true */

// ************************
// * Rise Vision Storage UI *
// * build script         *
// ************************

// Include gulp

var env = process.env.NODE_ENV || "dev",
    gulp = require('gulp'),
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
    concat = require("gulp-concat"),
    rename = require("gulp-rename");

gulp.task("build", function () {
  return gulp.src(jsFiles)
  .pipe(replace('components/common-header/src/common-header.html', 'common-header.html'))
  .pipe(gulp.dest("dist/"))
  .pipe(gulp.src(htmlFiles))
  .pipe(gulp.dest("dist/"));
});

gulp.task('html2js', function() {
  return gulp.src('src/templates/*.html')
    .pipe(html2js({
      outputModuleName: 'risevision.common.header.templates',
      useStrict: true,
      base: "src/templates"
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('./src/'));
});

/* Task: config
 * Copies configuration file in place based on the current
   environment variable (default environment is dev)
*/
gulp.task("config", function() {
  return gulp.src(["./src/js/config/" + env + ".js"])
    .pipe(rename("config.js"))
    .pipe(gulp.dest("./src/js/config"));
});

gulp.task("test:unit", ["config"], factory.testUnitAngular({testFiles: [
  "components/jquery/dist/jquery.js",
  "components/angular/angular.js",
  "components/angular-bootstrap/ui-bootstrap-tpls.js",
  "components/angular-mocks/angular-mocks.js",
  "components/angular-spinner/angular-spinner.js",
  "web/components/ngstorage/ngStorage.js",
  "src/js/config/config.js",
  "src/js/*.js",
  "test/unit/*spec.js"
  ]}));

gulp.task("test:e2e:server", ["html2js", "config"], factory.testServer());
gulp.task("test:e2e:server:close", factory.testServerClose());
gulp.task("test:webdrive_update", factory.webdriveUpdate());
gulp.task("test:e2e:core", ["test:webdrive_update"], factory.testE2EAngular());
gulp.task("test:e2e", function (cb) {
  runSequence(
    "test:e2e:server", "test:e2e:core", "test:e2e:server:close", cb);
  });

gulp.task("metrics", factory.metrics());
gulp.task("test", function (cb) {
  runSequence("test:unit", "test:e2e", "metrics", cb);
});

gulp.task("default", [], function () {
  console.log("\n***********************");
  console.log("* Tell me what to do: *");
  console.log("***********************");
  console.log("* gulp build          *");
  console.log("***********************\n");
  return true;
});

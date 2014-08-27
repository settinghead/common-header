"use strict";

/*jshint node: true */
/* global concat: true */

// ************************
// * Rise Vision Storage UI *
// * build script         *
// ************************

// Include gulp

var env = process.env.NODE_ENV || "dev",
    gulp = require("gulp"),
    jshint = require("gulp-jshint"),
    watch = require("gulp-watch"),
    factory = require("widget-tester").gulpTaskFactory,
    runSequence = require("run-sequence"),
    html2js = require("gulp-html2js"),
    concat = require("gulp-concat"),
    rename = require("gulp-rename"),
    usemin = require("gulp-usemin");


gulp.task("html", ["lint"], function () {
  return gulp.src("test/e2e/index.html")
    .pipe(usemin({
    js: [] //disable mangle just for $routeProvider in controllers.js
  }))
  .pipe(gulp.dest("dist/"));
});


gulp.task("build", ["html", "html2js"]);

gulp.task("lint", ["config"], function() {
  return gulp.src([
      "src/js/**/*.js",
      "test/**/*.js"
    ])
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(jshint.reporter("fail"))
    .on("error", function () {
      process.exit(1);
    });
});

gulp.task("html2js", function() {
  return gulp.src("src/templates/**/*.html")
    .pipe(html2js({
      outputModuleName: "risevision.common.header.templates",
      useStrict: true,
      base: "src/templates"
    }))
    .pipe(concat("templates.js"))
    .pipe(gulp.dest("./src/"));
});

gulp.task("html2js-watch", function() {
  watch({glob: "src/templates/**/*.html"}, function(){
    return gulp.src("src/templates/**/*.html").pipe(html2js({
      outputModuleName: "risevision.common.header.templates",
      useStrict: true,
      base: "src/templates"
    }))
    .pipe(concat("templates.js"))
    .pipe(gulp.dest("./src/"));
  });
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

var unitTestFiles = [
  "components/jquery/dist/jquery.js",
  "components/angular/angular.js",
  "components/angular-bootstrap/ui-bootstrap-tpls.js",
  "components/angular-mocks/angular-mocks.js",
  "components/angular-spinner/angular-spinner.js",
  "web/components/ngstorage/ngStorage.js",
  "src/js/config/config.js",
  "src/js/*.js",
  "test/unit/*spec.js"
  ];

gulp.task("test:unit", ["config"], factory.testUnitAngular({testFiles: unitTestFiles}));
gulp.task("test:unit-watch", ["config"], factory.testUnitAngular({testFiles: unitTestFiles, watch: true}));

gulp.task("server", ["html2js", "config"], factory.testServer());
gulp.task("server-watch", ["html2js-watch", "config"], factory.testServer());
gulp.task("server-close", factory.testServerClose());
gulp.task("test:webdrive_update", factory.webdriveUpdate());
gulp.task("test:e2e:core", ["test:webdrive_update"], factory.testE2EAngular());
gulp.task("test:e2e", function (cb) {
  runSequence(
    "server", "test:e2e:core", "server-close", cb);
  });

gulp.task("metrics", factory.metrics());
gulp.task("test", ["lint"], function (cb) {
  runSequence("test:unit", "test:e2e", "metrics", cb);
});

gulp.task("default", [], function () {
  console.log("\n***********************");
  console.log("* Tell me what to do: *");
  console.log("***********************");
  console.log("* gulp test           *");
  console.log("* gulp build          *");
  console.log("***********************\n");
  return true;
});

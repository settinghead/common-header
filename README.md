Rise Vision Common Header
==============

**Copyright © 2014 - Rise Vision Incorporated.**

*Use of this software is governed by the GPLv3 license (available in the LICENSE file).*

## Documentation

### bower.json
``` js
"dependencies": {
  "common-header": "https://github.com/Rise-Vision/common-header.git"
}
```

### html
Be sure to load angular first.  Then....
``` html
    <!-- build:js script/common-header.min.js -->
    <script src="components/common-header/dist/common-header.js"></script>
    <!-- endbuild -->

    <!-- build:jsdev nothing-->
    <script src="components/common-header/src/common-header.js"></script>
    <!-- endbuild -->
```

### gulpfile.js
For the build output, process the html file with gulp-usemin, ensuring the js
target is included and the jsdev target is ignored so that it gets removed from the html file.
...
``` js
.pipe(usemin({
  js: [uglify({mangle:false, outSourceMap: true})]
})
.pipe(gulp.dest(dist/");
```

If you have any questions or problems please don't hesitate to join our lively and responsive community at http://community.risevision.com.

If you are looking for user documentation on Rise Vision please see http://www.risevision.com/help/users/

If you would like more information on developing applications for Rise Vision please visit http://www.risevision.com/help/developers/.


## Contribution
If you are considering contributing to this open source project, our favourite option, we have 3 good reasons why we released this code under version 3 of the GNU General Public License, and we think they are 3 good reasons for why you should get involved too:

1. Together we can make something far better than we could on our own.

2. If you want to use our code to make something that is specific to you, and that doesn’t fit with what we want to do, we don’t want to get in your way. Take our code and make just what you need.

3. We know that some of you nervous types worry about what happens if our company gets taken out in the zombie apocalypse. We get it, and neither one of us wants to deal with that delicate question of software escrow agreements for the “just in case we kick the bucket scenario”. No worries! We made it easy. No fuss, no cost, no lawyers! We published the software here. Have at it.

Are we missing something? Something could be better? Jump in, branch our code, make what you want, and send us a Pull Request. If it fits for both of us then of course we will accept it, maybe with a tweak or two, test it, and deploy it. If it doesn’t fit, no worries, just Fork our code and create your own specialized application for your specific needs. Or, if you’re just feeling paranoid, download the code, and put it under your mattress.

**Either way, welcome to our project!**

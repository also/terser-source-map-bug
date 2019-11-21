# terser-source-map-bug

`terser` and `uglify-es` don't add sourcemap entries where the original sourcemap doesn't have an entry. This will cause the unmapped range to appear to be mapped to the preceding range.

To fix

```patch
$ diff -u node_modules/uglify-es/lib/sourcemap.js sourcemap.js
--- node_modules/uglify-es/lib/sourcemap.js     2019-11-05 12:39:49.000000000 -0500
+++ sourcemap.js        2019-11-21 17:13:05.000000000 -0500
@@ -75,6 +75,10 @@
                 column: orig_col
             });
             if (info.source === null) {
+                generator.addMapping({
+                    generated : { line: gen_line + options.dest_line_diff, column: gen_col },
+                    source    : null,
+                });
                 return;
             }
             source = info.source;
```

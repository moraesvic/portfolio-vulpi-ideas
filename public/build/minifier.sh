cat ../js/*.js | uglifyjs > vulpi.js
cat ../css/styles.css > vulpi.css
sed -i '1,20d' vulpi.css # will remove first 20 lines
find ../css/ -maxdepth 1 -name '*.css' ! -name "styles.css" -exec cat {} + >> vulpi.css
minify vulpi.css > vulpi.min.css
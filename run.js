var W = require('webkitgtk');
var fs = require('fs');
var URL = require('url');
var Path = require('path');
var mkdirp = require('mkdirp');
var appname = process.argv.pop();
var sitemap = fs.readFileSync(`${appname}/sitemap.txt`).toString().split("\n");
var errors = [];
W({
}, function(err, w) {

function nextOne() {
	getOne(sitemap.shift());
}

function getOne(url) {
	if (!url) return finish();
	console.log("trying", url);
	w.load(`https://webcache.googleusercontent.com/search?q=cache:${url}&hl=fr&gl=fr&strip=0&vwsrc=1`, function(err) {
		if (err) {
			if (err == 503) {
				console.warn("stop on 503");
				errors.push(url);
				errors = errors.concat(sitemap);
				finish();
			}
		}
	}).once('load', function() {
		this.run(function(done) {
			done(null, document.querySelector('pre').innerText);
		}, function(err, txt) {
			var filepath = appname + URL.parse(url).pathname;
			var dirpath = Path.dirname(filepath);
			var filename = Path.basename(filepath);
			if (filename == "") filepath += "index";
			console.log("writing to", filepath);
			mkdirp.sync(dirpath);
			fs.writeFileSync(`${filepath}.html`, txt);
			setTimeout(nextOne, 1000);
		});
	});
}

function finish() {
	fs.writeFileSync(`${appname}/errors.txt`, errors.join('\n'));
	process.exit();
}

nextOne();


});

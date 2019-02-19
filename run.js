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
	w.load(`https://webcache.googleusercontent.com/search?q=cache:Buu0KS3DcNIJ:${url}&hl=fr&gl=fr&strip=0&vwsrc=1`, {
		"user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36",
		navigation: true
	}, function(err) {
		if (err) {
			if (err == 503) {
				console.warn("stop on 503");
				errors.push(url);
				setTimeout(nextOne, 500);
//				errors = errors.concat(sitemap);
//				finish();
			}
		} else {
			console.log("continue");
		}
	}).once('load', function() {
		this.run(function(done) {
			done(null, document.querySelector('pre').innerText);
		}, function(err, txt) {
			var filepath = URL.parse(url).pathname;
			var dirpath = Path.dirname(filepath);
			var filename = Path.basename(filepath);
			if (filename == "") filepath += "index";
			console.log("writing to", filepath);
			mkdirp.sync(dirpath);
			fs.writeFileSync(`${appname}${filepath}.html`, txt);
			setTimeout(nextOne, 500);
		});
	});
}

function finish() {
	fs.writeFileSync(`${appname}/errors.txt`, errors.join('\n'));
	process.exit();
}

nextOne();


});

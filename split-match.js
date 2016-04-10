#!/usr/bin/env node

// https://github.com/delphond/asn3.git
var fs = require('fs');
var Transform = require('stream').Transform;
var inherits = require('util').inherits;
var program = require('commander');
var out = [];

function PatternMatch(pattern) {
    this.pattern = pattern;
    Transform.call(
	this,
	{
	    objectMode: true
	}
	);

}

inherits(PatternMatch, Transform);

PatternMatch.prototype._transform = function (chunk, encoding, getNextChunk){
    var data = chunk.toString();   
    if (this._lastLineData) {
        data = this._lastLineData + data;
    }
    var line = data.split(this.pattern);
    this._lastLineData = line.splice(line.length - 1, 1)[0];
    line.forEach(this.push.bind(this));
    getNextChunk();
}

PatternMatch.prototype._flush = function (flushCompleted) {
    flushCompleted();
}

program
    .option('-p, --pattern <pattern>', 'Input Pattern such as . ,')
    .parse(process.argv);

var inputStream = fs.createReadStream( "input-sensor.txt" );

var patternStream = inputStream.pipe(new PatternMatch(program.pattern));

patternStream.on('readable', function() {
    var chunk;
    while((chunk = patternStream.read()) !== null) {
	out.push(chunk);
	}
});

patternStream.on('end', function() {
    console.log('-------------------Input-------------------\n');
    fs.readFile('input-sensor.txt', 'utf8', function(err, data) {
        if(err) throw err;
        console.log(data);
        console.log('-------------------Output-------------------\n');
        console.log(out);
    });
});

var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

shell.grep();
assert.ok(shell.error());

shell.grep(/asdf/g); // too few args
assert.ok(shell.error());

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
shell.grep(/asdf/g, '/asdfasdf'); // no such file
assert.ok(shell.error());

// if at least one file is missing, this should be an error
shell.cp('-f', 'resources/file1', 'tmp/file1');
assert.equal(fs.existsSync('asdfasdf'), false); // sanity check
assert.equal(fs.existsSync('tmp/file1'), true); // sanity check
var result = shell.grep(/asdf/g, 'tmp/file1', 'asdfasdf');
assert.ok(shell.error());
assert.equal(result.stderr, 'grep: no such file or directory: asdfasdf');

//
// Valids
//

var result = shell.grep('line', 'resources/a.txt');
assert.equal(shell.error(), null);
assert.equal(result.split('\n').length - 1, 4);

var result = shell.grep('-v', 'line', 'resources/a.txt');
assert.equal(shell.error(), null);
assert.equal(result.split('\n').length - 1, 8);

var result = shell.grep('line one', 'resources/a.txt');
assert.equal(shell.error(), null);
assert.equal(result, 'This is line one\n');

// multiple files
var result = shell.grep(/test/, 'resources/file1.txt', 'resources/file2.txt');
assert.equal(shell.error(), null);
assert.equal(result, 'test1\ntest2\n');

// multiple files, array syntax
var result = shell.grep(/test/, ['resources/file1.txt', 'resources/file2.txt']);
assert.equal(shell.error(), null);
assert.equal(result, 'test1\ntest2\n');

// multiple files, glob syntax, * for file name
var result = shell.grep(/test/, 'resources/file*.txt');
assert.equal(shell.error(), null);
assert.ok(result == 'test1\ntest2\n' || result == 'test2\ntest1\n');

// multiple files, glob syntax, * for directory name
var result = shell.grep(/test/, '*/file*.txt');
assert.equal(shell.error(), null);
assert.ok(result == 'test1\ntest2\n' || result == 'test2\ntest1\n');

// multiple files, glob syntax, ** for directory name
var result = shell.grep(/test/, '**/file*.js');
assert.equal(shell.error(), null);
assert.equal(result, 'test\ntest\ntest\ntest\n');

// one file, * in regex
var result = shell.grep(/alpha*beta/, 'resources/grep/file');
assert.equal(shell.error(), null);
assert.equal(result, 'alphaaaaaaabeta\nalphbeta\n');

// one file, * in string-regex
var result = shell.grep('alpha*beta', 'resources/grep/file');
assert.equal(shell.error(), null);
assert.equal(result, 'alphaaaaaaabeta\nalphbeta\n');

// one file, * in regex, make sure * is not globbed
var result = shell.grep(/l*\.js/, 'resources/grep/file');
assert.equal(shell.error(), null);
assert.equal(result, 'this line ends in.js\nlllllllllllllllll.js\n');

// one file, * in string-regex, make sure * is not globbed
var result = shell.grep('l*\\.js', 'resources/grep/file');
assert.equal(shell.error(), null);
assert.equal(result, 'this line ends in.js\nlllllllllllllllll.js\n');

// -l option
result = shell.grep('-l', 'test1', 'resources/file1', 'resources/file2', 'resources/file1.txt');
assert.equal(shell.error(), null);
assert.ok(result.match(/file1(\n|$)/));
assert.ok(result.match(/file1.txt/));
assert.ok(!result.match(/file2.txt/));
assert.equal(result.split('\n').length - 1, 2);

shell.exit(123);

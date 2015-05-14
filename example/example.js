/*
 * This file contains calls to $.proxy and _.bind
 * See what happens when you run:
 *   node transform.js example/example.js example/output.js
 */

var proxy = $.proxy(function () {
    console.log('Hello, ' + this);
}, 'World!');
proxy();

var bind = _.bind(function () {
    console.log('Hello, ' + this);
}, 'World!');
bind();

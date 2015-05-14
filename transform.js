//
// Import our dependencies
//
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var fs = require('fs');
var inputFile = process.argv[2];
var outputFile = process.argv[3];

//
// Parse the file into an AST
//
var contents = fs.readFileSync(inputFile, 'utf-8');
var ast = esprima.parse(contents, {
    loc: true,
    range: true,
    tokens: true,
    comment: true,
});

//
// Transform the AST
//
function isSimpleCall(node, object, property) {
    return node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.object.name === object &&
        node.callee.property.name === property &&
        node.arguments.length >= 2;
}
var transformed = estraverse.replace(ast, {
    enter: function (node, parent) {
        if (isSimpleCall(node, '$', 'proxy') || isSimpleCall(node, '_', 'bind')) {
            return {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    computed: false,
                    object: node.arguments[0],
                    property: { type: 'Identifier', name: 'bind' }
                },
                arguments: node.arguments.slice(1)
            };
        }
    }
});

//
// Generate code from AST
//
var commented = escodegen.attachComments(transformed, transformed.comments, transformed.tokens);
var generated = escodegen.generate(commented, {
    comment: true,
    sourceCode: contents,
    format: {
        preserveBlankLines: true
    }
});
fs.writeFileSync(outputFile, generated);

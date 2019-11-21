const {SourceNode, SourceMapConsumer, SourceMapGenerator} = require('source-map');
const fs = require('fs');

function lines(source, filename) {
  return source.trim().split('\n').map((line, lineNumber) => {
    return new SourceNode(lineNumber + 1, 0, filename, `${line}\n`)
  });
}

function dumbUglify(source, filename) {
  /* TODO what are line, column, and source here for? */
  const node = new SourceNode(1, 0, filename,
    source.split('\n').map((line, lineNumber) => {
      return new SourceNode(lineNumber + 1, 0, filename, line)
    })
  );
  return node;
}

function write({code, map}, filename) {
  fs.writeFileSync(`dist/${filename}`, code);
  fs.writeFileSync(`dist/${filename}.map`, map.toString());
}

async function run() {
  const a = fs.readFileSync(`src/a.js`, 'utf8');
  const b = fs.readFileSync(`src/b.js`, 'utf8');

  const bundleNode = new SourceNode(1, 0, 'why.js', [
    ...lines(a, 'a.js'),
    new SourceNode(1, 0, null, 'console.log(`generated`);\n'),
    ...lines(b, 'b.js')
  ]);
  const bundle = bundleNode.toStringWithSourceMap();

  const bundleConsumer = await new SourceMapConsumer(bundle.map.toString());

  bundle.map.setSourceContent('a.js', a);
  bundle.map.setSourceContent('b.js', b);
  write(bundle, 'bundle.js');

  const uglified = dumbUglify(bundle.code, 'bundle.js').toStringWithSourceMap();

  uglified.map.applySourceMap(bundleConsumer, 'bundle.js');
  uglified.map.setSourceContent('bundle.js', bundle.code);

  write(uglified, 'bundle.min.js');
}

run().catch(e => setImmediate(() => {throw e}))

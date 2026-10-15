// @vitest-environment node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { test } from "vitest";

const require = createRequire(import.meta.url);
// Exercise the copies actually consumed by the CSS test/build toolchain.
const cssRequire = createRequire(
  createRequire(require.resolve("jsdom")).resolve("css-tree"),
);
const postcssRequire = createRequire(
  createRequire(require.resolve("vite")).resolve("postcss"),
);
const copies = new Set([
  cssRequire.resolve("source-map-js"),
  postcssRequire.resolve("source-map-js"),
]);

function checkSourceMaps(body: string) {
  for (const path of copies) {
    // A vulnerable dependency must fail within a bounded child process,
    // rather than block the test runner or exhaust its heap.
    execFileSync(
      process.execPath,
      [
        "--max-old-space-size=128",
        "--input-type=commonjs",
        "--eval",
        `const assert = require('node:assert/strict');
         const { SourceMapConsumer, SourceMapGenerator, SourceNode } = require(${JSON.stringify(path)});
         const leaf = { version: 3, sources: ['input.js'], sourcesContent: ['hello();'], names: [], mappings: 'AAAA' };
         const section = (line, map = leaf) => ({ version: 3, sections: [{ offset: { line, column: 0 }, map }] });
         ${body}`,
      ],
      { timeout: 3000, maxBuffer: 64 * 1024, stdio: "pipe" },
    );
  }
}

test("source maps reject excessive and invalid section offsets", () => {
  checkSourceMaps(`
    for (const line of [2 ** 40, Infinity, -1, 0.5, '100']) {
      assert.throws(() => new SourceMapConsumer(section(line)), /offset/i);
    }
  `);
});

test("nested source-map offsets cannot bypass the total line bound", () => {
  checkSourceMaps(`
    assert.throws(() => new SourceMapConsumer(section(6000000, section(6000000))), /offset/i);
  `);
});

test("source maps handle large valid gaps without expanding empty code lines", () => {
  checkSourceMaps(`
    const consumer = new SourceMapConsumer(section(10000000));
    const node = SourceNode.fromStringWithSourceMap('hello();\\n', consumer);
    assert.equal(node.toString(), 'hello();\\n');
    assert.ok(node.children.length < 10);
    const generated = new SourceMapGenerator();
    consumer.eachMapping(m => generated.addMapping({
      generated: { line: m.generatedLine, column: m.generatedColumn },
      original: { line: m.originalLine, column: m.originalColumn }, source: m.source
    }));
    assert.equal(generated.toJSON().mappings.length, 10000004);
  `);
});

test("deep source-map source lookup finishes without exponential work", () => {
  checkSourceMaps(`
    let map = leaf;
    for (let depth = 0; depth < 40; depth++) map = section(0, map);
    const node = SourceNode.fromStringWithSourceMap('hello();\\n', new SourceMapConsumer(map));
    assert.equal(node.toString(), 'hello();\\n');
    const contents = {};
    node.walkSourceContents((source, content) => { contents[source] = content; });
    assert.deepEqual(contents, { 'input.js': 'hello();' });
  `);
});

test("ordinary indexed maps retain mappings and source contents", () => {
  checkSourceMaps(`
    const consumer = new SourceMapConsumer(section(2));
    const mappings = [];
    consumer.eachMapping(m => mappings.push(m));
    assert.equal(mappings.length, 1);
    assert.equal(mappings[0].generatedLine, 3);
    assert.equal(mappings[0].originalLine, 1);
    assert.equal(mappings[0].source, 'input.js');
    assert.equal(consumer.sourceContentFor('input.js'), 'hello();');
    assert.equal(SourceNode.fromStringWithSourceMap('\\n\\nhello();', consumer).toString(), '\\n\\nhello();');
  `);
});

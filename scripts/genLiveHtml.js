const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Biên dịch TypeScript sang JavaScript
const tsFile = path.join(__dirname, '../components/markedExtensions.ts');
const jsFile = path.join(__dirname, '../components/markedExtensions.js');
execSync(`npx tsc "${tsFile}" --target ES2020 --module commonjs --outDir "${path.dirname(jsFile)}"`);

// 2. Import tất cả các extension từ file JS vừa biên dịch
const extensionsModule = require(jsFile);

// Lọc ra các export là extension (object có name, level, tokenizer, renderer)
const extensions = Object.values(extensionsModule).filter(
  (ext) =>
    ext &&
    typeof ext === 'object' &&
    typeof ext.name === 'string' &&
    typeof ext.level === 'string' &&
    typeof ext.tokenizer === 'function' &&
    typeof ext.renderer === 'function'
);

function toFunctionExpression(fn) {
  let str = fn.toString();
  // Nếu là method shorthand: start(src) { ... }
  if (/^[a-zA-Z0-9_]+\s*\(/.test(str)) {
    // Đổi thành function expression
    str = 'function ' + str;
  }
  return str;
}

// 3. Tạo template HTML sử dụng tất cả extension
const extensionsString = `[${extensions
  .map((ext) => {
    const obj = { ...ext };
    delete obj.start;
    delete obj.tokenizer;
    delete obj.renderer;
    return `{
      name: ${JSON.stringify(obj.name)},
      level: ${JSON.stringify(obj.level)},
      ${ext.start ? `start: eval('(' + ${JSON.stringify(toFunctionExpression(ext.start))} + ')'),` : ''}
      tokenizer: eval('(' + ${JSON.stringify(toFunctionExpression(ext.tokenizer))} + ')'),
      renderer: eval('(' + ${JSON.stringify(toFunctionExpression(ext.renderer))} + ')')
    }`;
  })
  .join(',\n')}]`;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Live Markdown Preview</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-light.min.css">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>
  <div id="preview" class="markdown-body"></div>
  <script type="module">
    // Định nghĩa tất cả extension
    const extensions = ${extensionsString};
    marked.use({ extensions });

    // Lấy blob-id từ URL param (?markdown=<blob-id>)
    function getBlobIdFromUrl() {
      const params = new URLSearchParams(window.location.search);
      return params.get('markdown');
    }

    async function fetchAndRenderMarkdown() {
      const blobId = getBlobIdFromUrl();
      if (!blobId) {
        document.getElementById('preview').innerHTML = '<em>No blob-id provided in URL.</em>';
        return;
      }
      const url = \`https://aggregator.walrus-testnet.walrus.space/v1/blobs/\${blobId}\`;
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Failed to fetch blob');
        const md = await resp.text();
        document.getElementById('preview').innerHTML = marked.parse(md);

      } catch (e) {
        document.getElementById('preview').innerHTML = '<em>Failed to load blob content.</em>';
      }
    }

    fetchAndRenderMarkdown();
  </script>
</body>
</html>
`;

// 4. Ghi ra file live.html
const outHtml = path.join(__dirname, '../public/live.html');
fs.writeFileSync(outHtml, html);
console.log('Generated live.html with all extensions');
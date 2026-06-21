const fs = require('fs');
let css = fs.readFileSync('src/styles.css', 'utf-8');
css = css.replace(/border-radius:\s*8px;/g, 'border-radius: 12px;');
css = css.replace(/border-radius:\s*8px 8px 0 0;/g, 'border-radius: 12px 12px 0 0;');
fs.writeFileSync('src/styles.css', css);
console.log('Done');

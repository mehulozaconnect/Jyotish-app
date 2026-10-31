/* Builds dist/index.html: one self-contained file (fonts, engine, app). */
const fs = require('fs'), path = require('path');
const R = (p) => fs.readFileSync(path.join(__dirname, p), 'utf8');
const fontDir = path.join(__dirname, 'fonts');
const FONTS = [['Inter', 'inter-latin-400-normal.woff2', 400], ['Inter', 'inter-latin-500-normal.woff2', 500], ['Inter', 'inter-latin-600-normal.woff2', 600], ['Inter', 'inter-latin-700-normal.woff2', 700],
  ['Fraunces', 'fraunces-latin-500-normal.woff2', 500], ['JBM', 'jetbrains-mono-latin-500-normal.woff2', 500], ['JBM', 'jetbrains-mono-latin-600-normal.woff2', 600]];
const fonts = FONTS.map(([fam, file, w]) => `@font-face{font-family:${fam};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(fontDir, file)).toString('base64')}) format('woff2');font-weight:${w};font-display:swap}`).join('\n');
const js = [
  'vendor/astronomy.browser.min.js', 'src/core.js', 'src/jyotish.js', 'src/knowledge.js', 'src/analysis.js', 'src/plain.js', 'src/simple.js', 'src/story.js', 'src/evidence.js', 'src/kanalysis.js', 'src/narrative.js', 'src/medical.js', 'src/shadbala.js', 'src/medastro.js', 'src/medcase.js',
  'ui/charts.js', 'ui/cities.js', 'ui/app-core.js', 'ui/app-kundli.js', 'ui/app-today.js', 'ui/app-myday.js', 'ui/app-ask.js', 'ui/app-v2.js', 'ui/app-outcome.js', 'ui/app-reports.js', 'ui/app-milan.js', 'ui/app-remind.js', 'ui/app-extra.js', 'ui/app-medical.js', 'ui/app-medical2.js', 'ui/app-medstory.js', 'ui/app-more.js'
].map((f) => '/* ' + f + ' */\n' + R(f)).join('\n;\n');
let html = R('ui/index.tpl.html');
html = html.replace('/*FONTS*/', () => fonts).replace('/*CSS*/', () => R('ui/style.css')).replace('/*JS*/', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist/index.html'), html);
console.log('dist/index.html', (html.length / 1024).toFixed(0) + ' KB');

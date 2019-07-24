import * as glyphs from './glyphs';

export function render(text: string): string {
  let w = text.length * 4 - 1;
  let h = 5;
  let pts = [];

  for (let i = 0; i < text.length; i++) {
    let dx = i * 4;
    let dy = 0;
    let g = glyphs[text[i]];
    if (!g) continue;

    for (let j = 0; j < 15; j++) {
      if (!g[j]) continue;
      let x = dx + j % 3;
      let y = dy + (j / 3 | 0);
      pts.push({x, y});
    }
  }

  return `
    <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${pts.map(p => `
        <rect x="${p.x}" y="${p.y}"
          width="1" height="1"
          fill="#000"></rect>
        `).join('')}
    </svg>`;
}

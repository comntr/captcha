import * as glyphs from './glyphs';
import * as config from './config';

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
      pts.push({ x, y });
    }
  }

  return `
    <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${pts.map(p => svgrect(p.x, p.y)).join('')}
    </svg>`;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function svgrect(x: number, y: number): string {
  let rs = config.RECT_SIZE;
  let rx = x + rand(0, 1 - rs);
  let ry = y + rand(0, 1 - rs);

  return `
    <rect x="${rx}" y="${ry}"
      width="${rs}" height="${rs}"
      fill="#000"></rect>`;
}

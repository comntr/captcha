export function render(text: string): string {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="50">${text}</text>
    </svg>`;
}

import { FolderStorageManager } from 'src/storage/folders';

const fpm = FolderStorageManager.getInstance();
// draggable.ts
export function draggable(
  node: HTMLElement,
  options: { id: string; x0: number; y0: number }
) {
  let startX = options.x0;
  let startY = options.y0;
  let x = options.x0;
  let y = options.y0;

  const container = node.parentElement!;
  const clickUI = container.parentElement!;

  function mousedown(e: MouseEvent) {
    if (e.target !== node) return;

    // UI移到最上层并持久化图层顺序
    clickUI.appendChild(container);
    fpm.bringToFront(options.id);
    container.classList.add('dragged');

    startX = e.clientX - x;
    startY = e.clientY - y;

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);
  }

  function mousemove(e: MouseEvent) {
    x = e.clientX - startX;
    y = e.clientY - startY;

    container.style.transform = `translate(${x}px, ${y}px)`;
  }

  function mouseup() {
    container.classList.remove('dragged');
    window.removeEventListener('mousemove', mousemove);
    window.removeEventListener('mouseup', mouseup);

    fpm.setPosition(options.id, { x, y });
  }

  container.addEventListener('mousedown', mousedown);

  return {
    update(newOptions: { id: string; x0: number; y0: number }) {
      x = newOptions.x0;
      y = newOptions.y0;
      startX = x;
      startY = y;
      options = newOptions;
    },
    destroy() {
      container.removeEventListener('mousedown', mousedown);
    },
  };
}

import mitt, { Emitter } from 'mitt';

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 防抖函数
 * @param fn 需要防抖的函数
 * @param delay 延迟时间(ms)
 * @returns 具有防抖功能的函数
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;

  return function(this: any, ...args: Parameters<T>) {
      // 如果已经设置了定时器就清除
      if(timer) {
        clearTimeout(timer);
      }

      // 设置新的定时器
      timer = setTimeout(() => {
          fn.apply(this, args);
          timer = null;
      }, delay);
  }
}

// 消息类型

type Events = {
  closeOtherReplies: string;
}

// 创建类型化的 emitter
const emitter: Emitter<Events> = mitt<Events>();

export { emitter };

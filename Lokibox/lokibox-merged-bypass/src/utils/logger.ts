export class Logger {
  constructor(caller: string) {
    this.caller = caller;
    this.i('[logger] Mounted.');
  }
  caller = '';
  private static prefix = '[LokiBox]';

  /**
   * 输出调试文本
   */
  i(...args: any[]) {
    console.log(`${Logger.prefix} [${this.caller}] `, ...args);
  }

  /**
   * 输出警告文本
   */
  w(...args: any[]) {
    console.warn(`${Logger.prefix} [${this.caller}] `, ...args);
  }

  /**
   * 输出错误文本
   */
  e(...args: any[]) {
    console.error(`${Logger.prefix} [${this.caller}] `, ...args);
  }
}

import JavaScriptObfuscator from 'javascript-obfuscator';
import fs from 'fs';
import path from 'path';

const USERSCRIPT_END = '// ==/UserScript==';

export function obfuscatorPlugin() {
  return {
    name: 'vite-obfuscator',
    apply: 'build' as const,
    closeBundle() {
      const dist = path.resolve('dist');
      let files: string[];
      try {
        files = fs.readdirSync(dist).filter(f => f.endsWith('.user.js'));
      } catch {
        return;
      }

      for (const file of files) {
        const filePath = path.join(dist, file);
        let code = fs.readFileSync(filePath, 'utf-8');

        // 提取 userscript header，混淆只对代码体
        const headerEnd = code.indexOf(USERSCRIPT_END);
        if (headerEnd === -1) {
          console.warn('[obfuscator] 未找到 userscript header，跳过');
          continue;
        }
        const header = code.slice(0, headerEnd + USERSCRIPT_END.length);
        const body = code.slice(headerEnd + USERSCRIPT_END.length);

        const result = JavaScriptObfuscator.obfuscate(body, {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,
          stringArray: true,
          stringArrayEncoding: ['rc4'],
          stringArrayThreshold: 1,
          identifierNamesGenerator: 'mangled',
          renameGlobals: false,
          selfDefending: true,
          debugProtection: false,
          transformObjectKeys: true,
          reservedNames: [
            'System',
            'GM_getValue',
            'GM_setValue',
            'GM_addStyle',
            'GM_deleteValue',
            'GM_listValues',
            'GM_xmlhttpRequest',
            'GM_notification',
            'GM_setClipboard',
            'unsafeWindow',
          ],
        });

        fs.writeFileSync(filePath, header + '\n' + result.getObfuscatedCode());
        console.log(`[obfuscator] ✓ ${file}`);
      }
    },
  };
}

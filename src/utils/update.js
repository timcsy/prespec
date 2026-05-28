import { execa } from 'execa';

/**
 * npm 系工具清單（可透過 npm 全域安裝／更新的工具）
 * key 對應 checkAllTools() 回傳物件的鍵名
 */
export const NPM_TOOLS = [
  { key: 'copilot', name: 'GitHub Copilot CLI', pkg: '@github/copilot' },
  { key: 'codexCli', name: 'OpenAI Codex CLI', pkg: '@openai/codex' },
  { key: 'openspec', name: 'OpenSpec', pkg: '@fission-ai/openspec' }
];

/**
 * 從版本字串中擷取 semver（x.y.z），找不到則退而求其次抓 x.y
 * @param {string|null} str
 * @returns {string|null}
 */
export function extractSemver(str) {
  if (!str) return null;
  const full = String(str).match(/\d+\.\d+\.\d+/);
  if (full) return full[0];
  const partial = String(str).match(/\d+\.\d+/);
  return partial ? partial[0] : null;
}

/**
 * 比較兩個 semver：a > b 回傳 1，a < b 回傳 -1，相等回傳 0
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function compareSemver(a, b) {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

/**
 * 查詢 npm 套件的最新版本
 * @param {string} pkg
 * @returns {Promise<string|null>}
 */
export async function getLatestNpmVersion(pkg) {
  try {
    const { stdout } = await execa('npm', ['view', pkg, 'version'], { timeout: 15000 });
    return stdout.trim();
  } catch {
    // 網路問題或查不到時，靜默略過（不阻擋主流程）
    return null;
  }
}

/**
 * 檢查所有已安裝的 npm 系工具是否有新版本
 * @param {Object} tools - checkAllTools() 的回傳結果
 * @returns {Promise<Array<{key, name, pkg, current, latest}>>} 有更新可用的工具清單
 */
export async function checkNpmToolUpdates(tools) {
  const results = await Promise.all(
    NPM_TOOLS.map(async (tool) => {
      const data = tools[tool.key];
      if (!data?.installed) return null;

      const current = extractSemver(data.version);
      const latestRaw = await getLatestNpmVersion(tool.pkg);
      const latest = extractSemver(latestRaw);

      // 任一版本無法解析就略過（避免誤判）
      if (!current || !latest) return null;

      if (compareSemver(latest, current) > 0) {
        return { ...tool, current, latest };
      }
      return null;
    })
  );

  return results.filter(Boolean);
}

/**
 * 透過 npm 全域更新指定套件到最新版
 * @param {string} pkg
 * @returns {Promise<boolean>}
 */
export async function updateNpmTool(pkg) {
  await execa('npm', ['install', '-g', `${pkg}@latest`], { stdio: 'inherit' });
  return true;
}

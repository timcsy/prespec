import { execa } from 'execa';
import os from 'os';
import fs from 'fs';
import path from 'path';

/**
 * 檢查指令是否存在
 * @param {string} command - 指令名稱
 * @returns {Promise<boolean>}
 */
async function commandExists(command) {
  try {
    if (os.platform() === 'win32') {
      await execa('where', [command]);
    } else {
      await execa('which', [command]);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 取得指令版本
 * @param {string} command - 指令名稱
 * @param {string[]} args - 版本參數，預設為 ['--version']
 * @returns {Promise<string|null>}
 */
async function getCommandVersion(command, args = ['--version']) {
  try {
    const { stdout } = await execa(command, args);
    return stdout.trim().split('\n')[0];
  } catch {
    return null;
  }
}

/**
 * 檢查 NVM 是否已安裝
 * @returns {Promise<{installed: boolean, version: string|null, path: string|null}>}
 */
export async function checkNvm() {
  const home = os.homedir();

  if (os.platform() === 'win32') {
    // Windows: 檢查 nvm-windows
    // nvm-windows 預設安裝在 C:\Users\<username>\AppData\Roaming\nvm
    const nvmDir = process.env.NVM_HOME || path.join(home, 'AppData', 'Roaming', 'nvm');
    const nvmExists = fs.existsSync(nvmDir);

    if (!nvmExists) {
      return { installed: false, version: null, path: null };
    }

    // Windows 的 nvm 指令需要透過 cmd 執行
    let version = null;
    try {
      const { stdout } = await execa('nvm', ['version']);
      version = stdout.trim();
    } catch {
      // 可能還沒重新開啟終端機
    }

    return {
      installed: true,
      version,
      path: nvmDir
    };
  } else {
    // Unix-like: 檢查 nvm.sh
    const nvmDir = process.env.NVM_DIR || path.join(home, '.nvm');
    const nvmExists = fs.existsSync(nvmDir);

    if (!nvmExists) {
      return { installed: false, version: null, path: null };
    }

    // 嘗試取得版本
    const version = await getCommandVersion('nvm', ['--version']);

    return {
      installed: true,
      version,
      path: nvmDir
    };
  }
}

/**
 * 檢查 Node.js 是否已安裝
 * @returns {Promise<{installed: boolean, version: string|null}>}
 */
export async function checkNode() {
  const installed = await commandExists('node');
  const version = installed ? await getCommandVersion('node') : null;

  return { installed, version };
}

/**
 * 檢查 Git 是否已安裝
 * @returns {Promise<{installed: boolean, version: string|null, configured: boolean, user: string|null, email: string|null}>}
 */
export async function checkGit() {
  const installed = await commandExists('git');

  if (!installed) {
    return { installed: false, version: null, configured: false, user: null, email: null };
  }

  const version = await getCommandVersion('git');

  // 檢查 Git 設定
  let user = null;
  let email = null;
  try {
    const { stdout: userStdout } = await execa('git', ['config', '--global', 'user.name']);
    user = userStdout.trim();
  } catch {
    // 使用者未設定
  }

  try {
    const { stdout: emailStdout } = await execa('git', ['config', '--global', 'user.email']);
    email = emailStdout.trim();
  } catch {
    // Email 未設定
  }

  const configured = !!(user && email);

  return { installed, version, configured, user, email };
}

/**
 * 檢查 GitHub Copilot CLI 是否已安裝
 * @returns {Promise<{installed: boolean, version: string|null}>}
 */
export async function checkCopilot() {
  const installed = await commandExists('github-copilot-cli');
  const version = installed ? await getCommandVersion('github-copilot-cli') : null;

  return { installed, version };
}

/**
 * 檢查 UV 是否已安裝
 * @returns {Promise<{installed: boolean, version: string|null}>}
 */
export async function checkUv() {
  const installed = await commandExists('uv');
  const version = installed ? await getCommandVersion('uv') : null;

  return { installed, version };
}

/**
 * 檢查 Spec Kit (Specify CLI) 是否已安裝
 * @returns {Promise<{installed: boolean, version: string|null}>}
 */
export async function checkSpecKit() {
  const installed = await commandExists('specify');
  const version = installed ? await getCommandVersion('specify') : null;

  return { installed, version };
}

/**
 * 檢查所有工具的安裝狀態
 * @returns {Promise<Object>}
 */
export async function checkAllTools() {
  const [nvm, node, git, copilot, uv, speckit] = await Promise.all([
    checkNvm(),
    checkNode(),
    checkGit(),
    checkCopilot(),
    checkUv(),
    checkSpecKit()
  ]);

  return {
    nvm,
    node,
    git,
    copilot,
    uv,
    speckit
  };
}

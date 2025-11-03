import os from 'os';
import { execa } from 'execa';

/**
 * 取得目前的作業系統平台
 * @returns {'macos'|'linux'|'windows'|'wsl'|'unknown'}
 */
export function getPlatform() {
  const platform = os.platform();

  if (platform === 'darwin') {
    return 'macos';
  }

  if (platform === 'linux') {
    // 檢查是否為 WSL
    try {
      const { stdout } = execa.sync('uname', ['-r']);
      if (stdout.toLowerCase().includes('microsoft') || stdout.toLowerCase().includes('wsl')) {
        return 'wsl';
      }
    } catch (error) {
      // 忽略錯誤，繼續判定為 Linux
    }
    return 'linux';
  }

  if (platform === 'win32') {
    return 'windows';
  }

  return 'unknown';
}

/**
 * 取得平台顯示名稱
 * @returns {string}
 */
export function getPlatformName() {
  const platform = getPlatform();
  const names = {
    macos: 'macOS',
    linux: 'Linux',
    windows: 'Windows',
    wsl: 'WSL (Windows Subsystem for Linux)',
    unknown: 'Unknown OS'
  };
  return names[platform];
}

/**
 * 判斷是否為 Unix-like 系統（macOS, Linux, WSL）
 * @returns {boolean}
 */
export function isUnixLike() {
  const platform = getPlatform();
  return platform === 'macos' || platform === 'linux' || platform === 'wsl';
}

/**
 * 判斷是否為 Windows（不包含 WSL）
 * @returns {boolean}
 */
export function isWindows() {
  return getPlatform() === 'windows';
}

/**
 * 取得 Shell 類型
 * @returns {'bash'|'zsh'|'fish'|'powershell'|'cmd'|'unknown'}
 */
export function getShellType() {
  if (isWindows()) {
    // Windows 環境，預設 PowerShell
    return process.env.SHELL?.includes('powershell') ? 'powershell' : 'powershell';
  }

  // Unix-like 系統
  const shell = process.env.SHELL || '';
  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('bash')) return 'bash';
  if (shell.includes('fish')) return 'fish';

  return 'bash'; // 預設為 bash
}

/**
 * 取得 Shell 設定檔路徑
 * @returns {string}
 */
export function getShellConfigPath() {
  const shell = getShellType();
  const home = os.homedir();

  const configPaths = {
    bash: `${home}/.bashrc`,
    zsh: `${home}/.zshrc`,
    fish: `${home}/.config/fish/config.fish`,
    powershell: `${home}/Documents/PowerShell/Microsoft.PowerShell_profile.ps1`,
  };

  return configPaths[shell] || configPaths.bash;
}

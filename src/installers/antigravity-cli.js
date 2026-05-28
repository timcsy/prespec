import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import os from 'os';
import path from 'path';
import { isWindows } from '../utils/platform.js';

/**
 * 安裝 Antigravity CLI（Google Gemini CLI 的官方接班工具，指令為 agy）
 * @returns {Promise<boolean>}
 */
export async function installAntigravityCli() {
  const spinner = ora('正在安裝 Antigravity CLI...').start();

  try {
    if (isWindows()) {
      // Windows: 使用官方 PowerShell 安裝腳本
      await execa('pwsh', ['-Command', 'irm https://antigravity.google/cli/install.ps1 | iex'], {
        stdio: 'inherit'
      });
    } else {
      // macOS / Linux / WSL: 使用官方安裝腳本
      await execa('bash', ['-c', 'curl -fsSL https://antigravity.google/cli/install.sh | bash'], {
        stdio: 'inherit'
      });
    }

    spinner.succeed(chalk.green('✓ Antigravity CLI 安裝成功！'));

    // 更新當前 process 的 PATH，讓 agy 立即可用（Unix-like 安裝到 ~/.local/bin）
    if (!isWindows()) {
      const agyPath = path.join(os.homedir(), '.local', 'bin');
      if (!process.env.PATH.includes(agyPath)) {
        process.env.PATH = `${agyPath}${path.delimiter}${process.env.PATH}`;
        console.log(chalk.dim(`\n已將 ${agyPath} 加入當前 session 的 PATH\n`));
      }
    }

    displayAntigravityCliInstructions();
    return true;
  } catch (error) {
    spinner.fail(chalk.red('✗ Antigravity CLI 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    console.log(chalk.yellow('\n請嘗試手動安裝：'));
    if (isWindows()) {
      console.log(chalk.cyan('  pwsh -Command "irm https://antigravity.google/cli/install.ps1 | iex"'));
    } else {
      console.log(chalk.cyan('  curl -fsSL https://antigravity.google/cli/install.sh | bash'));
    }
    console.log();

    return false;
  }
}

/**
 * 顯示 Antigravity CLI 使用說明
 */
export function displayAntigravityCliInstructions() {
  console.log(chalk.bold.cyan('\n📖 Antigravity CLI 使用說明：\n'));

  console.log(chalk.white('Antigravity CLI 是 Google 的終端機 AI 代理工具，'));
  console.log(chalk.white('為 Gemini CLI 的官方接班工具（指令為 agy）。\n'));

  console.log(chalk.white('1. 啟動 Antigravity CLI：'));
  console.log(chalk.yellow('   在專案目錄中執行：'));
  console.log(chalk.cyan('   agy\n'));

  console.log(chalk.white('2. 首次使用需要認證：'));
  console.log(chalk.yellow('   首次執行會開啟瀏覽器進行 Google 帳號登入'));
  console.log(chalk.dim('   認證資訊會快取於系統 keyring（macOS Keychain / Windows 認證管理員 / Linux libsecret）\n'));

  console.log(chalk.white('3. 常用指令：'));
  console.log(chalk.cyan('   agy --version  - 查看版本'));
  console.log(chalk.cyan('   agy --help     - 查看完整說明'));
  console.log();

  console.log(chalk.yellow('⚠️  注意：'));
  console.log(chalk.dim('   舊版 Gemini CLI（@google/gemini-cli）將於 2026/6/18 停止為免費／個人帳號提供服務'));
  console.log(chalk.dim('   個人使用者請改用 Antigravity CLI\n'));

  console.log(chalk.blue('💡 更多資訊：'));
  console.log(chalk.blue('   https://antigravity.google/'));
  console.log();
}

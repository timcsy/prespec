import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { isWindows } from '../utils/platform.js';

/**
 * 安裝 Claude Code CLI
 * @returns {Promise<boolean>}
 */
export async function installClaudeCode() {
  const spinner = ora('正在安裝 Claude Code CLI...').start();

  try {
    if (isWindows()) {
      // Windows: 使用官方 PowerShell 安裝腳本
      await execa('powershell', ['-Command', 'irm https://claude.ai/install.ps1 | iex'], {
        stdio: 'inherit'
      });
    } else {
      // macOS / Linux / WSL: 使用官方安裝腳本
      await execa('bash', ['-c', 'curl -fsSL https://claude.ai/install.sh | bash'], {
        stdio: 'inherit'
      });
    }

    spinner.succeed(chalk.green('✓ Claude Code CLI 安裝成功！'));
    displayClaudeCodeInstructions();
    return true;
  } catch (error) {
    spinner.fail(chalk.red('✗ Claude Code CLI 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    console.log(chalk.yellow('\n請嘗試手動安裝：'));
    if (isWindows()) {
      console.log(chalk.cyan('  powershell -Command "irm https://claude.ai/install.ps1 | iex"'));
    } else {
      console.log(chalk.cyan('  curl -fsSL https://claude.ai/install.sh | bash'));
    }
    console.log();

    return false;
  }
}

/**
 * 顯示 Claude Code CLI 使用說明
 */
export function displayClaudeCodeInstructions() {
  console.log(chalk.bold.cyan('\n📖 Claude Code CLI 使用說明：\n'));

  console.log(chalk.white('1. 啟動 Claude Code：'));
  console.log(chalk.yellow('   在專案目錄中執行：'));
  console.log(chalk.cyan('   claude\n'));

  console.log(chalk.white('2. 首次使用需要登入：'));
  console.log(chalk.yellow('   按照提示登入您的 Anthropic 帳號\n'));

  console.log(chalk.white('3. 常用指令：'));
  console.log(chalk.cyan('   claude doctor  - 檢查安裝狀態'));
  console.log(chalk.cyan('   claude --help  - 查看完整說明'));
  console.log();

  console.log(chalk.blue('💡 更多資訊：'));
  console.log(chalk.blue('   https://code.claude.com/docs/en/setup'));
  console.log();
}

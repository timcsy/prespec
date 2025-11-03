import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';

/**
 * 安裝 Claude Code CLI
 * @returns {Promise<boolean>}
 */
export async function installClaudeCode() {
  const spinner = ora('正在安裝 Claude Code CLI...').start();

  try {
    // 使用 npm 全域安裝
    await execa('npm', ['install', '-g', '@anthropic-ai/claude-code'], {
      stdio: 'inherit'
    });

    spinner.succeed(chalk.green('✓ Claude Code CLI 安裝成功！'));
    displayClaudeCodeInstructions();
    return true;
  } catch (error) {
    spinner.fail(chalk.red('✗ Claude Code CLI 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    console.log(chalk.yellow('\n請嘗試手動安裝：'));
    console.log(chalk.cyan('  npm install -g @anthropic-ai/claude-code'));
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
  console.log(chalk.blue('   https://docs.claude.com/en/docs/claude-code'));
  console.log();
}

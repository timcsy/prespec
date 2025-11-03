import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';

/**
 * 安裝 OpenAI Codex CLI
 * @returns {Promise<boolean>}
 */
export async function installCodexCli() {
  const spinner = ora('正在安裝 OpenAI Codex CLI...').start();

  try {
    // 使用 npm 全域安裝
    await execa('npm', ['install', '-g', '@openai/codex'], {
      stdio: 'inherit'
    });

    spinner.succeed(chalk.green('✓ OpenAI Codex CLI 安裝成功！'));
    displayCodexCliInstructions();
    return true;
  } catch (error) {
    spinner.fail(chalk.red('✗ OpenAI Codex CLI 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    console.log(chalk.yellow('\n請嘗試手動安裝：'));
    console.log(chalk.cyan('  npm install -g @openai/codex'));
    console.log();

    return false;
  }
}

/**
 * 顯示 Codex CLI 使用說明
 */
export function displayCodexCliInstructions() {
  console.log(chalk.bold.cyan('\n📖 OpenAI Codex CLI 使用說明：\n'));

  console.log(chalk.white('1. 啟動 Codex CLI：'));
  console.log(chalk.yellow('   在專案目錄中執行：'));
  console.log(chalk.cyan('   codex\n'));

  console.log(chalk.white('2. 首次使用需要認證：'));
  console.log(chalk.yellow('   登入您的 ChatGPT 帳號'));
  console.log(chalk.dim('   建議使用 ChatGPT Plus, Pro, Business, Edu 或 Enterprise 方案\n'));

  console.log(chalk.white('3. 常用指令：'));
  console.log(chalk.cyan('   codex --help     - 查看完整說明'));
  console.log(chalk.cyan('   codex --version  - 查看版本'));
  console.log();

  console.log(chalk.blue('💡 更多資訊：'));
  console.log(chalk.blue('   https://github.com/openai/codex'));
  console.log();
}

import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';

/**
 * 安裝 GitHub Copilot CLI
 * @returns {Promise<boolean>}
 */
export async function installCopilot() {
  const spinner = ora('正在安裝 GitHub Copilot CLI...').start();

  try {
    await execa('npm', ['install', '-g', '@github/copilot'], {
      stdio: 'inherit'
    });

    spinner.succeed(chalk.green('✓ GitHub Copilot CLI 安裝成功！'));

    // 顯示設定說明
    displayCopilotSetupInstructions();

    return true;
  } catch (error) {
    spinner.fail(chalk.red('✗ GitHub Copilot CLI 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));
    return false;
  }
}

/**
 * 顯示 GitHub Copilot CLI 設定說明
 */
export function displayCopilotSetupInstructions() {
  console.log(chalk.bold.cyan('\n📖 GitHub Copilot CLI 使用說明：\n'));

  console.log(chalk.white('1. 首次使用需要進行身份驗證：'));
  console.log(chalk.yellow('   在終端機中輸入任何問題，系統會自動引導您進行認證\n'));

  console.log(chalk.white('2. 切換 AI 模型（重要）：'));
  console.log(chalk.yellow('   使用 /model 指令來切換不同的 AI 模型'));
  console.log(chalk.green('   推薦使用：'));
  console.log(chalk.cyan('   /model claude-haiku-4.5\n'));

  console.log(chalk.white('3. 基本使用方式：'));
  console.log(chalk.yellow('   直接在終端機中輸入問題或指令'));
  console.log(chalk.dim('   例如：如何列出目前目錄的檔案？\n'));

  console.log(chalk.white('4. 其他常用指令：'));
  console.log(chalk.yellow('   /help    - 顯示所有可用指令'));
  console.log(chalk.yellow('   /clear   - 清除對話歷史'));
  console.log(chalk.yellow('   /exit    - 退出 Copilot CLI\n'));

  console.log(chalk.cyan('更多資訊請參考：'));
  console.log(chalk.blue('https://github.com/github/copilot-cli\n'));
}

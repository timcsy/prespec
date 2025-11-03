import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';

/**
 * 安裝 Gemini CLI
 * @returns {Promise<boolean>}
 */
export async function installGeminiCli() {
  const spinner = ora('正在安裝 Gemini CLI...').start();

  try {
    // 使用 npm 全域安裝
    await execa('npm', ['install', '-g', '@google/gemini-cli'], {
      stdio: 'inherit'
    });

    spinner.succeed(chalk.green('✓ Gemini CLI 安裝成功！'));
    displayGeminiCliInstructions();
    return true;
  } catch (error) {
    spinner.fail(chalk.red('✗ Gemini CLI 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    console.log(chalk.yellow('\n請嘗試手動安裝：'));
    console.log(chalk.cyan('  npm install -g @google/gemini-cli'));
    console.log();

    return false;
  }
}

/**
 * 顯示 Gemini CLI 使用說明
 */
export function displayGeminiCliInstructions() {
  console.log(chalk.bold.cyan('\n📖 Gemini CLI 使用說明：\n'));

  console.log(chalk.white('1. 啟動 Gemini CLI：'));
  console.log(chalk.yellow('   在專案目錄中執行：'));
  console.log(chalk.cyan('   gemini\n'));

  console.log(chalk.white('2. 首次使用需要認證：'));
  console.log(chalk.yellow('   使用您的 Google 帳號登入'));
  console.log(chalk.dim('   免費帳號提供 60 requests/min, 1000 requests/day\n'));

  console.log(chalk.white('3. 常用指令：'));
  console.log(chalk.cyan('   gemini --version  - 查看版本'));
  console.log(chalk.cyan('   gemini --help     - 查看完整說明'));
  console.log();

  console.log(chalk.blue('💡 更多資訊：'));
  console.log(chalk.blue('   https://github.com/google-gemini/gemini-cli'));
  console.log();
}

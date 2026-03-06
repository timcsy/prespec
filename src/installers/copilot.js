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

  console.log(chalk.white('1. 啟動 Copilot CLI：'));
  console.log(chalk.yellow('   在專案目錄中執行：'));
  console.log(chalk.cyan('   copilot\n'));

  console.log(chalk.white('2. 首次使用需要登入：'));
  console.log(chalk.yellow('   在 Copilot CLI 中輸入：'));
  console.log(chalk.cyan('   /login\n'));

  console.log(chalk.white('3. 切換 AI 模型（選用）：'));
  console.log(chalk.yellow('   預設使用 Claude Sonnet 4.6'));
  console.log(chalk.dim('   也可切換為：Claude Sonnet 4、GPT-5 等'));
  console.log(chalk.cyan('   /model <模型名稱>\n'));

  console.log(chalk.white('4. 基本使用：'));
  console.log(chalk.yellow('   直接用自然語言描述您的需求'));
  console.log(chalk.dim('   Copilot 會協助您進行編碼、除錯和理解程式碼\n'));

  console.log(chalk.white('5. 其他常用指令：'));
  console.log(chalk.cyan('   /feedback  - 提交意見回饋\n'));

  console.log(chalk.yellow('⚠️  系統需求：'));
  console.log(chalk.dim('   - Node.js v22+'));
  console.log(chalk.dim('   - npm v10+'));
  console.log(chalk.dim('   - 有效的 GitHub Copilot 訂閱\n'));

  console.log(chalk.cyan('更多資訊請參考：'));
  console.log(chalk.blue('https://github.com/github/copilot-cli\n'));
}

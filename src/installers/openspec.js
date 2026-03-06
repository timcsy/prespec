import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';

/**
 * 安裝 OpenSpec
 * @returns {Promise<boolean>}
 */
export async function installOpenSpec() {
  const spinner = ora('正在安裝 OpenSpec...').start();

  try {
    await execa('npm', ['install', '-g', '@fission-ai/openspec@latest'], {
      stdio: 'inherit'
    });

    spinner.succeed(chalk.green('✓ OpenSpec 安裝成功！'));

    displayOpenSpecInstructions();

    return true;
  } catch (error) {
    spinner.fail(chalk.red('✗ OpenSpec 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    console.log(chalk.yellow('\n請嘗試手動安裝：'));
    console.log(chalk.cyan('  npm install -g @fission-ai/openspec@latest'));
    console.log(chalk.blue('\n更多資訊：https://github.com/fission-ai/openspec\n'));

    return false;
  }
}

/**
 * 顯示 OpenSpec 使用說明
 */
export function displayOpenSpecInstructions() {
  console.log(chalk.bold.cyan('\n📖 OpenSpec 使用說明：\n'));

  console.log(chalk.white('OpenSpec 是規格驅動開發工具，將需求轉化為可執行規格。\n'));

  console.log(chalk.white('初始化專案：'));
  console.log(chalk.yellow('  openspec init\n'));

  console.log(chalk.white('在 AI 助手中使用以下指令：'));
  console.log(chalk.cyan('  /opsx:propose  - 提出需求變更'));
  console.log(chalk.cyan('  /opsx:apply    - 套用規格到程式碼\n'));

  console.log(chalk.yellow('💡 提示：'));
  console.log(chalk.dim('  OpenSpec 以規格為核心，讓 AI 依照規格進行開發'));
  console.log(chalk.dim('  可與 Spec Kit 並列使用，擇一或搭配皆可\n'));

  console.log(chalk.cyan('更多資訊：'));
  console.log(chalk.blue('https://github.com/fission-ai/openspec\n'));
}

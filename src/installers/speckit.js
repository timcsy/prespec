import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';

// 官方建議釘特定 release tag，避免裝到 main 分支的不穩定版本
// 最新版本請參考 https://github.com/github/spec-kit/releases
const SPECKIT_VERSION = 'v0.8.17';

/**
 * 安裝 Spec Kit (Specify CLI)
 * @returns {Promise<boolean>}
 */
export async function installSpecKit() {
  const spinner = ora('正在安裝 Spec Kit (Specify CLI)...').start();

  try {
    // 使用 uv 從 Git 安裝（釘特定 release tag）
    await execa('uv', [
      'tool',
      'install',
      'specify-cli',
      '--from',
      `git+https://github.com/github/spec-kit.git@${SPECKIT_VERSION}`
    ], {
      stdio: 'inherit'
    });

    spinner.succeed(chalk.green('✓ Spec Kit (Specify CLI) 安裝成功！'));

    // 顯示說明
    displaySpecKitInstructions();

    return true;
  } catch (error) {
    spinner.fail(chalk.red('✗ Spec Kit 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    // 提供備用安裝方法
    console.log(chalk.yellow('\n請嘗試手動安裝 Spec Kit：'));
    console.log(chalk.cyan(`  uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@${SPECKIT_VERSION}`));
    console.log(chalk.blue('\n更多資訊：https://github.com/github/spec-kit\n'));

    return false;
  }
}

/**
 * 顯示 Spec Kit 使用說明
 */
function displaySpecKitInstructions() {
  console.log(chalk.bold.cyan('\n📖 Spec Kit (Specify CLI) 使用說明：\n'));

  console.log(chalk.white('Spec Kit 是規格驅動開發工具，讓規格變成可執行的。\n'));

  console.log(chalk.white('初始化專案：'));
  console.log(chalk.yellow('  specify init <project-name>   - 建立新專案'));
  console.log(chalk.yellow('  specify init . --here         - 在當前目錄初始化\n'));

  console.log(chalk.white('在 AI 助手中使用以下指令（依順序）：'));
  console.log(chalk.cyan('  /speckit.constitution  - 建立專案治理原則'));
  console.log(chalk.cyan('  /speckit.specify       - 定義需求和使用者故事'));
  console.log(chalk.cyan('  /speckit.plan          - 建立技術實作計劃'));
  console.log(chalk.cyan('  /speckit.tasks         - 產生可執行任務清單'));
  console.log(chalk.cyan('  /speckit.implement     - 執行所有任務完成開發\n'));

  console.log(chalk.yellow('💡 提示：'));
  console.log(chalk.dim('  Spec Kit 強調從「做什麼和為什麼」開始'));
  console.log(chalk.dim('  與 AI 編碼助手整合，實現規格驅動開發\n'));

  console.log(chalk.cyan('更多資訊：'));
  console.log(chalk.blue('https://github.com/github/spec-kit\n'));
}

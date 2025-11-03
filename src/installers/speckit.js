import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { isWindows } from '../utils/platform.js';

/**
 * 安裝 Spec Kit
 * @returns {Promise<boolean>}
 */
export async function installSpecKit() {
  const spinner = ora('正在安裝 Spec Kit...').start();

  try {
    if (isWindows()) {
      // Windows: 使用 PowerShell 安裝腳本
      spinner.text = '正在透過 PowerShell 安裝 Spec Kit...';
      await execa('powershell', [
        '-c',
        'iwr https://raw.githubusercontent.com/github/spec-kit/main/install.ps1 -useb | iex'
      ], {
        stdio: 'inherit'
      });
    } else {
      // macOS / Linux / WSL: 使用 bash 安裝腳本
      const installCommand = 'curl -fsSL https://raw.githubusercontent.com/github/spec-kit/main/install.sh | bash';
      await execa('bash', ['-c', installCommand], {
        stdio: 'inherit'
      });
    }

    spinner.succeed(chalk.green('✓ Spec Kit 安裝成功！'));

    // 顯示說明
    console.log(chalk.cyan('\nSpec Kit 已安裝完成。'));
    console.log(chalk.dim('Spec Kit 是 GitHub 的規格撰寫工具\n'));

    console.log(chalk.white('常用指令：'));
    console.log(chalk.yellow('  spec init        - 初始化新規格專案'));
    console.log(chalk.yellow('  spec validate    - 驗證規格檔案'));
    console.log(chalk.yellow('  spec generate    - 產生文件'));
    console.log();

    console.log(chalk.cyan('更多資訊：'));
    console.log(chalk.blue('https://github.com/github/spec-kit\n'));

    return true;
  } catch (error) {
    spinner.fail(chalk.red('✗ Spec Kit 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    // 提供備用安裝方法
    console.log(chalk.yellow('\n請嘗試手動安裝 Spec Kit：'));
    if (isWindows()) {
      console.log(chalk.cyan('  iwr https://raw.githubusercontent.com/github/spec-kit/main/install.ps1 -useb | iex'));
    } else {
      console.log(chalk.cyan('  curl -fsSL https://raw.githubusercontent.com/github/spec-kit/main/install.sh | bash'));
    }
    console.log(chalk.blue('\n更多資訊：https://github.com/github/spec-kit\n'));

    return false;
  }
}

import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { isWindows } from '../utils/platform.js';

/**
 * 安裝 UV
 * @returns {Promise<boolean>}
 */
export async function installUv() {
  const spinner = ora('正在安裝 UV...').start();

  try {
    if (isWindows()) {
      // Windows: 使用 PowerShell 7 安裝腳本
      await execa('pwsh', ['-c', 'irm https://astral.sh/uv/install.ps1 | iex'], {
        stdio: 'inherit'
      });
    } else {
      // macOS / Linux / WSL: 使用 curl 安裝
      const installCommand = 'curl -LsSf https://astral.sh/uv/install.sh | sh';
      await execa('bash', ['-c', installCommand], {
        stdio: 'inherit'
      });
    }

    spinner.succeed(chalk.green('✓ UV 安裝成功！'));

    // 顯示說明
    console.log(chalk.cyan('\nUV 已安裝完成。UV 會自動管理 Python 版本。'));
    console.log(chalk.dim('使用 uv 指令來管理 Python 專案和套件\n'));

    console.log(chalk.white('常用指令：'));
    console.log(chalk.yellow('  uv init          - 初始化新專案'));
    console.log(chalk.yellow('  uv add <package> - 新增套件'));
    console.log(chalk.yellow('  uv run <command> - 執行指令'));
    console.log(chalk.yellow('  uv python list   - 列出可用的 Python 版本'));
    console.log();

    return true;
  } catch (error) {
    spinner.fail(chalk.red('✗ UV 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    // 提供備用安裝方法
    console.log(chalk.yellow('\n請嘗試手動安裝 UV：'));
    if (isWindows()) {
      console.log(chalk.cyan('  pwsh -c "irm https://astral.sh/uv/install.ps1 | iex"'));
    } else {
      console.log(chalk.cyan('  curl -LsSf https://astral.sh/uv/install.sh | sh'));
    }
    console.log(chalk.blue('\n更多資訊：https://docs.astral.sh/uv/\n'));

    return false;
  }
}

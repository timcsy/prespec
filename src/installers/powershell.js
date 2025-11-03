import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';

/**
 * 升級 PowerShell 到最新版本
 * @returns {Promise<boolean>}
 */
export async function upgradePowerShell() {
  const spinner = ora('正在升級 PowerShell...').start();

  try {
    // 使用 winget 安裝最新版 PowerShell
    spinner.text = '正在透過 winget 安裝 PowerShell 7...';

    await execa('winget', [
      'install',
      '--id',
      'Microsoft.PowerShell',
      '--source',
      'winget',
      '--accept-package-agreements',
      '--accept-source-agreements'
    ], {
      stdio: 'inherit'
    });

    spinner.succeed(chalk.green('✓ PowerShell 升級成功！'));

    console.log(chalk.yellow('\n⚠️  重要提示：'));
    console.log(chalk.white('請關閉目前的 PowerShell 視窗，並開啟新的 PowerShell 7 視窗'));
    console.log(chalk.dim('然後重新執行 prespec 完成安裝\n'));

    return true;
  } catch (error) {
    spinner.fail(chalk.red('✗ PowerShell 升級失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    // 提供手動安裝方法
    displayManualUpgradeInstructions();

    return false;
  }
}

/**
 * 顯示手動升級 PowerShell 的說明
 */
export function displayManualUpgradeInstructions() {
  console.log(chalk.yellow('\n請嘗試手動升級 PowerShell：\n'));

  console.log(chalk.white('方法 1：使用 winget（推薦）'));
  console.log(chalk.cyan('  winget install Microsoft.PowerShell\n'));

  console.log(chalk.white('方法 2：使用 MSI 安裝程式'));
  console.log(chalk.cyan('  前往：https://github.com/PowerShell/PowerShell/releases'));
  console.log(chalk.dim('  下載最新的 .msi 安裝檔並執行\n'));

  console.log(chalk.white('方法 3：使用 Chocolatey'));
  console.log(chalk.cyan('  choco install powershell-core\n'));

  console.log(chalk.blue('更多資訊：https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows\n'));
}

/**
 * 提示使用者 PowerShell 版本過低
 * @param {number|null} version - 目前的 PowerShell 版本
 */
export function displayPowerShellWarning(version) {
  console.log(chalk.bold.yellow('\n⚠️  PowerShell 版本過低\n'));

  if (version) {
    console.log(chalk.white(`目前版本：PowerShell ${version}`));
  } else {
    console.log(chalk.white('無法偵測 PowerShell 版本'));
  }

  console.log(chalk.white('需要版本：PowerShell 6 或更高版本\n'));

  console.log(chalk.yellow('GitHub Copilot CLI 在 Windows 上需要 PowerShell 6+ 才能正常運作。'));
  console.log(chalk.white('是否要現在升級 PowerShell？\n'));
}

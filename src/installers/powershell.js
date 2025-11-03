import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';

/**
 * 升級 PowerShell 到最新版本
 * @returns {Promise<boolean>}
 */
export async function upgradePowerShell() {
  let spinner = ora('正在升級 PowerShell...').start();

  // 方法 1: 嘗試使用 winget
  try {
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
    displayRestartMessage();
    return true;

  } catch (wingetError) {
    spinner.warn(chalk.yellow('winget 安裝失敗，嘗試使用 MSI 安裝程式...'));

    // 方法 2: 使用 MSI 安裝
    try {
      return await installViaMSI();
    } catch (msiError) {
      spinner = ora().start();
      spinner.fail(chalk.red('✗ PowerShell 升級失敗'));
      console.error(chalk.red(`winget 錯誤：${wingetError.message}`));
      console.error(chalk.red(`MSI 錯誤：${msiError.message}`));

      // 提供手動安裝方法
      displayManualUpgradeInstructions();
      return false;
    }
  }
}

/**
 * 使用 MSI 安裝 PowerShell
 * @returns {Promise<boolean>}
 */
async function installViaMSI() {
  const spinner = ora('正在下載並安裝 PowerShell MSI...').start();

  try {
    // 下載最新的 PowerShell MSI
    spinner.text = '正在下載 PowerShell 安裝檔...';

    // 使用 PowerShell 下載最新版本的 MSI
    const downloadScript = `
      $ProgressPreference = 'SilentlyContinue'
      $latestRelease = Invoke-RestMethod -Uri 'https://api.github.com/repos/PowerShell/PowerShell/releases/latest'
      $msiAsset = $latestRelease.assets | Where-Object { $_.name -like '*-win-x64.msi' } | Select-Object -First 1
      $downloadUrl = $msiAsset.browser_download_url
      $outputPath = "$env:TEMP\\PowerShell-Latest.msi"
      Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath
      Write-Output $outputPath
    `;

    const { stdout: msiPath } = await execa('powershell', ['-Command', downloadScript]);

    spinner.text = '正在安裝 PowerShell...';

    // 安裝 MSI（靜默安裝）
    await execa('msiexec', [
      '/i',
      msiPath.trim(),
      '/qn',
      '/norestart'
    ], {
      stdio: 'inherit'
    });

    spinner.succeed(chalk.green('✓ PowerShell 升級成功！'));
    displayRestartMessage();
    return true;

  } catch (error) {
    spinner.fail(chalk.red('✗ MSI 安裝失敗'));
    throw error;
  }
}

/**
 * 顯示重新啟動提示
 */
function displayRestartMessage() {
  console.log(chalk.yellow('\n⚠️  重要提示：'));
  console.log(chalk.white('請關閉目前的 PowerShell 視窗，並開啟新的 PowerShell 7 視窗'));
  console.log(chalk.dim('然後重新執行 prespec 完成安裝\n'));
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

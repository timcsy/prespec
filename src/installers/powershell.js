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
    // 使用 MSI 安裝 PowerShell
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

    spinner.text = '正在安裝 PowerShell...（這可能需要幾分鐘）';

    // 安裝 MSI（靜默安裝）
    await execa('msiexec', [
      '/i',
      msiPath.trim(),
      '/qn',
      '/norestart',
      'ADD_EXPLORER_CONTEXT_MENU_OPENPOWERSHELL=1',
      'ADD_FILE_CONTEXT_MENU_RUNPOWERSHELL=1'
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
    console.log(chalk.yellow('\n自動安裝失敗，請嘗試手動安裝：\n'));
    displayManualUpgradeInstructions();

    return false;
  }
}


/**
 * 顯示手動升級 PowerShell 的說明
 */
export function displayManualUpgradeInstructions() {
  console.log(chalk.bold.cyan('📖 PowerShell 升級方法：\n'));

  console.log(chalk.white('【方法 1】使用 winget（推薦，最簡單）'));
  console.log(chalk.yellow('  1. 開啟 PowerShell（系統管理員權限）'));
  console.log(chalk.yellow('  2. 執行以下指令：'));
  console.log(chalk.cyan('     winget install Microsoft.PowerShell'));
  console.log(chalk.dim('  3. 完成後重新開啟 PowerShell\n'));

  console.log(chalk.white('【方法 2】下載 MSI 安裝程式（最可靠）'));
  console.log(chalk.yellow('  1. 前往：'));
  console.log(chalk.cyan('     https://github.com/PowerShell/PowerShell/releases/latest'));
  console.log(chalk.yellow('  2. 下載 PowerShell-x.x.x-win-x64.msi'));
  console.log(chalk.yellow('  3. 執行安裝程式並依照指示完成'));
  console.log(chalk.dim('  4. 完成後重新開啟 PowerShell\n'));

  console.log(chalk.white('【方法 3】使用 Chocolatey'));
  console.log(chalk.yellow('  如果您已安裝 Chocolatey：'));
  console.log(chalk.cyan('     choco install powershell-core\n'));

  console.log(chalk.blue('💡 更多資訊：'));
  console.log(chalk.blue('   https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows\n'));
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

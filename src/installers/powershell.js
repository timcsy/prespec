import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';

/**
 * 升級 PowerShell 到穩定版本 7.3.11
 * @returns {Promise<boolean>}
 */
export async function upgradePowerShell() {
  const spinner = ora('正在升級 PowerShell...').start();

  try {
    // 安裝 PowerShell 7.3.11（已驗證的穩定版本）
    const version = '7.3.11';
    const downloadUrl = `https://github.com/PowerShell/PowerShell/releases/download/v${version}/PowerShell-${version}-win-x64.msi`;

    spinner.text = `正在下載 PowerShell ${version}...`;

    // 下載 MSI
    const downloadScript = `
      $ProgressPreference = 'SilentlyContinue'
      $downloadUrl = '${downloadUrl}'
      $outputPath = "$env:TEMP\\PowerShell-${version}.msi"
      Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath
      Write-Output $outputPath
    `;

    const { stdout: msiPath } = await execa('powershell', ['-Command', downloadScript]);

    spinner.text = `正在安裝 PowerShell ${version}...（這可能需要幾分鐘）`;

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

    spinner.succeed(chalk.green(`✓ PowerShell ${version} 安裝成功！`));

    console.log(chalk.yellow('\n⚠️  重要提示：'));
    console.log(chalk.white('PowerShell 需要重新開啟終端機才能使用新版本'));
    console.log(chalk.cyan('\n請執行以下步驟：'));
    console.log(chalk.white('  1. 關閉目前的終端機視窗'));
    console.log(chalk.white('  2. 重新開啟終端機'));
    console.log(chalk.dim('     建議使用 pwsh（PowerShell 7），cmd 也可以'));
    console.log(chalk.white('  3. 執行：') + chalk.yellow('npx prespec'));
    console.log(chalk.dim('\n然後將繼續完成安裝\n'));

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
  console.log(chalk.yellow('  1. 開啟終端機（系統管理員權限）'));
  console.log(chalk.yellow('  2. 執行以下指令：'));
  console.log(chalk.cyan('     winget install Microsoft.PowerShell'));
  console.log(chalk.dim('  3. 完成後重新開啟終端機並執行：npx prespec\n'));

  console.log(chalk.white('【方法 2】下載 MSI 安裝程式（最可靠）'));
  console.log(chalk.yellow('  1. 下載 PowerShell 7.3.11（已驗證的穩定版本）：'));
  console.log(chalk.cyan('     https://github.com/PowerShell/PowerShell/releases/download/v7.3.11/PowerShell-7.3.11-win-x64.msi'));
  console.log(chalk.yellow('  2. 執行安裝程式並依照指示完成'));
  console.log(chalk.dim('  3. 完成後重新開啟終端機並執行：npx prespec\n'));

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

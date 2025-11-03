import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';

/**
 * 提供 PowerShell 升級指引（不自動安裝，避免系統衝突）
 * @returns {Promise<boolean>}
 */
export async function upgradePowerShell() {
  console.log(chalk.bold.yellow('\n⚠️  需要手動升級 PowerShell\n'));

  console.log(chalk.white('為避免系統衝突和錯誤，建議您手動升級 PowerShell。'));
  console.log(chalk.white('這只需要幾分鐘的時間。\n'));

  displayManualUpgradeInstructions();

  console.log(chalk.cyan('\n升級完成後，請：'));
  console.log(chalk.white('1. 關閉所有 PowerShell 視窗'));
  console.log(chalk.white('2. 開啟新的 PowerShell 7'));
  console.log(chalk.white('3. 重新執行 prespec\n'));

  return false;
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

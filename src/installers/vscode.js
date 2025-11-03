import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import os from 'os';
import { isWindows } from '../utils/platform.js';

/**
 * 安裝 VSCode
 * @returns {Promise<boolean>}
 */
export async function installVSCode() {
  const spinner = ora('正在安裝 VSCode...').start();

  try {
    const platform = os.platform();

    if (platform === 'win32') {
      // Windows: 下載並安裝 VSCode
      spinner.text = '正在下載 VSCode 安裝程式...';

      const downloadUrl = 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user';
      const downloadScript = `
        $ProgressPreference = 'SilentlyContinue'
        $downloadUrl = '${downloadUrl}'
        $outputPath = "$env:TEMP\\VSCodeSetup.exe"
        Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath
        Write-Output $outputPath
      `;

      const { stdout: setupPath } = await execa('pwsh', ['-Command', downloadScript]);

      spinner.text = '正在安裝 VSCode...（這可能需要幾分鐘）';

      // 執行安裝程式（靜默安裝）
      await execa(setupPath.trim(), [
        '/VERYSILENT',
        '/NORESTART',
        '/MERGETASKS=!runcode,addcontextmenufiles,addcontextmenufolders,associatewithfiles,addtopath'
      ], {
        stdio: 'inherit'
      });

      spinner.succeed(chalk.green('✓ VSCode 安裝成功！'));
      displayVSCodeInfo();
      return true;

    } else if (platform === 'darwin') {
      // macOS: 建議使用 Homebrew
      spinner.stop();
      console.log(chalk.yellow('\n請使用 Homebrew 安裝 VSCode：'));
      console.log(chalk.cyan('  brew install --cask visual-studio-code\n'));
      return false;

    } else {
      // Linux: 提供安裝指引
      spinner.stop();
      console.log(chalk.yellow('\n請參考官方文件安裝 VSCode：'));
      console.log(chalk.cyan('  https://code.visualstudio.com/docs/setup/linux\n'));
      return false;
    }

  } catch (error) {
    spinner.fail(chalk.red('✗ VSCode 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    console.log(chalk.yellow('\n請手動下載安裝 VSCode：'));
    console.log(chalk.cyan('  https://code.visualstudio.com/'));
    console.log();

    return false;
  }
}

/**
 * 顯示 VSCode 使用資訊
 */
function displayVSCodeInfo() {
  console.log(chalk.bold.cyan('\n📖 VSCode 使用說明：\n'));

  console.log(chalk.white('建議安裝的擴充套件：'));
  console.log(chalk.yellow('  • GitHub Copilot - AI 程式輔助'));
  console.log(chalk.yellow('  • Python - Python 開發支援'));
  console.log(chalk.yellow('  • ESLint - JavaScript/TypeScript 語法檢查'));
  console.log(chalk.yellow('  • Prettier - 程式碼格式化'));
  console.log();

  console.log(chalk.white('啟動 VSCode：'));
  console.log(chalk.cyan('  在任何目錄執行：code .'));
  console.log();
}

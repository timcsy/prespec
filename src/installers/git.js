import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { isWindows } from '../utils/platform.js';

/**
 * 設定 Git 使用者資訊
 * @param {string} name - 使用者名稱
 * @param {string} email - Email
 * @returns {Promise<boolean>}
 */
export async function configureGit(name, email) {
  const spinner = ora('正在設定 Git 使用者資訊...').start();

  try {
    // 設定使用者名稱
    await execa('git', ['config', '--global', 'user.name', name]);

    // 設定 Email
    await execa('git', ['config', '--global', 'user.email', email]);

    spinner.succeed(chalk.green('✓ Git 使用者資訊設定成功！'));
    console.log(chalk.dim(`  使用者名稱：${name}`));
    console.log(chalk.dim(`  Email：${email}`));

    return true;
  } catch (error) {
    spinner.fail(chalk.red('✗ Git 設定失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));
    return false;
  }
}

/**
 * 安裝 Git
 * @returns {Promise<boolean>}
 */
export async function installGit() {
  const spinner = ora('正在安裝 Git...').start();

  try {
    if (isWindows()) {
      // Windows: 自動下載並安裝 Git
      spinner.text = '正在下載 Git 安裝程式...';

      // 下載最新版本的 Git for Windows
      const downloadScript = `
        $ProgressPreference = 'SilentlyContinue'
        $latestRelease = Invoke-RestMethod -Uri 'https://api.github.com/repos/git-for-windows/git/releases/latest'
        $setupAsset = $latestRelease.assets | Where-Object { $_.name -like '*-64-bit.exe' } | Select-Object -First 1
        $downloadUrl = $setupAsset.browser_download_url
        $outputPath = "$env:TEMP\\Git-Setup.exe"
        Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath
        Write-Output $outputPath
      `;

      const { stdout: setupPath } = await execa('pwsh', ['-Command', downloadScript]);

      spinner.text = '正在安裝 Git...（這可能需要幾分鐘）';

      // 執行安裝程式（靜默安裝，使用預設設定）
      await execa(setupPath.trim(), [
        '/VERYSILENT',
        '/NORESTART',
        '/NOCANCEL',
        '/SP-',
        '/CLOSEAPPLICATIONS',
        '/RESTARTAPPLICATIONS',
        '/COMPONENTS="icons,ext\\reg\\shellhere,assoc,assoc_sh"'
      ], {
        stdio: 'inherit'
      });

      spinner.succeed(chalk.green('✓ Git 安裝成功！'));

      console.log(chalk.yellow('\n⚠️  重要提示：'));
      console.log(chalk.white('Git 需要重新開啟終端機才能使用'));
      console.log(chalk.cyan('\n請執行以下步驟：'));
      console.log(chalk.white('  1. 關閉目前的終端機視窗'));
      console.log(chalk.white('  2. 重新開啟終端機（cmd 或 pwsh 皆可）'));
      console.log(chalk.white('  3. 執行：') + chalk.yellow('npx prespec'));
      console.log(chalk.dim('\n然後將繼續設定 Git 使用者資訊\n'));

      return true;
    } else {
      // 非 Windows 系統提供安裝指引
      spinner.warn(chalk.yellow('請手動安裝 Git'));
      console.log(chalk.cyan('\n安裝方式：'));
      console.log(chalk.yellow('  macOS:   brew install git'));
      console.log(chalk.yellow('  Ubuntu:  sudo apt-get install git'));
      console.log();
      return false;
    }
  } catch (error) {
    spinner.fail(chalk.red('✗ Git 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    if (isWindows()) {
      console.log(chalk.yellow('\n請嘗試手動安裝 Git：'));
      console.log(chalk.cyan('  https://git-scm.com/download/win'));
      console.log();
    }

    return false;
  }
}

/**
 * 檢查並安裝 Git（如果需要）
 * @returns {Promise<boolean>}
 */
export async function installGitIfNeeded() {
  const spinner = ora('正在檢查 Git...').start();

  try {
    await execa('git', ['--version']);
    spinner.info(chalk.blue('Git 已安裝'));
    return true;
  } catch {
    spinner.warn(chalk.yellow('Git 未安裝'));

    if (isWindows()) {
      // Windows 自動安裝
      return await installGit();
    } else {
      // 非 Windows 提供安裝指引
      console.log(chalk.cyan('\n請手動安裝 Git：'));
      console.log(chalk.yellow('  macOS:   brew install git'));
      console.log(chalk.yellow('  Ubuntu:  sudo apt-get install git'));
      console.log();
      return false;
    }
  }
}

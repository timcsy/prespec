import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import os from 'os';
import { isWindows } from '../utils/platform.js';

/**
 * 安裝 NVM
 * @returns {Promise<boolean>} 安裝成功返回 true
 */
export async function installNvm() {
  const spinner = ora('正在安裝 NVM...').start();

  try {
    if (isWindows()) {
      // Windows: 自動安裝 nvm-windows
      spinner.text = '正在下載 nvm-windows 安裝程式...';

      // 下載最新版本的 nvm-setup.exe
      const downloadScript = `
        $ProgressPreference = 'SilentlyContinue'
        $latestRelease = Invoke-RestMethod -Uri 'https://api.github.com/repos/coreybutler/nvm-windows/releases/latest'
        $setupAsset = $latestRelease.assets | Where-Object { $_.name -like 'nvm-setup.exe' } | Select-Object -First 1
        $downloadUrl = $setupAsset.browser_download_url
        $outputPath = "$env:TEMP\\nvm-setup.exe"
        Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath
        Write-Output $outputPath
      `;

      const { stdout: setupPath } = await execa('pwsh', ['-Command', downloadScript]);

      spinner.text = '正在安裝 nvm-windows...';

      // 執行安裝程式（靜默安裝）
      await execa(setupPath.trim(), ['/VERYSILENT', '/SUPPRESSMSGBOXES', '/NORESTART'], {
        stdio: 'inherit'
      });

      spinner.succeed(chalk.green('✓ nvm-windows 安裝成功！'));

      console.log(chalk.yellow('\n⚠️  重要提示：'));
      console.log(chalk.white('nvm 需要重新開啟終端機才能使用'));
      console.log(chalk.cyan('\n請執行以下步驟：'));
      console.log(chalk.white('  1. 關閉目前的終端機視窗'));
      console.log(chalk.white('  2. 重新開啟終端機（cmd 或 pwsh 皆可）'));
      console.log(chalk.white('  3. 執行：') + chalk.yellow('npx prespec'));
      console.log(chalk.dim('\n然後將繼續安裝 Node.js\n'));

      displayNvmUsageInfo();

      return true;
    } else {
      // macOS / Linux / WSL: 使用官方安裝腳本
      const installScript = 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash';

      await execa('bash', ['-c', installScript], {
        stdio: 'inherit'
      });

      spinner.succeed(chalk.green('✓ NVM 安裝成功！'));

      // 提示使用者重新載入 shell
      console.log(chalk.cyan('\n請執行以下指令來載入 NVM：'));
      console.log(chalk.yellow('  source ~/.nvm/nvm.sh'));
      console.log(chalk.dim('或重新開啟終端機視窗\n'));

      displayNvmUsageInfo();

      return true;
    }
  } catch (error) {
    spinner.fail(chalk.red('✗ NVM 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));
    return false;
  }
}

/**
 * 安裝 Node.js（透過 NVM）
 * @param {string} version - 版本號，'lts' 表示最新 LTS 版本
 * @returns {Promise<boolean>}
 */
export async function installNodeViaNvm(version = 'lts') {
  const spinner = ora(`正在透過 NVM 安裝 Node.js ${version === 'lts' ? 'LTS' : version}...`).start();

  try {
    if (isWindows()) {
      // Windows: 使用 nvm-windows 指令
      const versionArg = version === 'lts' ? 'lts' : version;

      // 安裝指定版本
      await execa('nvm', ['install', versionArg], {
        stdio: 'inherit'
      });

      // 使用該版本
      await execa('nvm', ['use', versionArg], {
        stdio: 'inherit'
      });

      spinner.succeed(chalk.green(`✓ Node.js ${version === 'lts' ? 'LTS' : version} 安裝成功！`));
      return true;
    } else {
      // Unix-like: 使用 nvm.sh
      const home = os.homedir();
      const nvmScript = `${home}/.nvm/nvm.sh`;

      // 準備安裝指令
      const versionArg = version === 'lts' ? '--lts' : version;
      const installCommand = `source ${nvmScript} && nvm install ${versionArg} && nvm use ${versionArg}`;

      await execa('bash', ['-c', installCommand], {
        stdio: 'inherit'
      });

      spinner.succeed(chalk.green(`✓ Node.js ${version === 'lts' ? 'LTS' : version} 安裝成功！`));
      return true;
    }
  } catch (error) {
    spinner.fail(chalk.red('✗ Node.js 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    if (isWindows()) {
      console.log(chalk.yellow('\n請手動執行以下指令：'));
      console.log(chalk.cyan(`  nvm install ${version === 'lts' ? 'lts' : version}`));
      console.log(chalk.cyan(`  nvm use ${version === 'lts' ? 'lts' : version}`));
    }

    return false;
  }
}

/**
 * 顯示 NVM 使用說明
 */
function displayNvmUsageInfo() {
  console.log(chalk.bold.cyan('📖 NVM 使用說明：\n'));

  console.log(chalk.white('如果您已有其他方式安裝的 Node.js：'));
  console.log(chalk.cyan('  • NVM 和現有的 Node.js 可以共存'));
  console.log(chalk.cyan('  • 使用 nvm use <version> 切換到 NVM 管理的版本'));
  console.log(chalk.cyan('  • 如果沒有執行 nvm use，系統會使用原本的 Node.js'));
  console.log(chalk.dim('  • 兩個版本的全域 packages 是獨立的\n'));

  console.log(chalk.white('常用指令：'));
  console.log(chalk.yellow('  nvm install lts         - 安裝最新 LTS 版本'));
  console.log(chalk.yellow('  nvm install <version>   - 安裝指定版本'));
  console.log(chalk.yellow('  nvm use <version>       - 切換到指定版本'));
  console.log(chalk.yellow('  nvm list                - 列出已安裝的版本'));
  console.log(chalk.yellow('  nvm current             - 顯示目前使用的版本'));
  console.log();
}

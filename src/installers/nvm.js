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
      // Windows: 使用 nvm-windows
      spinner.text = '正在下載 nvm-windows 安裝程式...';
      spinner.warn(
        chalk.yellow(
          '\nWindows 使用者請手動下載並安裝 nvm-windows：\n' +
          'https://github.com/coreybutler/nvm-windows/releases\n' +
          '下載 nvm-setup.exe 並執行安裝程式。'
        )
      );
      return false;
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
  } catch (error) {
    spinner.fail(chalk.red('✗ Node.js 安裝失敗'));
    console.error(chalk.red(`錯誤：${error.message}`));

    if (isWindows()) {
      console.log(chalk.yellow('\nWindows 使用者請在安裝 nvm-windows 後，執行：'));
      console.log(chalk.cyan(`  nvm install ${version === 'lts' ? 'lts' : version}`));
      console.log(chalk.cyan(`  nvm use ${version === 'lts' ? 'lts' : version}`));
    }

    return false;
  }
}

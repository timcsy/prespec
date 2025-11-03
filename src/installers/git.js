import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';

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
    console.log(chalk.cyan('\n請手動安裝 Git：'));
    console.log(chalk.yellow('  macOS:   brew install git'));
    console.log(chalk.yellow('  Ubuntu:  sudo apt-get install git'));
    console.log(chalk.yellow('  Windows: https://git-scm.com/download/win'));
    console.log();
    return false;
  }
}

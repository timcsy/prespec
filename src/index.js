import chalk from 'chalk';
import { getPlatformName } from './utils/platform.js';
import { checkAllTools } from './utils/check.js';
import {
  displayCheckResults,
  askToContinue,
  askToInstallNvm,
  askNodeVersion,
  askGitUserInfo
} from './utils/prompt.js';
import { installNvm, installNodeViaNvm } from './installers/nvm.js';
import { configureGit, installGitIfNeeded } from './installers/git.js';
import { installCopilot } from './installers/copilot.js';
import { installUv } from './installers/uv.js';
import { installSpecKit } from './installers/speckit.js';

/**
 * 主程式
 */
export async function main() {
  try {
    // 顯示歡迎訊息
    console.log(chalk.bold.cyan('\n╔════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║    Prespec - 開發環境快速安裝工具    ║'));
    console.log(chalk.bold.cyan('╚════════════════════════════════════════╝\n'));

    console.log(chalk.dim(`平台：${getPlatformName()}\n`));

    // 檢查所有工具
    console.log(chalk.yellow('正在檢查已安裝的工具...\n'));
    const tools = await checkAllTools();

    // 顯示檢查結果
    displayCheckResults(tools);

    // 詢問是否繼續
    const shouldContinue = await askToContinue();
    if (!shouldContinue) {
      console.log(chalk.yellow('\n安裝已取消。\n'));
      return;
    }

    console.log(chalk.bold.green('\n開始安裝流程...\n'));

    // 1. NVM 安裝
    if (!tools.nvm.installed) {
      const shouldInstallNvm = await askToInstallNvm();

      if (shouldInstallNvm) {
        const nvmSuccess = await installNvm();

        if (nvmSuccess) {
          // 詢問 Node.js 版本
          const nodeVersion = await askNodeVersion();
          await installNodeViaNvm(nodeVersion);
        }
      }
    } else {
      console.log(chalk.blue('⏭  NVM 已安裝，跳過\n'));
    }

    // 2. Git 設定
    if (tools.git.installed) {
      if (!tools.git.configured) {
        console.log(chalk.yellow('\nGit 未設定使用者資訊'));
        const gitInfo = await askGitUserInfo();
        await configureGit(gitInfo.name, gitInfo.email);
      } else {
        console.log(chalk.blue('⏭  Git 已設定，跳過\n'));
      }
    } else {
      console.log(chalk.yellow('\n⚠  Git 未安裝'));
      await installGitIfNeeded();
    }

    // 3. GitHub Copilot CLI
    if (!tools.copilot.installed) {
      console.log(chalk.cyan('\n正在安裝 GitHub Copilot CLI...'));
      await installCopilot();
    } else {
      console.log(chalk.blue('⏭  GitHub Copilot CLI 已安裝，跳過\n'));
    }

    // 4. UV
    if (!tools.uv.installed) {
      console.log(chalk.cyan('\n正在安裝 UV...'));
      await installUv();
    } else {
      console.log(chalk.blue('⏭  UV 已安裝，跳過\n'));
    }

    // 5. Spec Kit
    if (!tools.speckit.installed) {
      console.log(chalk.cyan('\n正在安裝 Spec Kit...'));
      await installSpecKit();
    } else {
      console.log(chalk.blue('⏭  Spec Kit 已安裝，跳過\n'));
    }

    // 完成訊息
    console.log(chalk.bold.green('\n╔════════════════════════════════════════╗'));
    console.log(chalk.bold.green('║          安裝流程已完成！              ║'));
    console.log(chalk.bold.green('╚════════════════════════════════════════╝\n'));

    // 顯示後續步驟
    displayNextSteps(tools);

  } catch (error) {
    console.error(chalk.red('\n發生錯誤：'), error.message);
    process.exit(1);
  }
}

/**
 * 顯示後續步驟
 * @param {Object} tools - 工具檢查結果
 */
function displayNextSteps(tools) {
  console.log(chalk.bold.cyan('📝 後續步驟：\n'));

  if (!tools.nvm.installed) {
    console.log(chalk.yellow('1. 重新載入 Shell 或重新開啟終端機來啟用 NVM'));
    console.log(chalk.dim('   執行：source ~/.nvm/nvm.sh\n'));
  }

  console.log(chalk.yellow('2. 驗證安裝：'));
  console.log(chalk.dim('   node --version'));
  console.log(chalk.dim('   git --version'));
  console.log(chalk.dim('   github-copilot-cli --version'));
  console.log(chalk.dim('   uv --version'));
  console.log(chalk.dim('   spec --version\n'));

  if (!tools.copilot.installed) {
    console.log(chalk.yellow('3. 首次使用 GitHub Copilot CLI 時，記得先使用 /model 切換模型\n'));
  }

  console.log(chalk.cyan('享受您的開發環境！ 🚀\n'));
}

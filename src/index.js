import chalk from 'chalk';
import inquirer from 'inquirer';
import { getPlatformName, checkPowerShellVersion, isWindows } from './utils/platform.js';
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
import { upgradePowerShell, displayPowerShellWarning } from './installers/powershell.js';

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

    // Windows: 檢查 PowerShell 版本
    if (isWindows()) {
      const psVersion = await checkPowerShellVersion();

      // 如果已經有 PowerShell 7，顯示確認訊息
      if (psVersion.isPwsh) {
        console.log(chalk.green(`✓ 已安裝 PowerShell 7 (版本 ${psVersion.version})\n`));
      }

      if (psVersion.needsUpdate) {
        displayPowerShellWarning(psVersion.version);

        const { shouldUpgrade } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldUpgrade',
            message: '是否要自動升級 PowerShell？',
            default: true
          }
        ]);

        if (shouldUpgrade) {
          const success = await upgradePowerShell();
          if (success) {
            console.log(chalk.yellow('※ 安裝訊息已顯示，請依照指示重新開啟終端機並執行 npx prespec\n'));
            process.exit(0);
          } else {
            console.log(chalk.yellow('\n自動升級失敗。'));
            const { continueAnyway } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'continueAnyway',
                message: '是否要繼續安裝（某些功能可能無法正常運作）？',
                default: false
              }
            ]);

            if (!continueAnyway) {
              console.log(chalk.yellow('\n安裝已取消。請手動升級 PowerShell 後重新執行 npx prespec。\n'));
              process.exit(0);
            }
          }
        } else {
          console.log(chalk.yellow('\n⚠️  提醒：GitHub Copilot CLI 在 Windows 上需要 PowerShell 6+ 才能正常運作。\n'));
        }
      }
    }

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
          if (isWindows()) {
            // Windows: nvm 安裝後需要重新開啟終端機
            console.log(chalk.cyan('\n※ 安裝訊息已顯示，請依照指示重新開啟終端機並執行 npx prespec\n'));
            process.exit(0);
          } else {
            // Unix-like: 可以在同一個 session 中安裝 Node.js
            const nodeVersion = await askNodeVersion();
            await installNodeViaNvm(nodeVersion);
          }
        }
      }
    } else {
      console.log(chalk.blue('⏭  NVM 已安裝，跳過\n'));

      // 檢查 Node.js 狀態
      if (!tools.node.installed) {
        // 沒有安裝 Node.js，詢問是否透過 NVM 安裝
        const { shouldInstallNode } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldInstallNode',
            message: '是否要透過 NVM 安裝 Node.js？',
            default: true
          }
        ]);

        if (shouldInstallNode) {
          const nodeVersion = await askNodeVersion();
          await installNodeViaNvm(nodeVersion);
        }
      } else {
        // 已安裝 Node.js，詢問是否要改用 NVM 管理
        console.log(chalk.yellow(`\n⚠️  偵測到系統已安裝 Node.js ${tools.node.version}`));
        console.log(chalk.white('但可能不是透過 NVM 安裝的。\n'));

        const { useNvmInstead } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'useNvmInstead',
            message: '是否要改用 NVM 來管理 Node.js？（建議）',
            default: false
          }
        ]);

        if (useNvmInstead) {
          console.log(chalk.cyan('\n提示：請先手動移除現有的 Node.js，然後透過 NVM 重新安裝。\n'));

          const { proceedWithNvm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'proceedWithNvm',
              message: '已移除現有 Node.js，現在要透過 NVM 安裝嗎？',
              default: false
            }
          ]);

          if (proceedWithNvm) {
            const nodeVersion = await askNodeVersion();
            await installNodeViaNvm(nodeVersion);
          }
        }
      }
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

  let stepNumber = 1;

  // NVM 重新載入提示
  if (!tools.nvm.installed) {
    console.log(chalk.yellow(`${stepNumber}. 重新載入 Shell 或重新開啟終端機來啟用 NVM`));
    console.log(chalk.dim('   執行：source ~/.nvm/nvm.sh\n'));
    stepNumber++;
  }

  // GitHub Copilot CLI 使用說明
  if (!tools.copilot.installed) {
    console.log(chalk.bold.yellow(`${stepNumber}. GitHub Copilot CLI 快速開始：\n`));

    console.log(chalk.white('   啟動 Copilot：'));
    console.log(chalk.cyan('   $ copilot\n'));

    console.log(chalk.white('   首次使用需要登入：'));
    console.log(chalk.cyan('   /login\n'));

    console.log(chalk.white('   建議切換為 Haiku 模型（更快速）：'));
    console.log(chalk.cyan('   /model'));
    console.log(chalk.dim('   （用方向鍵選擇模型）\n'));

    stepNumber++;
  }

  // 驗證安裝
  console.log(chalk.yellow(`${stepNumber}. 驗證安裝：`));
  console.log(chalk.dim('   node --version'));
  console.log(chalk.dim('   git --version'));
  console.log(chalk.dim('   copilot --version'));
  console.log(chalk.dim('   uv --version'));
  console.log(chalk.dim('   specify --version\n'));

  console.log(chalk.cyan('享受您的開發環境！ 🚀\n'));
}

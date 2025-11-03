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
import { installClaudeCode } from './installers/claude-code.js';
import { installGeminiCli } from './installers/gemini-cli.js';
import { installCodexCli } from './installers/codex-cli.js';
import { installVSCode } from './installers/vscode.js';
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

      // 如果沒有安裝 Node.js，詢問是否透過 NVM 安裝
      if (!tools.node.installed) {
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
      }
      // 如果已有 Node.js，不管是不是透過 NVM 安裝的，都不再詢問
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
      const gitInstalled = await installGitIfNeeded();

      if (gitInstalled && isWindows()) {
        // Windows: Git 安裝後需要重新開啟終端機
        console.log(chalk.cyan('\n※ 安裝訊息已顯示，請依照指示重新開啟終端機並執行 npx prespec\n'));
        process.exit(0);
      }
    }

    // 3. AI CLI 工具（多選）
    console.log(chalk.bold.cyan('\n━━━ AI CLI 工具選擇 ━━━\n'));

    // 建立選項列表
    const aiCliChoices = [];

    if (!tools.copilot.installed) {
      aiCliChoices.push({
        name: 'GitHub Copilot CLI - GitHub 的 AI 程式輔助工具',
        value: 'copilot',
        checked: true
      });
    }

    if (!tools.claudeCode.installed) {
      aiCliChoices.push({
        name: 'Claude Code CLI - Anthropic Claude 的終端機介面',
        value: 'claudeCode'
      });
    }

    if (!tools.geminiCli.installed) {
      aiCliChoices.push({
        name: 'Gemini CLI - Google Gemini 的終端機介面',
        value: 'geminiCli'
      });
    }

    if (!tools.codexCli.installed) {
      aiCliChoices.push({
        name: 'OpenAI Codex CLI - OpenAI 的程式輔助工具',
        value: 'codexCli'
      });
    }

    // 如果有未安裝的工具，詢問使用者要安裝哪些
    if (aiCliChoices.length > 0) {
      const { selectedAiClis } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedAiClis',
          message: '請選擇要安裝的 AI CLI 工具（空白鍵選擇，Enter 確認）：',
          choices: aiCliChoices
        }
      ]);

      // 安裝選擇的工具
      for (const tool of selectedAiClis) {
        if (tool === 'copilot') {
          console.log(chalk.cyan('\n正在安裝 GitHub Copilot CLI...'));
          await installCopilot();
        } else if (tool === 'claudeCode') {
          console.log(chalk.cyan('\n正在安裝 Claude Code CLI...'));
          await installClaudeCode();
        } else if (tool === 'geminiCli') {
          console.log(chalk.cyan('\n正在安裝 Gemini CLI...'));
          await installGeminiCli();
        } else if (tool === 'codexCli') {
          console.log(chalk.cyan('\n正在安裝 OpenAI Codex CLI...'));
          await installCodexCli();
        }
      }

      if (selectedAiClis.length === 0) {
        console.log(chalk.dim('跳過 AI CLI 工具安裝\n'));
      }
    } else {
      console.log(chalk.blue('⏭  所有 AI CLI 工具都已安裝，跳過\n'));
    }

    // 4. UV
    if (!tools.uv.installed) {
      console.log(chalk.cyan('\n正在安裝 UV...'));
      await installUv();
      // UV 安裝後已經更新當前 session 的 PATH，可以繼續安裝 Spec Kit
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

    // 6. VSCode
    if (!tools.vscode.installed) {
      console.log(chalk.cyan('\n═══ VSCode 安裝建議 ═══\n'));
      console.log(chalk.white('VSCode 是強大的程式碼編輯器，搭配 AI CLI 工具使用更便利\n'));

      const { shouldInstallVSCode } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldInstallVSCode',
          message: '是否要安裝 VSCode？',
          default: true
        }
      ]);

      if (shouldInstallVSCode) {
        await installVSCode();
      }
    } else {
      console.log(chalk.blue('⏭  VSCode 已安裝，跳過\n'));
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

  // AI CLI 工具使用說明
  const installedAiTools = [];
  if (tools.copilot?.installed) installedAiTools.push('copilot');
  if (tools.claudeCode?.installed) installedAiTools.push('claude');
  if (tools.geminiCli?.installed) installedAiTools.push('gemini');
  if (tools.codexCli?.installed) installedAiTools.push('codex');

  if (installedAiTools.length > 0) {
    console.log(chalk.bold.yellow(`${stepNumber}. AI CLI 工具快速開始：\n`));

    // GitHub Copilot CLI 特別提醒
    if (tools.copilot?.installed) {
      console.log(chalk.white('   📌 GitHub Copilot CLI：'));
      console.log(chalk.cyan('      啟動：copilot'));
      console.log(chalk.yellow('      首次使用需要登入：/login'));
      console.log(chalk.yellow('      建議選擇 Haiku 模型（更快速且省 token）：/model'));
      console.log(chalk.dim('      （用方向鍵選擇 Haiku）\n'));
    }

    // Claude Code CLI
    if (tools.claudeCode?.installed) {
      console.log(chalk.white('   📌 Claude Code CLI：'));
      console.log(chalk.cyan('      啟動：claude'));
      console.log(chalk.dim('      需要登入您的 Anthropic 帳號\n'));
    }

    // Gemini CLI
    if (tools.geminiCli?.installed) {
      console.log(chalk.white('   📌 Gemini CLI：'));
      console.log(chalk.cyan('      啟動：gemini'));
      console.log(chalk.dim('      需要用 Google 帳號認證\n'));
    }

    // Codex CLI
    if (tools.codexCli?.installed) {
      console.log(chalk.white('   📌 OpenAI Codex CLI：'));
      console.log(chalk.cyan('      啟動：codex'));
      console.log(chalk.dim('      需要登入 ChatGPT 帳號\n'));
    }

    stepNumber++;
  }

  // 驗證安裝
  console.log(chalk.yellow(`${stepNumber}. 驗證安裝：`));
  const verifyCommands = ['node --version', 'git --version'];
  if (tools.copilot?.installed) verifyCommands.push('copilot --version');
  if (tools.claudeCode?.installed) verifyCommands.push('claude --version');
  if (tools.geminiCli?.installed) verifyCommands.push('gemini --version');
  if (tools.codexCli?.installed) verifyCommands.push('codex --version');
  if (tools.uv?.installed) verifyCommands.push('uv --version');
  if (tools.speckit?.installed) verifyCommands.push('specify --version');

  verifyCommands.forEach(cmd => {
    console.log(chalk.dim(`   ${cmd}`));
  });
  console.log();
  stepNumber++;

  // VSCode 建議
  if (!tools.vscode?.installed) {
    console.log(chalk.bold.yellow(`${stepNumber}. 建議安裝 VSCode：\n`));
    console.log(chalk.white('   VSCode 是強大的程式碼編輯器，搭配 AI CLI 工具使用更便利'));
    console.log(chalk.cyan('   下載位置：https://code.visualstudio.com/\n'));

    console.log(chalk.white('   建議安裝的 VSCode 擴充套件：'));
    console.log(chalk.dim('   • GitHub Copilot - AI 程式輔助'));
    console.log(chalk.dim('   • Python - Python 開發'));
    console.log(chalk.dim('   • ESLint - JavaScript/TypeScript 語法檢查'));
    console.log(chalk.dim('   • Prettier - 程式碼格式化\n'));

    stepNumber++;
  }

  console.log(chalk.cyan('享受您的開發環境！ 🚀\n'));
}

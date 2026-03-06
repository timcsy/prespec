import inquirer from 'inquirer';
import chalk from 'chalk';
import os from 'os';

/**
 * 詢問是否繼續安裝
 * @returns {Promise<boolean>}
 */
export async function askToContinue() {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '是否要繼續安裝？',
      default: true
    }
  ]);

  return confirm;
}

/**
 * 詢問是否安裝 NVM
 * @returns {Promise<boolean>}
 */
export async function askToInstallNvm() {
  const { install } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'install',
      message: '是否要安裝 NVM（Node Version Manager）？',
      default: true
    }
  ]);

  return install;
}

/**
 * 詢問 Node.js 版本選擇
 * @returns {Promise<'lts'|string>}
 */
export async function askNodeVersion() {
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: '請選擇要安裝的 Node.js 版本：',
      choices: [
        { name: '最新 LTS 版本（推薦）', value: 'lts' },
        { name: '指定版本', value: 'custom' }
      ],
      default: 'lts'
    }
  ]);

  if (choice === 'custom') {
    const { version } = await inquirer.prompt([
      {
        type: 'input',
        name: 'version',
        message: '請輸入 Node.js 版本號（例如：18.17.0）：',
        validate: (input) => {
          if (!input.trim()) {
            return '版本號不可為空';
          }
          // 簡單的版本格式驗證
          if (!/^\d+(\.\d+){0,2}$/.test(input.trim())) {
            return '請輸入有效的版本號格式（例如：18 或 18.17 或 18.17.0）';
          }
          return true;
        }
      }
    ]);
    return version.trim();
  }

  return 'lts';
}

/**
 * 詢問 Git 使用者資訊
 * @param {string|null} currentName - 目前的使用者名稱
 * @param {string|null} currentEmail - 目前的 email
 * @returns {Promise<{name: string, email: string}>}
 */
export async function askGitUserInfo(currentName = null, currentEmail = null) {
  console.log(chalk.cyan('\n請設定 Git 使用者資訊：'));

  // 如果沒有現有的值，提供預設值
  const defaultName = currentName || os.userInfo().username || '';
  const defaultEmail = currentEmail || `${os.userInfo().username}@example.com` || '';

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Git 使用者名稱：',
      default: defaultName,
      validate: (input) => {
        if (!input.trim()) {
          return '使用者名稱不可為空';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'email',
      message: 'Git Email：',
      default: defaultEmail,
      validate: (input) => {
        if (!input.trim()) {
          return 'Email 不可為空';
        }
        // 簡單的 email 格式驗證
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim())) {
          return '請輸入有效的 Email 格式';
        }
        return true;
      }
    }
  ]);

  return {
    name: answers.name.trim(),
    email: answers.email.trim()
  };
}

/**
 * 顯示工具檢查結果
 * @param {Object} tools - 工具檢查結果
 */
export function displayCheckResults(tools) {
  console.log(chalk.bold.cyan('\n📋 檢查現有工具安裝狀態：\n'));

  const items = [
    {
      name: 'NVM',
      data: tools.nvm,
      getStatus: (d) => d.installed ? `✓ 已安裝 ${d.version ? `(${d.version})` : ''}` : '✗ 未安裝'
    },
    {
      name: 'Node.js',
      data: tools.node,
      getStatus: (d) => d.installed ? `✓ 已安裝 ${d.version ? `(${d.version})` : ''}` : '✗ 未安裝'
    },
    {
      name: 'Git',
      data: tools.git,
      getStatus: (d) => {
        if (!d.installed) return '✗ 未安裝';
        const configStatus = d.configured
          ? chalk.green(`已設定 (${d.user} <${d.email}>)`)
          : chalk.yellow('未設定使用者資訊');
        return `✓ 已安裝 ${d.version ? `(${d.version})` : ''} - ${configStatus}`;
      }
    },
    {
      name: 'AI CLI 工具',
      data: tools,
      getStatus: (t) => {
        const installed = [];
        if (t.copilot?.installed) installed.push('Copilot');
        if (t.claudeCode?.installed) installed.push('Claude');
        if (t.geminiCli?.installed) installed.push('Gemini');
        if (t.codexCli?.installed) installed.push('Codex');

        if (installed.length === 0) return '✗ 未安裝';
        return `✓ 已安裝 (${installed.join(', ')})`;
      }
    },
    {
      name: 'UV',
      data: tools.uv,
      getStatus: (d) => d.installed ? `✓ 已安裝 ${d.version ? `(${d.version})` : ''}` : '✗ 未安裝'
    },
    {
      name: 'Spec Kit',
      data: tools.speckit,
      getStatus: (d) => d.installed ? `✓ 已安裝 ${d.version ? `(${d.version})` : ''}` : '✗ 未安裝'
    },
    {
      name: 'OpenSpec',
      data: tools.openspec,
      getStatus: (d) => d.installed ? `✓ 已安裝 ${d.version ? `(${d.version})` : ''}` : '✗ 未安裝'
    }
  ];

  items.forEach(item => {
    const status = item.getStatus(item.data);
    // AI CLI 工具需要特別處理，檢查是否有任何一個已安裝
    let installed = item.data.installed;
    if (item.name === 'AI CLI 工具') {
      installed = item.data.copilot?.installed ||
                  item.data.claudeCode?.installed ||
                  item.data.geminiCli?.installed ||
                  item.data.codexCli?.installed;
    }
    const color = installed ? chalk.green : chalk.red;
    console.log(`  ${color(item.name.padEnd(25))} ${status}`);
  });

  console.log();
}

# Prespec

> 跨平台開發環境快速安裝工具

一鍵安裝常用的開發工具，包括 NVM、Node.js、Git、AI CLI 工具、UV、Spec Kit 和 VSCode。

## 快速開始

### 前置需求

執行 `npx prespec` 需要先安裝 **Node.js 18.0.0 或更高版本**。

**如果 `npx` 指令失敗，請先安裝 Node.js：**

- **macOS / Linux**：
  ```bash
  # 使用官方安裝程式
  # 下載：https://nodejs.org/
  ```

- **Windows**：
  ```bash
  # 下載並安裝 Node.js
  # 下載：https://nodejs.org/
  ```

安裝完成後，重新開啟終端機即可使用 `npx` 指令。

### 三步驟完成開發環境設定

```bash
# 1. 執行安裝程式
npx prespec

# 2. 如有需要，重新開啟終端機（程式會提示）

# 3. 開始使用！
copilot     # 啟動 GitHub Copilot CLI
gemini      # 啟動 Gemini CLI
claude      # 啟動 Claude Code CLI
specify     # 使用 Spec Kit
```

**就這麼簡單！** 程式會自動：
- ✅ 檢測已安裝的工具
- ✅ 引導您完成互動式安裝
- ✅ 設定 Git 使用者資訊
- ✅ 提供詳細的使用說明

> 💡 **提示**：如果您還沒有 Node.js，prespec 會幫您安裝 NVM 和 Node.js！但首次執行需要先有一個 Node.js 來執行安裝程式本身。

## 功能特色

- 🚀 **一鍵安裝** - 透過簡單的指令快速設定開發環境
- 💻 **跨平台支援** - 支援 macOS、Linux 和 Windows
- 🔍 **智慧檢測** - 自動檢查已安裝的工具，避免重複安裝
- 🎯 **互動式設定** - 友善的互動介面，輕鬆完成設定
- ⚙️ **彈性配置** - 可選擇要安裝的工具和版本

## 安裝的工具

- **NVM** - Node Version Manager
- **Node.js** - JavaScript 執行環境（透過 NVM 安裝，支援 LTS 或自訂版本）
- **Git** - 版本控制系統（含使用者設定）
- **AI CLI 工具**（多選）：
  - **GitHub Copilot CLI** - GitHub 的 AI 程式輔助工具（預設安裝）
  - **Claude Code CLI** - Anthropic Claude 的終端機介面
  - **Gemini CLI** - Google Gemini 的終端機介面（預設安裝）
  - **OpenAI Codex CLI** - OpenAI 的程式輔助工具
- **UV** - 快速的 Python 套件管理器（自動管理 Python 版本）
- **Spec Kit** - GitHub 的規格驅動開發工具（Specify CLI）
- **VSCode** - 強大的程式碼編輯器（可選）

## 使用方式

### 快速開始

使用 `npx` 直接執行（不需要安裝）：

```bash
npx prespec
```

### 安裝流程

執行後，程式會：

1. **檢測階段** - 顯示目前已安裝的工具狀態
2. **確認安裝** - 詢問是否繼續安裝流程
3. **互動式安裝** - 依序安裝各項工具：
   - 詢問是否安裝 NVM
   - 選擇 Node.js 版本（LTS 或自訂）
   - 設定 Git 使用者資訊
   - 多選 AI CLI 工具（預設選中 Copilot 和 Gemini）
   - 安裝 UV 和 Spec Kit（UV 安裝後立即可用，無需重開終端機）
   - 詢問是否安裝 VSCode
4. **完成提示** - 顯示安裝結果和後續步驟，包含詳細的使用說明

## 系統需求

- **作業系統**：macOS、Linux 或 Windows
- **Node.js**：18.0.0 或更高版本（用於執行安裝程式）
- **網路連線**：需要網路來下載工具

## 平台特定說明

### macOS / Linux

所有工具都可以自動安裝，無需額外設定。

### Windows

- **PowerShell**：建議使用 PowerShell 7（pwsh），會自動檢測並提示升級
- **NVM**：會自動下載並安裝 nvm-windows
- **其他工具**：可自動安裝
- **VSCode**：可自動下載並安裝（需使用者同意）

**提示**：
- 如果 PowerShell 安裝時間過長，可能需要以系統管理員身份執行終端機
- 如果安裝完 PowerShell 7 後仍顯示未安裝，請用 `pwsh` 指令重新開啟終端機

### WSL (Windows Subsystem for Linux)

與 Linux 相同，所有工具都可以自動安裝。

## 安裝後設定

### 重新載入 Shell

如果安裝了 NVM，需要重新載入 shell 或重新開啟終端機：

```bash
# bash/zsh
source ~/.nvm/nvm.sh

# 或直接重新開啟終端機
```

### AI CLI 工具使用

#### GitHub Copilot CLI

1. **啟動**：
   ```bash
   copilot
   ```

2. **首次使用**：
   ```bash
   /login  # 登入 GitHub
   /model  # 選擇模型（建議選 Haiku，更快速且省 token）
   ```

3. **常用指令**：`/help` `/new` `/clear` `/exit`

**系統需求**：Node.js v22+、npm v10+、有效的 GitHub Copilot 訂閱

#### Claude Code CLI

```bash
claude  # 啟動後依照指示登入 Anthropic 帳號
```

#### Gemini CLI

```bash
gemini  # 啟動後依照指示用 Google 帳號認證
```

#### OpenAI Codex CLI

```bash
codex  # 啟動後依照指示登入 ChatGPT 帳號
```

### Spec Kit 使用

1. **初始化專案**：
   ```bash
   specify init <project-name>  # 建立新專案
   specify init . --here        # 在當前目錄初始化
   ```

2. **在 AI 助手中依序使用**：
   - `/speckit.constitution` - 建立專案治理原則
   - `/speckit.specify` - 定義需求和使用者故事
   - `/speckit.plan` - 建立技術實作計劃
   - `/speckit.tasks` - 產生可執行任務清單
   - `/speckit.implement` - 執行所有任務完成開發

更多資訊請參考：[Spec Kit 文件](https://github.com/github/spec-kit)

### 驗證安裝

檢查各工具是否正確安裝：

```bash
node --version
git --version
copilot --version  # 或 claude, gemini, codex（視安裝的工具而定）
uv --version
specify --version
code --version  # 如果安裝了 VSCode
```

## 常見問題

### Q: 我已經有 Node.js 了，還需要安裝 NVM 嗎？

A: 不一定。程式會詢問您是否要安裝 NVM。如果您只需要一個 Node.js 版本，可以跳過 NVM 安裝。

### Q: 安裝失敗怎麼辦？

A: 程式會顯示錯誤訊息和手動安裝的指令。您可以按照提示手動安裝失敗的工具。

### Q: 可以只安裝特定工具嗎？

A: 可以！程式會檢查已安裝的工具並自動跳過。AI CLI 工具支援多選，您可以選擇要安裝的工具。

### Q: Windows 上 PowerShell 顯示未安裝但實際已安裝？

A: 請用 `pwsh` 指令重新開啟終端機。PowerShell 7 安裝後需要用 `pwsh` 來啟動，而非舊的 `powershell` 指令。

### Q: UV 安裝後需要重開終端機嗎？

A: 不需要！程式會自動更新當前 session 的 PATH，安裝完 UV 後可以立即繼續安裝 Spec Kit。

## 開發

### 本地測試

```bash
# 安裝相依套件
npm install

# 執行程式
npm start
```

### 專案結構

```
prespec/
├── bin/
│   └── cli.js          # CLI 入口點
├── src/
│   ├── index.js           # 主程式邏輯
│   ├── utils/
│   │   ├── platform.js    # 平台檢測工具
│   │   ├── check.js       # 工具檢查功能
│   │   └── prompt.js      # 使用者互動介面
│   └── installers/
│       ├── nvm.js         # NVM 安裝器
│       ├── git.js         # Git 配置器
│       ├── powershell.js  # PowerShell 升級器
│       ├── copilot.js     # GitHub Copilot CLI 安裝器
│       ├── claude-code.js # Claude Code CLI 安裝器
│       ├── gemini-cli.js  # Gemini CLI 安裝器
│       ├── codex-cli.js   # OpenAI Codex CLI 安裝器
│       ├── uv.js          # UV 安裝器
│       ├── speckit.js     # Spec Kit 安裝器
│       └── vscode.js      # VSCode 安裝器
└── package.json
```

## 授權

MIT License

## 相關連結

- [NVM](https://github.com/nvm-sh/nvm)
- [nvm-windows](https://github.com/coreybutler/nvm-windows)
- [PowerShell 7](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows)
- [GitHub Copilot CLI](https://github.com/github/copilot-cli)
- [Claude Code CLI](https://www.npmjs.com/package/@anthropic-ai/claude-code)
- [Gemini CLI](https://www.npmjs.com/package/@google/generative-ai-cli)
- [OpenAI Codex CLI](https://www.npmjs.com/package/openai-codex-cli)
- [UV](https://docs.astral.sh/uv/)
- [Spec Kit](https://github.com/github/spec-kit)
- [VSCode](https://code.visualstudio.com/)

---

享受您的開發環境！🚀

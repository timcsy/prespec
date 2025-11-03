# Prespec

> 跨平台 Spec Kit / GitHub Copilot CLI 開發環境快速安裝工具

一鍵安裝常用的開發工具，包括 Node.js、Git、GitHub Copilot CLI、UV 和 Spec Kit。

## 功能特色

- 🚀 **一鍵安裝** - 透過簡單的指令快速設定開發環境
- 💻 **跨平台支援** - 支援 macOS、Linux 和 Windows
- 🔍 **智慧檢測** - 自動檢查已安裝的工具，避免重複安裝
- 🎯 **互動式設定** - 友善的互動介面，輕鬆完成設定
- ⚙️ **彈性配置** - 可選擇要安裝的工具和版本

## 安裝的工具

- **NVM** - Node Version Manager（可選）
- **Node.js** - JavaScript 執行環境（透過 NVM 安裝，支援 LTS 或自訂版本）
- **Git** - 版本控制系統（含使用者設定）
- **GitHub Copilot CLI** - AI 程式設計助手命令列工具
- **UV** - 快速的 Python 套件管理器（自動管理 Python 版本）
- **Spec Kit** - GitHub 的規格驅動開發工具（Specify CLI）

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
   - 安裝 GitHub Copilot CLI 並顯示設定說明
   - 安裝 UV 和 Spec Kit
4. **完成提示** - 顯示安裝結果和後續步驟

## 系統需求

- **作業系統**：macOS、Linux 或 Windows
- **Node.js**：18.0.0 或更高版本（用於執行安裝程式）
- **網路連線**：需要網路來下載工具

## 平台特定說明

### macOS / Linux

所有工具都可以自動安裝，無需額外設定。

### Windows

- **NVM**：需要手動下載並安裝 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
- **其他工具**：可自動安裝

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

### GitHub Copilot CLI 使用

GitHub Copilot CLI 的使用方式：

1. **啟動 Copilot CLI**：
   ```bash
   copilot
   ```

2. **首次使用需要登入**：
   ```bash
   /login
   ```

3. **基本使用**：直接用自然語言描述您的需求，Copilot 會協助編碼、除錯和理解程式碼

4. **其他指令**：
   ```bash
   /model <模型名稱>  # 切換 AI 模型（預設為 Claude Sonnet 4.5）
   /feedback          # 提交意見回饋
   ```

**系統需求**：Node.js v22+、npm v10+、有效的 GitHub Copilot 訂閱

### 驗證安裝

檢查各工具是否正確安裝：

```bash
node --version
git --version
copilot --version
uv --version
specify --version
```

## 常見問題

### Q: 我已經有 Node.js 了，還需要安裝 NVM 嗎？

A: 不一定。程式會詢問您是否要安裝 NVM。如果您只需要一個 Node.js 版本，可以跳過 NVM 安裝。

### Q: 安裝失敗怎麼辦？

A: 程式會顯示錯誤訊息和手動安裝的指令。您可以按照提示手動安裝失敗的工具。

### Q: 可以只安裝特定工具嗎？

A: 目前版本會檢查已安裝的工具並自動跳過。未來版本會支援選擇性安裝。

### Q: Windows 上 NVM 無法自動安裝？

A: 是的，Windows 需要使用 nvm-windows，這需要手動下載並執行安裝程式。程式會提供下載連結。

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
│   ├── index.js        # 主程式邏輯
│   ├── utils/
│   │   ├── platform.js # 平台檢測工具
│   │   ├── check.js    # 工具檢查功能
│   │   └── prompt.js   # 使用者互動介面
│   └── installers/
│       ├── nvm.js      # NVM 安裝器
│       ├── git.js      # Git 配置器
│       ├── copilot.js  # GitHub Copilot CLI 安裝器
│       ├── uv.js       # UV 安裝器
│       └── speckit.js  # Spec Kit 安裝器
└── package.json
```

## 授權

MIT License

## 相關連結

- [NVM](https://github.com/nvm-sh/nvm)
- [nvm-windows](https://github.com/coreybutler/nvm-windows)
- [GitHub Copilot CLI](https://github.com/github/copilot-cli)
- [UV](https://docs.astral.sh/uv/)
- [Spec Kit](https://github.com/github/spec-kit)

---

享受您的開發環境！🚀

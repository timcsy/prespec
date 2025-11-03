# AGENTS.md

> 本文件記錄 Prespec 專案的開發過程、設計決策和架構說明，方便未來的開發者（包括 AI agents）理解專案脈絡。

## 專案概述

**Prespec** 是一個跨平台的開發環境快速安裝工具，設計目的是讓開發者能夠透過單一指令快速設定常用的開發工具。

### 專案目標

- 簡化開發環境設定流程
- 支援跨平台（macOS、Linux、Windows）
- 提供互動式的使用者體驗
- 智慧檢測已安裝的工具，避免重複安裝

## 安裝的工具清單

1. **NVM** (Node Version Manager) - 可選安裝
2. **Node.js** - 透過 NVM 安裝，支援 LTS 或自訂版本
3. **Git** - 包含使用者資訊設定
4. **GitHub Copilot CLI** (`@github/copilot`) - AI 程式設計助手
5. **UV** - Python 套件管理器（會自動管理 Python）
6. **Spec Kit** - GitHub 的規格撰寫工具

## 專案架構

```
prespec/
├── bin/
│   └── cli.js              # CLI 入口點，執行主程式
├── src/
│   ├── index.js            # 主程式邏輯，控制整體安裝流程
│   ├── utils/              # 工具函式
│   │   ├── platform.js     # 平台檢測（macOS/Linux/Windows/WSL）
│   │   ├── check.js        # 檢查工具是否已安裝
│   │   └── prompt.js       # 使用者互動介面（inquirer）
│   └── installers/         # 各工具的安裝器
│       ├── nvm.js          # NVM 和 Node.js 安裝
│       ├── git.js          # Git 配置
│       ├── copilot.js      # GitHub Copilot CLI 安裝
│       ├── uv.js           # UV 安裝
│       └── speckit.js      # Spec Kit 安裝
├── package.json            # npm 套件設定
├── README.md               # 使用者文件
├── LICENSE                 # MIT 授權
└── AGENTS.md               # 本文件
```

### 核心模組說明

#### 1. `src/index.js` - 主程式流程

主程式負責協調整個安裝流程：

```javascript
1. 顯示歡迎訊息
2. 檢查所有工具的安裝狀態
3. 顯示檢查結果
4. 詢問使用者是否繼續
5. 依序執行安裝流程：
   - NVM（詢問是否安裝）
   - Node.js（選擇版本）
   - Git（設定使用者資訊）
   - GitHub Copilot CLI
   - UV
   - Spec Kit
6. 顯示完成訊息和後續步驟
```

#### 2. `src/utils/platform.js` - 平台檢測

提供跨平台支援的核心工具：

- `getPlatform()` - 偵測作業系統（macOS/Linux/Windows/WSL）
- `getShellType()` - 偵測 Shell 類型（bash/zsh/fish/PowerShell）
- `getShellConfigPath()` - 取得 Shell 設定檔路徑
- `isUnixLike()` / `isWindows()` - 平台判斷輔助函式

#### 3. `src/utils/check.js` - 工具檢查

檢查各工具的安裝狀態：

- `checkNvm()` - 檢查 NVM 是否安裝及版本
- `checkNode()` - 檢查 Node.js 是否安裝及版本
- `checkGit()` - 檢查 Git 是否安裝及是否已設定使用者資訊
- `checkCopilot()` - 檢查 GitHub Copilot CLI
- `checkUv()` - 檢查 UV
- `checkSpecKit()` - 檢查 Spec Kit
- `checkAllTools()` - 一次檢查所有工具

#### 4. `src/utils/prompt.js` - 使用者互動

使用 `inquirer` 提供互動式介面：

- `askToContinue()` - 詢問是否繼續安裝
- `askToInstallNvm()` - 詢問是否安裝 NVM
- `askNodeVersion()` - 選擇 Node.js 版本（LTS 或自訂）
- `askGitUserInfo()` - 輸入 Git 使用者名稱和 email
- `displayCheckResults()` - 美化顯示檢查結果

#### 5. `src/installers/*` - 安裝器模組

每個安裝器負責特定工具的安裝：

- **nvm.js**：
  - Windows 提示手動安裝 nvm-windows
  - Unix-like 系統使用官方安裝腳本
  - 透過 NVM 安裝 Node.js（支援 LTS 和指定版本）

- **git.js**：
  - 設定 Git 全域使用者名稱和 email
  - 檢查 Git 是否已安裝

- **copilot.js**：
  - 使用 `npm install -g @github/copilot` 安裝
  - 安裝後顯示詳細使用說明
  - 建議使用 Claude Haiku 4.5 模型

- **uv.js**：
  - Windows 使用 PowerShell 安裝腳本
  - Unix-like 使用 curl 安裝腳本
  - UV 會自動管理 Python 版本

- **speckit.js**：
  - Windows 使用 PowerShell 安裝腳本
  - Unix-like 使用 bash 安裝腳本

## 設計決策

### 1. 為什麼使用 Node.js 開發？

**決策**：使用 Node.js（而非 Shell Script 或 Go）

**原因**：
- 跨平台支援良好
- 豐富的 npm 生態系統（inquirer, chalk, execa 等）
- 開發和維護容易
- 可透過 `npx` 直接執行，無需預先安裝

**考量**：可能與 NVM 衝突
- 解決方案：詢問使用者是否安裝 NVM
- 使用者可選擇跳過 NVM 安裝

### 2. 為什麼採用互動式安裝？

**決策**：採用「混合模式」- 先顯示狀態，再詢問是否繼續

**原因**：
- 讓使用者了解目前環境狀態
- 避免重複安裝已有的工具
- 給予使用者選擇的彈性（如是否安裝 NVM）
- 提升使用者體驗

### 3. 為什麼建議使用 Claude Haiku 4.5？

**決策**：在 GitHub Copilot CLI 安裝說明中建議使用 `claude-haiku-4.5`

**原因**：
- 快速且經濟
- 適合命令列的快速互動
- 使用者明確要求

### 4. 平台支援策略

**決策**：完整支援 macOS、Linux、Windows（含 WSL）

**實作方式**：
- 使用 `platform.js` 統一處理平台差異
- Windows 特殊處理：NVM 需手動安裝（nvm-windows）
- 其他工具盡可能自動化

## 技術堆疊

### 核心依賴

- **chalk** (^5.3.0) - 終端機文字顏色和樣式
- **execa** (^8.0.1) - 執行 shell 指令
- **inquirer** (^9.2.12) - 互動式命令列介面
- **ora** (^8.0.1) - 終端機載入動畫

### Node.js 版本要求

- **最低版本**：18.0.0
- **原因**：使用 ES Modules (`type: "module"`) 和現代 JavaScript 功能

## 開發流程

### 初次開發（2025-11-03）

1. **需求收集**：透過問答方式確認功能需求
2. **架構設計**：建立模組化架構
3. **實作順序**：
   - 建立專案結構和 package.json
   - 實作平台檢測工具
   - 實作工具檢查功能
   - 實作使用者互動介面
   - 依序實作各安裝器
   - 整合主程式邏輯
   - 撰寫文件

### 未來開發建議

#### 可能的改進方向

1. **選擇性安裝**
   - 目前：自動安裝所有未安裝的工具
   - 改進：讓使用者勾選想安裝的工具

2. **設定檔支援**
   - 支援 `.prespecrc` 設定檔
   - 預設安裝選項、版本等

3. **更新功能**
   - 檢查已安裝工具是否有新版本
   - 提供更新選項

4. **卸載功能**
   - 提供卸載已安裝工具的功能

5. **更多工具支援**
   - Docker
   - Terraform
   - kubectl
   - 其他常用開發工具

6. **測試**
   - 新增單元測試
   - 新增整合測試
   - CI/CD 自動化測試

## 常見問題和解決方案

### Q1: Windows 上 NVM 無法自動安裝？

**原因**：Windows 使用 nvm-windows，需要圖形化安裝程式

**解決方案**：提供下載連結和手動安裝指引

### Q2: 如何處理安裝失敗？

**策略**：
- 每個安裝器都有錯誤處理
- 顯示錯誤訊息
- 提供備用安裝方法
- 不中斷整體流程，繼續下一個工具

### Q3: Shell 配置更新後需要重新載入？

**處理方式**：
- 安裝完成後提示使用者重新載入 Shell
- 提供具體指令（如 `source ~/.nvm/nvm.sh`）

## 相關資源

### 官方文件連結

- [NVM](https://github.com/nvm-sh/nvm)
- [nvm-windows](https://github.com/coreybutler/nvm-windows)
- [GitHub Copilot CLI](https://github.com/github/copilot-cli)
- [UV](https://docs.astral.sh/uv/)
- [Spec Kit](https://github.com/github/spec-kit)

### 使用的 npm 套件

- [chalk](https://www.npmjs.com/package/chalk)
- [execa](https://www.npmjs.com/package/execa)
- [inquirer](https://www.npmjs.com/package/inquirer)
- [ora](https://www.npmjs.com/package/ora)

## 貢獻指南

### 新增工具安裝器

如果要新增新的工具安裝器：

1. 在 `src/installers/` 建立新檔案（例如 `docker.js`）
2. 實作安裝函式並導出
3. 在 `src/utils/check.js` 新增檢查函式
4. 在 `src/index.js` 的主流程中加入安裝步驟
5. 更新 README.md 和本文件

### 程式碼風格

- 使用 ES Modules (`import`/`export`)
- 使用 async/await 處理非同步
- 函式加上 JSDoc 註解
- 錯誤處理使用 try-catch
- 使用 chalk 美化終端機輸出
- 使用 ora 顯示載入動畫

## 授權

MIT License - 詳見 [LICENSE](LICENSE) 文件

---

**最後更新**：2025-11-03
**維護者**：timcsy
**專案狀態**：Active Development

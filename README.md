# MCP Weather Server クイックスタート

Model Context Protocol (MCP) の天気サーバーのクイックスタート実装です。

## 概要

このプロジェクトは、MCP公式チュートリアルに従って作成された天気情報サーバーです。
National Weather Service (NWS) APIを使用して、米国内の天気予報とアラート情報を提供します。

## プロジェクト構成

```
quickstart_mcp_server/
├── README.md
├── .gitignore
└── weather/
    └── node/          # Node.js/TypeScript実装
        ├── src/
        ├── build/
        ├── package.json
        └── tsconfig.json
```

将来的に他の言語実装（Python、Javaなど）を追加できるように、言語ごとにフォルダを分けています。

## 機能

このサーバーは以下の2つのツールを提供します：

### 1. getAlerts
米国の州ごとの天気アラートを取得します。

**パラメータ:**
- `state`: 2文字の州コード（例: CA, NY, TX）

### 2. getForecast
緯度・経度で指定された場所の天気予報を取得します。

**パラメータ:**
- `latitude`: 緯度（-90 から 90）
- `longitude`: 経度（-180 から 180）

## セットアップ (Node.js版)

### 前提条件

- Node.js（バージョン16以上）
- npm

### インストール

```bash
cd weather/node
npm install
```

### ビルド

```bash
npm run build
```

## Claude for Desktop での使用方法

1. Claude for Desktopの設定ファイルを開きます：

```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

2. 以下の設定を追加します：

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/絶対パス/quickstart_mcp_server/weather/node/build/index.js"]
    }
  }
}
```

3. Claude for Desktopを再起動します。

## 使用例

Claude for Desktopで以下のような質問ができます：

- サクラメントの天気はどうですか？
- テキサス州のアクティブな天気アラートは何ですか？
- 北緯38度、西経121度の天気予報を教えてください

## 技術スタック

- TypeScript
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- Zod（スキーマバリデーション）
- National Weather Service API

## 参考資料

- [MCP公式ドキュメント](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [National Weather Service API](https://www.weather.gov/documentation/services-web-api)

## ライセンス

ISC
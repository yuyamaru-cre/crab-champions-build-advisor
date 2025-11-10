# 🦀 Crab Champions Build Advisor

Crab Championsの武器とアップグレードの最適な組み合わせを提案するWebアプリです。

## 🌟 機能

### 4つのモード

1. **📋 ガイド付きモード** - 固定された優先順位に従った提案（初心者向け）
2. **🔗 シナジーベースモード** - 取得済みアップグレードとシナジーがあるものを動的に提案
3. **🎯 選択肢評価モード** - 今出ている選択肢を入力して最適なものを判定
4. **🎨 ビルドアーキタイプモード** - 6種のアーキタイプから選択してビルドを構築

### 主な特徴

- 18種の武器データ
- 108種のパーク、89種の武器モッド、44種のアビリティモッド
- シナジーマップによる動的な推奨
- アンチシナジー警告
- 取得済みアップグレード管理

## 🚀 デプロイ方法

### GitHub Pagesへのデプロイ

1. **リポジトリを作成**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/crab-champions-build-advisor.git
   git push -u origin main
   ```

2. **GitHub Pagesを有効化**
   - GitHubリポジトリの Settings → Pages
   - Source: "GitHub Actions" を選択

3. **自動デプロイ**
   - mainブランチにpushすると自動的にビルド＆デプロイされます
   - デプロイ後、`https://YOUR_USERNAME.github.io/crab-champions-build-advisor/` でアクセス可能

### ⚠️ 重要：リポジトリ名の変更

`vite.config.js` の `base` を実際のリポジトリ名に変更してください：

```javascript
export default defineConfig({
  base: '/YOUR_REPOSITORY_NAME/', // ここを変更
  // ...
})
```

## 💻 ローカル開発

### 前提条件

- Node.js 18以上
- npm

### セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## 📊 データソース

このアプリは以下の信頼できる情報源からのデータに基づいています：

- [公式 Crab Champions Wiki (wiki.gg)](https://crabchampions.wiki.gg/)
- コミュニティ検証済みビルドガイド
- ゲームメカニズムの詳細な分析

## 🤝 貢献

プルリクエストを歓迎します！

1. このリポジトリをフォーク
2. feature ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを開く

## 📝 ライセンス

MIT License

## 🙏 謝辞

- Crab Champions開発者 Noisestorm様
- コミュニティWiki貢献者の皆様
- ビルドガイド作成者の皆様

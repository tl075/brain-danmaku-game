# 公開手順書 (GitHub Pages)

このゲームをインターネット上で公開し、誰でも遊べるようにする手順です。

## 1. GitHubリポジトリの作成
1. [GitHub](https://github.com/new) にログインし、新しいリポジトリを作成します。
2. **Repository name** に `brain-danmaku-game` など適当な名前を入力します。
3. **Public** (公開) を選択します。
4. "Create repository" をクリックします。

## 2. コードのアップロード
VSCodeのターミナルを開き (`Ctrl+Shift+\``)、以下のコマンドを順番に入力してください。

```bash
# 1. ユーザー情報の設定（もし設定していない場合）
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 2. データの準備
git init
git add .
git commit -m "First commit: Game release"

# 3. GitHubへアップロード (URLは作成したリポジトリのものに置き換えてください)
git branch -M main
git remote add origin https://github.com/ユーザー名/リポジトリ名.git
git push -u origin main
```

## 3. Web公開設定 (GitHub Pages)
1. GitHubのリポジトリページで **Settings** (設定) タブをクリックします。
2. 左メニューの **Pages** をクリックします。
3. **Build and deployment** の **Source** 下にある **Branch** を `main` に設定し、フォルダは `/(root)` のまま **Save** を押します。
4. 数分待つと、ページ上部に公開URL（例: `https://ユーザー名.github.io/リポジトリ名/`）が表示されます。

このURLを友達に教えれば、PCやスマホのブラウザでゲームを遊んでもらうことができます！
※BGM機能は、相手が自分のPC内の音楽フォルダを選択する必要があります。

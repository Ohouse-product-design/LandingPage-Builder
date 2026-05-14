#!/usr/bin/env bash
# ============================================================================
# install.sh — macOS 환경에서 Node.js + @google/clasp 를 설치하고 clasp login 까지.
#
# 사용법:
#   $ cd ~/Documents/Claude/Projects/LandingPage-Builder/apps-script
#   $ bash install.sh
#
# 이미 설치되어 있는 도구는 건너뜁니다.
# ============================================================================
set -euo pipefail

cyan()  { printf "\033[36m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }

cyan "▶ macOS Apps Script 배포 환경 설치"

# ----- 1. Homebrew -----
if command -v brew >/dev/null 2>&1; then
  green "✓ Homebrew already installed ($(brew --version | head -n1))"
else
  yellow "→ Homebrew 가 없습니다. 설치합니다 (시스템 비밀번호가 필요할 수 있어요)..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Apple Silicon 의 경우 PATH 등록
  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  fi
fi

# ----- 2. Node.js -----
if command -v node >/dev/null 2>&1; then
  green "✓ Node.js 이미 설치됨 ($(node -v))"
else
  yellow "→ Node.js 설치 (Homebrew)..."
  brew install node
fi

# ----- 3. npm (Node 와 함께 설치되지만 확인) -----
if ! command -v npm >/dev/null 2>&1; then
  red "✗ npm 을 찾을 수 없습니다. brew install node 가 정상 종료됐는지 확인하세요."
  exit 1
fi
green "✓ npm $(npm -v)"

# ----- 4. clasp -----
if command -v clasp >/dev/null 2>&1; then
  green "✓ clasp 이미 설치됨 ($(clasp --version 2>/dev/null || echo 'v?'))"
else
  yellow "→ @google/clasp 글로벌 설치..."
  npm install -g @google/clasp
fi

# ----- 5. clasp login (이미 로그인되어 있으면 스킵) -----
if clasp logout --help >/dev/null 2>&1 && clasp list >/dev/null 2>&1; then
  green "✓ clasp 이미 로그인 상태"
else
  cyan "▶ clasp login — 브라우저가 열리면 Google 계정으로 로그인하세요"
  clasp login
fi

green ""
green "✅ 모든 설치 완료!"
echo ""
echo "다음 단계:"
echo "  cd $(pwd)"
echo "  clasp create --type webapp --title 'LandingPage Publisher' --rootDir ./"
echo "  clasp push"
echo "  clasp deploy"
echo ""
echo "이미 scriptId 가 있다면 .clasp.json 의 scriptId 만 채우고 'clasp push' 하면 됩니다."

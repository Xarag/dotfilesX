#!/usr/bin/env bash

set -xe

paru -S --needed \
  asciinema \
  bat \
  fennel \
  clojure \
  leiningen \
  babashka \
  rlwrap \
  cowsay \
  difftastic \
  entr \
  fd \
  sd  \
  fish \
  fisher \
  zoxide \
  flatpak \
  fzf \
  btop \
  httpie \
  jq \
  yq \
  less \
  man \
  neovim \
  tree-sitter \
  tree-sitter-cli \
  imagemagick \
  nodejs \
  npm \
  obsidian \
  ripgrep \
  rsync \
  rustup \
  topgrade-bin \
  tree \
  ttf-font-awesome \
  noto-fonts-emoji \
  noto-fonts-cjk \
  adobe-source-han-sans-kr-fonts \
  ttf-dejavu-emojiless \
  ttf-fira-code \
  ttf-firacode-nerd \
  wl-clipboard \
  wev \
  sway \
  swaylock \
  swayidle \
  swaybg \
  waybar \
  xdg-desktop-portal-wlr \
  ghostty \
  pavucontrol \
  wofi \
  mako \
  network-manager-applet \
  brightnessctl \
  volumectl \
  grim \
  slurp \
  playerctl \
  lxsession \
  dolphin \
  usage-bin \
  mise-bin \
  hiddify-git \
  prismlauncher-git \
  lxqt-openssh-askpass

xdg-settings set default-web-browser chromium

rustup default stable

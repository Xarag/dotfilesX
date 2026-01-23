#!/usr/bin/env bash

set -xe

if ! command -v yay &>/dev/null; then
	# sudo pacman -S --needed git base-devel && git clone https://aur.archlinux.org/paru.git && cd paru && makepkg -si && cd .. && rm -rf ./paru
	sudo pacman -S --needed git base-devel && git clone https://aur.archlinux.org/paru.git && cd paru-git && makepkg -si && cd .. && rm -rf ./paru-git
fi

paru -S --needed stow git

./script/stow.sh
./script/install-packages.sh

chsh -s "$(which fish)"

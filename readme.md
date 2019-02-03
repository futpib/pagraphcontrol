# PulseAudio Graph Control
[
![Build Status](https://travis-ci.org/futpib/pagraphcontrol.svg?branch=master)](https://travis-ci.org/futpib/pagraphcontrol)

## Screenshot

![](https://i.imgur.com/rq4UJb2.png)

## Keyboard Shortcuts

| Key           | Mnemonic       | Description           |
| ------------- | -------------- | --------------------- |
| hjkl ←↓↑→     | vim-like       | Selecting objects     |
| space         |                | Toggle mute (also try with control and/or shift) |
| 90 /*         | mpv-like       | Volume up/down        |
| cnpg          | Cards, Network, Preferences, Graph | Switch between panels |
| f             | Pay respects   | Set sink/source as default |
| m             | Move           | Move selected object  |
| a             | Add            | Load a module         |

## Install

### Arch

[pagraphcontrol-git on AUR](https://aur.archlinux.org/packages/pagraphcontrol-git)

```bash
yaourt pagraphcontrol-git
```

### Ubuntu (manual build) 

```bash
sudo apt install npm
sudo npm install -g yarn

git clone https://github.com/futpib/pagraphcontrol.git
cd pagraphcontrol

yarn install
yarn build
```

#### PulseAudio volume peaks (optional)
To see audio peaks build [papeaks](https://github.com/futpib/papeaks) and put it on your `PATH`.

## See Also

### Other PulseAudio Superpowers

* [pulseaudio-dlna](https://github.com/masmu/pulseaudio-dlna) - DLNA / UPNP / Chromecast - streams to most TVs and stuff
* [PulseEffects](https://github.com/wwmm/pulseeffects) - Equalizer and other audio effects

### PulseAudio Documentation

* [Modules](https://www.freedesktop.org/wiki/Software/PulseAudio/Documentation/User/Modules/)
* [Server (Connection) String Format](https://www.freedesktop.org/wiki/Software/PulseAudio/Documentation/User/ServerStrings/)

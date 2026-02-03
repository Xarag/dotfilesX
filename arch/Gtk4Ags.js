// ~/.config/ags/config.js

import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import Audio from 'resource:///com/github/Aylur/ags/service/audio.js';
import Applications from 'resource:///com/github/Aylur/ags/service/applications.js';
import SystemTray from 'resource:///com/github/Aylur/ags/service/systemtray.js';

// --- Helper Functions ---
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// --- Widgets ---

const Workspaces = () => Widget.Box({
    className: 'workspaces',
    setup: self => self.hook(Hyprland, () => {
        // Generate an array [1, 2, 3, ... , 10]
        const arr = Array.from({ length: 10 }, (_, i) => i + 1);
        self.children = arr.map(i => Widget.Button({
            onClicked: () => Utils.execAsync(`hyprctl dispatch workspace ${i}`),
            child: Widget.Label(`${i}`),
            className: Hyprland.active.workspace.id === i ? 'focused' : '',
        }));
    }),
});

const Clock = () => Widget.Label({
    className: 'clock',
    setup: self => self.poll(1000, () => {
        self.label = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }),
});

const SysTray = () => Widget.Box({
    className: 'systray',
    setup: self => self.hook(SystemTray, () => {
        self.children = SystemTray.items.map(item => Widget.Button({
            child: Widget.Icon().bind('icon', item, 'icon'),
            onPrimaryClick: (_, event) => item.activate(event),
            onSecondaryClick: (_, event) => item.openMenu(event),
            tooltipMarkup: item.bind('tooltip_markup'),
        }));
    }),
});

const Volume = () => Widget.Box({
    children: [
        Widget.Label({ className: 'audio-icon sys-icon', label: '' }),
        Widget.Label({
            setup: self => self.hook(Audio, () => {
                if (!Audio.speaker) return;
                self.label = `${Math.floor(Audio.speaker.volume * 100)}%`;
            }, 'speaker-changed'),
        }),
    ],
});

const CPU = () => Widget.Box({
    children: [
        Widget.Label({ className: 'cpu-icon sys-icon', label: '' }),
        Widget.Label({
            setup: self => self.poll(2000, label => {
                Utils.execAsync(`top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}'`)
                    .then(usage => label.label = `${Math.round(parseFloat(usage))}%`)
                    .catch(print);
            }),
        }),
    ],
});

const RAM = () => Widget.Box({
    children: [
        Widget.Label({ className: 'ram-icon sys-icon', label: '' }),
        Widget.Label({
            setup: self => self.poll(2000, label => {
                Utils.execAsync(`free -m | awk '/^Mem/ {print $3}'`)
                    .then(used => label.label = `${Math.round(used / 1024 * 10) / 10}G`)
                    .catch(print);
            }),
        }),
    ],
});

// --- Bar Layout ---

const Left = () => Widget.Box({
    className: 'left-bar',
    children: [Widget.Box({ className: 'bar-segment', children: [Workspaces()] })],
});

const Center = () => Widget.Box({
    className: 'center-bar',
    children: [Widget.Box({ className: 'bar-segment', children: [Clock()] })],
});

const Right = () => Widget.Box({
    className: 'right-bar',
    hpack: 'end',
    children: [Widget.Box({
        className: 'bar-segment',
        children: [CPU(), RAM(), Volume(), SysTray()],
        spacing: 15,
    })],
});

const Bar = (monitor = 0) => Widget.Window({
    name: `bar-${monitor}`,
    className: 'bar',
    monitor,
    anchor: ['top', 'left', 'right'],
    exclusive: true,
    child: Widget.CenterBox({
        startWidget: Left(),
        centerWidget: Center(),
        endWidget: Right(),
    }),
});

// --- App Launcher ---

const AppItem = app => Widget.Button({
    onClicked: () => {
        App.closeWindow('launcher');
        app.launch();
    },
    className: 'launcher-item',
    child: Widget.Box({
        children: [
            Widget.Icon({
                icon: app.icon_name,
                className: 'launcher-item-icon',
            }),
            Widget.Label({
                label: capitalize(app.name),
                className: 'launcher-item-name',
                xalign: 0,
                valign: 'center',
            }),
        ],
    }),
});

const AppLauncher = () => {
    const list = Widget.Box({ vertical: true });
    const entry = Widget.Entry({
        className: 'launcher-entry',
        placeholderText: 'Search...',
        onAccept: () => {
            const results = Applications.query(entry.text);
            if (results[0]) {
                App.closeWindow('launcher');
                results[0].launch();
            }
        },
        onChange: ({ text }) => {
            list.children = Applications.query(text).map(AppItem);
        },
    });

    return Widget.Window({
        name: 'launcher',
        className: 'app-launcher'

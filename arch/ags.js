// ~/.config/ags/config.js

const { App, Widget, Service, Utils } = ags;
const { Hyprland, Audio, Applications } = Service;

// --- Helper Functions ---
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// --- Widgets ---

const Workspaces = () => Widget.Box({
  className: 'workspaces',
  connections: [[Hyprland, box => {
    // Generate an array [1, 2, 3, ... , 10]
    const arr = Array.from({ length: 10 }, (_, i) => i + 1);
    box.children = arr.map(i => Widget.Button({
      onClicked: () => Utils.execAsync(`hyprctl dispatch workspace ${i}`),
      child: Widget.Label(`${i}`),
      className: Hyprland.active.workspace.id == i ? "focused" : "",
    }));
  }]],
});

const Clock = () => Widget.Label({
  className: 'clock',
  connections: [[1000, label => label.label = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })]],
});

const SysTray = () => Widget.Box({
    connections: [['system-tray', box => {
        box.children = Service.SystemTray.items.map(item => Widget.Button({
            child: Widget.Icon({ binds: [['icon', item, 'icon']] }),
            onPrimaryClick: (_, event) => item.activate(event),
            onSecondaryClick: (_, event) => item.openMenu(event),
            binds: [['tooltip-markup', item, 'tooltip-markup']],
        }));
    }]],
});

const Volume = () => Widget.Box({
  children: [
    Widget.Label({ className: 'audio-icon sys-icon', label: '' }),
    Widget.Label({
      connections: [[Audio, label => {
        if (!Audio.speaker) return;
        label.label = `${Math.floor(Audio.speaker.volume * 100)}%`;
      }, 'speaker-changed']],
    }),
  ],
});

const CPU = () => Widget.Box({
  children: [
    Widget.Label({ className: 'cpu-icon sys-icon', label: '' }),
    Widget.Label({
      connections: [[2000, label => {
        Utils.execAsync(`top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}'`)
          .then(usage => label.label = `${Math.round(parseFloat(usage))}%`)
          .catch(print);
      }]],
    }),
  ],
});

const RAM = () => Widget.Box({
  children: [
    Widget.Label({ className: 'ram-icon sys-icon', label: '' }),
    Widget.Label({
      connections: [[2000, label => {
        Utils.execAsync(`free -m | awk '/^Mem/ {print $3}'`)
          .then(used => label.label = `${Math.round(used / 1024 * 10) / 10}G`)
          .catch(print);
      }]],
    }),
  ],
});

// --- Bar Layout ---

const Left = () => Widget.Box({
  className: 'left-bar',
  children: [ Widget.Box({ className: 'bar-segment', children: [Workspaces()] }) ],
});

const Center = () => Widget.Box({
  className: 'center-bar',
  children: [ Widget.Box({ className: 'bar-segment', children: [Clock()] }) ],
});

const Right = () => Widget.Box({
  className: 'right-bar',
  hpack: 'end',
  children: [ Widget.Box({
    className: 'bar-segment',
    children: [ CPU(), RAM(), Volume(), SysTray() ],
    spacing: 15
  }) ],
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
        icon: app.iconName,
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
      if (Applications.query(entry.text)[0]) {
        App.closeWindow('launcher');
        Applications.query(entry.text)[0].launch();
      }
    },
    onChange: () => {
      list.children = Applications.query(entry.text).map(AppItem);
    },
  });

  return Widget.Window({
    name: 'launcher',
    className: 'app-launcher',
    popup: true,
    focusable: true,
    visible: false,
    child: Widget.Box({
      vertical: true,
      children: [entry, Widget.Scrollable({ hscroll: "never", child: list })],
      spacing: 12,
      css: 'padding: 12px;',
    }),
  });
};

// --- Exports ---
App.config({
  style: './style.css',
  windows: [
    Bar(),
    AppLauncher(),
  ],
  // Add a global function to toggle the launcher
  onConfigParsed: () => {
    globalThis.toggleLauncher = () => App.toggleWindow('launcher');
  }
});


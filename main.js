const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const fs = require('fs')
const csv = require('csv-parser')
const path = require('path');

  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let win

  function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
      width: 1024,
      height: 768,
      title: 'EIKit'
    })

    win.maximize();

    // and load the index.html of the app.
    win.loadFile('src/index.html')

    // Open the DevTools.
    // win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    })
  }

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
      createWindow()
      if (process.env.NODE_ENV !== 'production') {
        require('vue-devtools').install()
      }
  })

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.

  ipcMain.on("openOldEISelector", (event, params) => {

    var file_path = dialog.showOpenDialog({properties: ['openFile']})
    var filename = path.parse(file_path[0]).base

    event.sender.send("OldEITitleResponse", filename);

    if (file_path != undefined) {
        fs.createReadStream(file_path[0])
        .pipe(csv())
        .on('data', function (data) {
            event.sender.send("OldEIResponse", data)
        })
    }
  })

  ipcMain.on("showNewEISelector", (event, params) => {

    var file_path = dialog.showOpenDialog({properties: ['openFile']})
    var filename = path.parse(file_path[0]).base

    event.sender.send("NewEITitleResponse", filename);

    if (file_path != undefined) {
        fs.createReadStream(file_path[0])
        .pipe(csv())
        .on('data', function (data) {
            event.sender.send("NewEIResponse", data)
        })
    }
  })

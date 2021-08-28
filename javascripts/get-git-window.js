const { shell } = require('electron')

function openLink() {
  shell.openExternal('https://git-scm.com/downloads')
}
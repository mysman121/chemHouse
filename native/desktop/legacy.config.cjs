module.exports = {
  ...require('./package.json').build,
  electronVersion: '22.3.27',
  appId: 'com.chemhouse.study.legacy',
  productName: 'ChemHouse Legacy',
  artifactName: 'ChemHouse-1.1.0-windows-legacy-${arch}.${ext}',
  win: { target: ['nsis', 'portable'], icon: 'build/icon.ico' },
  nsis: { artifactName: 'ChemHouse-1.1.0-windows-legacy-${arch}-Setup.exe', oneClick: false, perMachine: false, allowToChangeInstallationDirectory: true, createDesktopShortcut: true },
  portable: { artifactName: 'ChemHouse-1.1.0-windows-legacy-${arch}-Portable.exe' }
};

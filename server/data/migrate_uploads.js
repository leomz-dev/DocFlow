const fs = require('fs');
const path = require('path');

const usersJsonPath = path.join(__dirname, 'users.json');
const uploadsPath = path.join(__dirname, 'uploads');
const usuariosPath = path.join(uploadsPath, 'usuarios');

if (!fs.existsSync(usuariosPath)) {
  fs.mkdirSync(usuariosPath);
}

const data = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));

data.users.forEach(user => {
  if (user.company) {
    let logoPath = user.company.logoPath;
    let signPath = user.company.signPath;

    const userFolder = path.join(usuariosPath, user.id);
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    if (logoPath && !logoPath.startsWith('usuarios/')) {
      const oldLogoPath = path.join(uploadsPath, logoPath);
      const newLogoPathRel = `usuarios/${user.id}/` + path.basename(logoPath);
      const newLogoPathAbs = path.join(uploadsPath, newLogoPathRel);
      if (fs.existsSync(oldLogoPath)) {
        fs.renameSync(oldLogoPath, newLogoPathAbs);
      }
      user.company.logoPath = newLogoPathRel;
    }

    if (signPath && !signPath.startsWith('usuarios/')) {
      const oldSignPath = path.join(uploadsPath, signPath);
      const newSignPathRel = `usuarios/${user.id}/` + path.basename(signPath);
      const newSignPathAbs = path.join(uploadsPath, newSignPathRel);
      if (fs.existsSync(oldSignPath)) {
        fs.renameSync(oldSignPath, newSignPathAbs);
      }
      user.company.signPath = newSignPathRel;
    }
  }
});

fs.writeFileSync(usersJsonPath, JSON.stringify(data, null, 2));
console.log('Migration completed successfully.');

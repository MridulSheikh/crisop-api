import path from "path"
import fs from "fs"

function printDirectoryTree(dirPath, prefix = '') {
  if (!fs.existsSync(dirPath)) {
    console.log('Directory does not exist:', dirPath);
    return;
  }

  const items = fs.readdirSync(dirPath);

  items.forEach((item, index) => {
    if (item === 'node_modules') return; // Skip node_modules

    const fullPath = path.join(dirPath, item);
    const isLast = index === items.length - 1;
    const pointer = isLast ? '└── ' : '├── ';

    console.log(prefix + pointer + item);

    if (fs.lstatSync(fullPath).isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      printDirectoryTree(fullPath, newPrefix);
    }
  });
}

printDirectoryTree('.');


var fs = require('fs');

function fix() {
    console.log("Copy redux fix file");
  fs.writeFileSync("./node_modules/redux/index.d.ts", fs.readFileSync("./scripts/redux-missing-symbol-observable-fix-file/index.d.ts"));
};

fix();
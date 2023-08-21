import fs from 'fs-extra';
import { sync as globSync } from 'glob';
import { minify } from 'terser';

globSync('./dist/**/*.js').forEach(async (file) => {
  const mini = await minify(fs.readFileSync(file, 'utf8'), {
    module: true,
    format: {
      preamble: `/* His name was Bruce McNair. Copyright ${new Date().getFullYear()} City of Vernonia, Oregon. */`,
    },
  });

  if (mini.error) {
    console(mini.error);
    return;
  }

  fs.writeFileSync(file, mini.code, 'utf8');
});

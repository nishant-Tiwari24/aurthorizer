import axios from "axios";
import cliSelect from "cli-select";
import simpleGit from "simple-git";
import fs from "fs-extra";
import path from "path";
import kleur from "kleur";
import figlet from "figlet";

interface Repository {
  name: string;
  clone_url: string;
}

const printBanner = () => {
  console.log(
    kleur.red(
      figlet.textSync("GitHub Repo Authorizer", {
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
};

const githubRepositories = async (username: string): Promise<Repository[]> => {
  try {
    const { data } = await axios.get(`https://api.github.com/users/${username}/repos`);
    return data;
  } catch (error) {
    console.error(kleur.red("Error fetching repositories"), error);
    return [];
  }
};

const cloneAndParseRepo = async (username: string): Promise<string | null> => {
  printBanner();

  const repos = await githubRepositories(username);

  if (repos.length === 0) {
    console.log(kleur.yellow("No repositories found."));
    return null;
  }

  const repoNames = repos.map((repo) => repo.name);

  return new Promise((resolve, reject) => {
    console.log(kleur.green("Select a repository:"));
    cliSelect({
      values: repoNames,
      selected: kleur.green().bold("✔"),
    }).then(async ({ value }) => {
      const selectedRepo = repos.find((repo) => repo.name === value);
      if (selectedRepo) {
        console.log(kleur.green(`You selected: ${value}`));
        const repoUrl = selectedRepo.clone_url;
        console.log(kleur.blue(`Cloning ${value} from ${repoUrl}`));

        const git = simpleGit();
        try {
          await git.clone(repoUrl);
          console.log(kleur.green(`Repository ${value} cloned successfully.`));

          const repoPath = path.join(`${process.cwd()}`, value);
          const outputPath = path.join(`${process.cwd()}/output-directory`, 'file.txt');
          await fs.ensureFile(outputPath);
          let combinedCode = '';

          const readFilesRecursively = async (dir: string) => {
            const files = await fs.readdir(dir);
            for (const file of files) {
              const filePath = path.join(dir, file);
              const stat = await fs.stat(filePath);
              if (stat.isDirectory()) {
                if (['.git', 'node_modules', '.json', 'Library', 'bin', 'obj', 'packages', 'dist', 'build', 'coverage', 'output-directory', '.vscode', '.idea', 'out', 'temp', 'tmp', 'logs', 'log', 'public', 'src/assets', 'images'].includes(file)) {
                  continue;
                }
                await readFilesRecursively(filePath);
              } else {
                if (file.endsWith('.sample') || file.endsWith('.md') || file === 'LICENSE' || file === '.gitattributes' || file === '.gitignore' || file === 'README.md' || file === 'CONTRIBUTING.md' || file === 'CODE_OF_CONDUCT.md' || file === '.DS_Store' || file.endsWith('.json') || file.endsWith('.ico') || file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
                  continue;
                }
                const fileContent = await fs.readFile(filePath, 'utf-8');
                combinedCode += `\n// File: ${filePath}\n\n${fileContent}\n`;
              }
            }
          };

          await readFilesRecursively(repoPath);
          await fs.writeFile(outputPath, combinedCode);
          console.log(kleur.green(`Combined code written to ${outputPath}`));

          resolve(combinedCode);
        } catch (error) {
          console.error(kleur.red(`Error cloning repository ${value}`), error);
          reject(error);
        }
      }
    }).catch(() => {
      console.log(kleur.yellow('No repository selected'));
      reject('No repository selected');
    });
  });
};

export default cloneAndParseRepo;

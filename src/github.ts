import axios from "axios";
import cliSelect from "cli-select";
import simpleGit from "simple-git";
import fs from "fs-extra";
import path from "path";

interface Repository {
  name: string;
  clone_url: string;
}

const githubRepositories = async (username: string): Promise<Repository[]> => {
  try {
    const { data } = await axios.get(`https://api.github.com/users/${username}/repos`);
    return data;
  } catch (error) {
    console.error("Error fetching repositories", error);
    return [];
  }
};

const cloneAndParseRepo = async (username: string): Promise<string | null> => {
  const repos = await githubRepositories(username);

  if (repos.length === 0) {
    console.log("No repositories found.");
    return null;
  }

  const repoNames = repos.map((repo) => repo.name);

  return new Promise((resolve, reject) => {
    console.log("Select a repository:");
    cliSelect({
      values: repoNames
    }).then(async ({ value }) => {
      const selectedRepo = repos.find((repo) => repo.name === value);
      if (selectedRepo) {
        console.log(`You selected: ${value}`);
        const repoUrl = selectedRepo.clone_url;
        console.log(`Cloning ${value} from ${repoUrl}`);

        const git = simpleGit();
        try {
          await git.clone(repoUrl);
          console.log(`Repository ${value} cloned successfully.`);

          const repoPath = path.join(process.cwd(), value);
          const outputPath = path.join(process.cwd(), 'file.txt');  
          await fs.ensureFile(outputPath);
          let combinedCode = '';

          const readFilesRecursively = async (dir: string) => {
            const files = await fs.readdir(dir);
            for (const file of files) {
              const filePath = path.join(dir, file);
              const stat = await fs.stat(filePath);
              if (stat.isDirectory()) {
                if (file === '.git' || file === 'node_modules' || file === '.json' || file === 'Library') {
                  continue;
                }
                await readFilesRecursively(filePath);
              } else {
                if (file.endsWith('.sample') || file.endsWith('.md') || file === 'LICENSE' || file === '.gitattributes' || file === '.gitignore' || file === 'README.md' || file === 'CONTRIBUTING.md' || file === 'CODE_OF_CONDUCT.md' || file === '.DS_Store') {
                  continue;
                }
                const fileContent = await fs.readFile(filePath, 'utf-8');
                combinedCode += `\n// File: ${filePath}\n\n${fileContent}\n`;
              }
            }
          };

          await readFilesRecursively(repoPath);
          await fs.writeFile(outputPath, combinedCode);
          console.log(`Combined code written to ${outputPath}`);

          resolve(combinedCode);
        } catch (error) {
          console.error(`Error cloning repository ${value}`, error);
          reject(error);
        }
      }
    }).catch(() => {
      console.log('No repository selected');
      reject('No repository selected');
    });
  });
};

export default cloneAndParseRepo;

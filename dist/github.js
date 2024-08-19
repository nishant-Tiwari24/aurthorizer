"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cli_select_1 = __importDefault(require("cli-select"));
const simple_git_1 = __importDefault(require("simple-git"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const githubRepositories = (username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(`https://api.github.com/users/${username}/repos`);
        return data;
    }
    catch (error) {
        console.error("Error fetching repositories", error);
        return [];
    }
});
const cloneAndParseRepo = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const repos = yield githubRepositories(username);
    if (repos.length === 0) {
        console.log("No repositories found.");
        return null;
    }
    const repoNames = repos.map((repo) => repo.name);
    return new Promise((resolve, reject) => {
        console.log("Select a repository:");
        (0, cli_select_1.default)({
            values: repoNames
        }).then((_a) => __awaiter(void 0, [_a], void 0, function* ({ value }) {
            const selectedRepo = repos.find((repo) => repo.name === value);
            if (selectedRepo) {
                console.log(`You selected: ${value}`);
                const repoUrl = selectedRepo.clone_url;
                console.log(`Cloning ${value} from ${repoUrl}`);
                const git = (0, simple_git_1.default)();
                try {
                    yield git.clone(repoUrl);
                    console.log(`Repository ${value} cloned successfully.`);
                    const repoPath = path_1.default.join(process.cwd(), value);
                    const outputPath = path_1.default.join(process.cwd(), 'file.txt');
                    yield fs_extra_1.default.ensureFile(outputPath);
                    let combinedCode = '';
                    const readFilesRecursively = (dir) => __awaiter(void 0, void 0, void 0, function* () {
                        const files = yield fs_extra_1.default.readdir(dir);
                        for (const file of files) {
                            const filePath = path_1.default.join(dir, file);
                            const stat = yield fs_extra_1.default.stat(filePath);
                            if (stat.isDirectory()) {
                                if (file === '.git' || file === 'node_modules' || file === '.json' || file === 'Library') {
                                    continue;
                                }
                                yield readFilesRecursively(filePath);
                            }
                            else {
                                if (file.endsWith('.sample') || file.endsWith('.md') || file === 'LICENSE' || file === '.gitattributes' || file === '.gitignore' || file === 'README.md' || file === 'CONTRIBUTING.md' || file === 'CODE_OF_CONDUCT.md' || file === '.DS_Store') {
                                    continue;
                                }
                                const fileContent = yield fs_extra_1.default.readFile(filePath, 'utf-8');
                                combinedCode += `\n// File: ${filePath}\n\n${fileContent}\n`;
                            }
                        }
                    });
                    yield readFilesRecursively(repoPath);
                    yield fs_extra_1.default.writeFile(outputPath, combinedCode);
                    console.log(`Combined code written to ${outputPath}`);
                    resolve(combinedCode);
                }
                catch (error) {
                    console.error(`Error cloning repository ${value}`, error);
                    reject(error);
                }
            }
        })).catch(() => {
            console.log('No repository selected');
            reject('No repository selected');
        });
    });
});
exports.default = cloneAndParseRepo;

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
require("dotenv/config");
const github_js_1 = __importDefault(require("./github.js"));
const readline_1 = __importDefault(require("readline"));
const generative_ai_1 = require("@google/generative-ai");
const kleur_1 = __importDefault(require("kleur"));
const cli_table_1 = __importDefault(require("cli-table"));
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyCTkqNDJchmfc0bkN97haQT6NfyDPeBsqY');
const sendToGemini = (code) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const model = yield genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
      You are an advanced and mature code reviewer. You are reviewing a codebase that contains the following code: ${code}. 
      The codebase is a combination of multiple programming languages and technologies. 
      You need to provide feedback on the code quality, architecture, and design. 
      You need to identify potential bugs, security vulnerabilities, and performance issues. 
      You need to suggest improvements and refactorings. 
      You need to ensure that the code follows best practices and industry standards. 
      You need to provide detailed and constructive feedback to help the developers improve the codebase. 
      Provide the whole data just in a JSON format.

      Example JSON format:
      {
        "quality": 0,
        "architecture": 0,
        "design": 0,
        "bugs": [],
        "vulnerabilities": [],
        "performance": [],
        "improvements": [],
        "bestPractices": [],
        "standards": [],
        "feedback": ""
      }
    `;
        const result = yield model.generateContent(prompt);
        const response = result.response;
        const text = yield response.text();
        // Removing any additional content before parsing JSON
        const jsonString = (_a = text.match(/{[\s\S]*}/)) === null || _a === void 0 ? void 0 : _a[0];
        if (jsonString) {
            const jsonResponse = JSON.parse(jsonString);
            displayResults(jsonResponse);
        }
        else {
            console.error(kleur_1.default.red('Failed to extract JSON from the response.'));
        }
    }
    catch (error) {
        console.error(kleur_1.default.red('Error sending code to Gemini:'), error);
    }
});
const displayResults = (data) => {
    console.log(kleur_1.default.green().bold('\nCode Review Results:\n'));
    const table = new cli_table_1.default({
        head: ['Metric', 'Score'],
        colWidths: [30, 20]
    });
    table.push([kleur_1.default.blue('Quality'), data.quality], [kleur_1.default.blue('Architecture'), data.architecture], [kleur_1.default.blue('Design'), data.design]);
    console.log(table.toString());
    console.log(kleur_1.default.green().bold('\nPotential Bugs:'));
    data.bugs.forEach((bug, index) => {
        console.log(`${index + 1}. ${kleur_1.default.red('Description:')} ${bug.description}`);
        console.log(`   ${kleur_1.default.red('Location:')} ${bug.location} (Line ${bug.line})`);
        console.log(`   ${kleur_1.default.red('Severity:')} ${bug.severity}`);
        console.log();
    });
    console.log(kleur_1.default.green().bold('\nSecurity Vulnerabilities:'));
    data.vulnerabilities.forEach((vulnerability, index) => {
        console.log(`${index + 1}. ${kleur_1.default.red('Description:')} ${vulnerability.description}`);
        console.log(`   ${kleur_1.default.red('Location:')} ${vulnerability.location} (Line ${vulnerability.line})`);
        console.log(`   ${kleur_1.default.red('Severity:')} ${vulnerability.severity}`);
        console.log();
    });
    console.log(kleur_1.default.green().bold('\nPerformance Issues:'));
    data.performance.forEach((issue, index) => {
        console.log(`${index + 1}. ${kleur_1.default.yellow('Description:')} ${issue.description}`);
        console.log(`   ${kleur_1.default.yellow('Location:')} ${issue.location} (Line ${issue.line})`);
        console.log(`   ${kleur_1.default.yellow('Severity:')} ${issue.severity}`);
        console.log();
    });
    console.log(kleur_1.default.green().bold('\nImprovements:'));
    data.improvements.forEach((improvement, index) => {
        console.log(`${index + 1}. ${kleur_1.default.green('Description:')} ${improvement.description}`);
        console.log(`   ${kleur_1.default.green('Location:')} ${improvement.location} (Line ${improvement.line})`);
        console.log(`   ${kleur_1.default.green('Severity:')} ${improvement.severity}`);
        console.log();
    });
    console.log(kleur_1.default.green().bold('\nBest Practices:'));
    data.bestPractices.forEach((practice, index) => {
        console.log(`${index + 1}. ${kleur_1.default.cyan('Description:')} ${practice.description}`);
        console.log(`   ${kleur_1.default.cyan('Location:')} ${practice.location} (Line ${practice.line})`);
        console.log(`   ${kleur_1.default.cyan('Severity:')} ${practice.severity}`);
        console.log();
    });
    console.log(kleur_1.default.green().bold('\nStandards:'));
    data.standards.forEach((standard, index) => {
        console.log(`${index + 1}. ${kleur_1.default.magenta('Description:')} ${standard.description}`);
        console.log(`   ${kleur_1.default.magenta('Location:')} ${standard.location} (Line ${standard.line})`);
        console.log(`   ${kleur_1.default.magenta('Severity:')} ${standard.severity}`);
        console.log();
    });
    console.log(kleur_1.default.green().bold('\nDetailed Feedback:'));
    console.log(kleur_1.default.white(data.feedback));
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter GitHub username: ', (username) => __awaiter(void 0, void 0, void 0, function* () {
        if (!username) {
            console.log(kleur_1.default.red('Please provide a GitHub username.'));
            rl.close();
            return;
        }
        try {
            const combinedCode = yield (0, github_js_1.default)(username);
            if (combinedCode) {
                yield sendToGemini(combinedCode);
            }
        }
        catch (error) {
            console.error(kleur_1.default.red('Error:'), error);
        }
        finally {
            rl.close();
        }
    }));
});
main();

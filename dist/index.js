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
const github_1 = __importDefault(require("./github"));
const readline_1 = __importDefault(require("readline"));
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI('AIzaSyCTkqNDJchmfc0bkN97haQT6NfyDPeBsqY');
const sendToGemini = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an advanced and mature code reviewer. You are reviewing a codebase ${code}. The codebase is a combination of multiple programming languages and technologies. You need to provide feedback on the code quality, architecture, and design. You need to identify potential bugs, security vulnerabilities, and performance issues. You need to suggest improvements and refactorings. You need to ensure that the code follows best practices and industry standards. You need to provide detailed and constructive feedback to help the developers improve the codebase.Give output in json format and give score for the code quality, architecture, and design. Provide feedback on potential bugs, security vulnerabilities, and performance issues. Suggest improvements and refactorings. Ensure that the code follows best practices and industry standards. Provide detailed and constructive feedback to help the developers improve the codebase.`;
    ;
    const result = yield model.generateContent(prompt);
    const response = yield result.response;
    const text = response.text();
    console.log(text);
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter GitHub username: ', (username) => __awaiter(void 0, void 0, void 0, function* () {
        if (!username) {
            console.log('Please provide a GitHub username.');
            rl.close();
            return;
        }
        try {
            const combinedCode = yield (0, github_1.default)(username);
            if (combinedCode) {
                yield sendToGemini(combinedCode);
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
        finally {
            rl.close();
        }
    }));
});
main();

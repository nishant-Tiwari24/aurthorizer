import cloneAndParseRepo from './github';
import readline from 'readline';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCTkqNDJchmfc0bkN97haQT6NfyDPeBsqY');

const sendToGemini = async (code: string): Promise<void> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const prompt = `You are an advanced and mature code reviewer. You are reviewing a codebase ${code}. The codebase is a combination of multiple programming languages and technologies. You need to provide feedback on the code quality, architecture, and design. You need to identify potential bugs, security vulnerabilities, and performance issues. You need to suggest improvements and refactorings. You need to ensure that the code follows best practices and industry standards. You need to provide detailed and constructive feedback to help the developers improve the codebase.Give output in json format and give score for the code quality, architecture, and design. Provide feedback on potential bugs, security vulnerabilities, and performance issues. Suggest improvements and refactorings. Ensure that the code follows best practices and industry standards. Provide detailed and constructive feedback to help the developers improve the codebase.`; 
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
};

const main = async (): Promise<void> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter GitHub username: ', async (username) => {
    if (!username) {
      console.log('Please provide a GitHub username.');
      rl.close();
      return;
    }

    try {
      const combinedCode = await cloneAndParseRepo(username);
      if (combinedCode) {
        await sendToGemini(combinedCode);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      rl.close();
    }
  });
};

main();

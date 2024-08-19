import 'dotenv/config';
import cloneAndParseRepo from './github.js';
import readline from 'readline';
import { GoogleGenerativeAI } from '@google/generative-ai';
import colors from 'colors';
import Table from 'cli-table';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

const sendToGemini = async (code: string): Promise<void> => {
  try {
    const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

    const result = await model.generateContent( prompt );
    const response = result.response;
    const text = await response.text();
    
    // Removing any additional content before parsing JSON
    const jsonString = text.match(/{[\s\S]*}/)?.[0];
    
    if (jsonString) {
      const jsonResponse = JSON.parse(jsonString);
      displayResults(jsonResponse);
    } else {
      console.error(colors.red('Failed to extract JSON from the response.'));
    }

  } catch (error) {
    console.error(colors.red('Error sending code to Gemini:'), error);
  }
};

const displayResults = (data: any): void => {
  console.log(colors.green.bold('\nCode Review Results:\n'));

  const table = new Table({
    head: ['Metric', 'Score'],
    colWidths: [30, 20]
  });

  table.push(
    [colors.blue('Quality'), data.quality],
    [colors.blue('Architecture'), data.architecture],
    [colors.blue('Design'), data.design]
  );

  console.log(table.toString());

  console.log(colors.green.bold('\nPotential Bugs:'));
  data.bugs.forEach((bug: any, index: number) => {
    console.log(`${index + 1}. ${colors.red('Description:')} ${bug.description}`);
    console.log(`   ${colors.red('Location:')} ${bug.location} (Line ${bug.line})`);
    console.log(`   ${colors.red('Severity:')} ${bug.severity}`);
    console.log();
  });

  console.log(colors.green.bold('\nSecurity Vulnerabilities:'));
  data.vulnerabilities.forEach((vulnerability: any, index: number) => {
    console.log(`${index + 1}. ${colors.red('Description:')} ${vulnerability.description}`);
    console.log(`   ${colors.red('Location:')} ${vulnerability.location} (Line ${vulnerability.line})`);
    console.log(`   ${colors.red('Severity:')} ${vulnerability.severity}`);
    console.log();
  });

  console.log(colors.green.bold('\nPerformance Issues:'));
  data.performance.forEach((issue: any, index: number) => {
    console.log(`${index + 1}. ${colors.yellow('Description:')} ${issue.description}`);
    console.log(`   ${colors.yellow('Location:')} ${issue.location} (Line ${issue.line})`);
    console.log(`   ${colors.yellow('Severity:')} ${issue.severity}`);
    console.log();
  });

  console.log(colors.green.bold('\nImprovements:'));
  data.improvements.forEach((improvement: any, index: number) => {
    console.log(`${index + 1}. ${colors.green('Description:')} ${improvement.description}`);
    console.log(`   ${colors.green('Location:')} ${improvement.location} (Line ${improvement.line})`);
    console.log(`   ${colors.green('Severity:')} ${improvement.severity}`);
    console.log();
  });

  console.log(colors.green.bold('\nBest Practices:'));
  data.bestPractices.forEach((practice: any, index: number) => {
    console.log(`${index + 1}. ${colors.cyan('Description:')} ${practice.description}`);
    console.log(`   ${colors.cyan('Location:')} ${practice.location} (Line ${practice.line})`);
    console.log(`   ${colors.cyan('Severity:')} ${practice.severity}`);
    console.log();
  });

  console.log(colors.green.bold('\nStandards:'));
  data.standards.forEach((standard: any, index: number) => {
    console.log(`${index + 1}. ${colors.magenta('Description:')} ${standard.description}`);
    console.log(`   ${colors.magenta('Location:')} ${standard.location} (Line ${standard.line})`);
    console.log(`   ${colors.magenta('Severity:')} ${standard.severity}`);
    console.log();
  });

  console.log(colors.green.bold('\nDetailed Feedback:'));
  console.log(colors.white(data.feedback));
};

const main = async (): Promise<void> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter GitHub username: ', async (username) => {
    if (!username) {
      console.log(colors.red('Please provide a GitHub username.'));
      rl.close();
      return;
    }

    try {
      const combinedCode = await cloneAndParseRepo(username);
      if (combinedCode) {
        await sendToGemini(combinedCode);
      }
    } catch (error) {
      console.error(colors.red('Error:'), error);
    } finally {
      rl.close();
    }
  });
};

main();

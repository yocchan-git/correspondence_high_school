#!/usr/bin/env node

import enquirer from "enquirer";
import fsPromises from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main(__dirname) {
  const millisecond = 1500;
  console.log(
    "このアプリでは,5つの質問であなたの通信制高校への適応度を測ります\n",
  );
  await timeOut(millisecond);
  console.log("ただ、最終的な意思決定はご自身で行なってくださいね！\n");
  await timeOut(millisecond);
  console.log("それでは、スタート\n");
  await timeOut(millisecond);

  const questions = JSON.parse(
    await fsPromises.readFile(`${__dirname}/questions/question.json`),
  );
  const totalPoints = await calculateTotalPoints(questions, __dirname);
  const comment = createComment(totalPoints);

  console.log(`あなたの適応度は${totalPoints}%です`);
  console.log(comment);
}

async function timeOut(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function calculateTotalPoints(questions, __dirname) {
  let percentPoints = 0;

  for (let i = 0; i <= 4; i++) {
    percentPoints += await calculatePointForQuestion(questions[i], __dirname);
  }

  return percentPoints;
}

async function calculatePointForQuestion(question, __dirname) {
  const choiceAnswers = JSON.parse(
    await fsPromises.readFile(`${__dirname}/questions/${question.detailsFile}`),
  );

  const query = {
    type: "select",
    name: "point",
    message: question.title,
    choices: choiceAnswers,
    result() {
      return this.focused.point;
    },
  };

  const answer = await enquirer.prompt(query);

  if (answer.point === "") {
    return 0;
  }
  return answer.point;
}

function createComment(totalPoints) {
  if (totalPoints >= 75) {
    return  "通信制高校に向いてるかも！前向きに検討してみてね";
  } else if (totalPoints < 75 && totalPoints >= 50) {
    return  "通信制高校にちょい向いてる。資料請求してみたらいいかも";
  } else if (totalPoints < 50 && totalPoints >= 25) {
    return  "通信制高校にちょい向いてなさそう。今の環境で満足できるまで頑張ってみるといいかも";
  } else {
    return  "通信制高校には向いてなさそう。今のまま楽しんで！";
  }
}

main(__dirname);

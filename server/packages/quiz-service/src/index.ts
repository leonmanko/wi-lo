import { quizRouter } from "./router";

const port = parseInt(process.env.QUIZ_SERVICE_PORT || "3003");
console.log(`Quiz Service ready on port ${port}`);

export { quizRouter };
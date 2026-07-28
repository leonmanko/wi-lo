import { userRouter } from "./router";

const port = parseInt(process.env.USER_SERVICE_PORT || "3002");
console.log(`User Service ready on port ${port}`);
console.log(`Router has ${Object.keys(userRouter).length} procedures`);

export { userRouter };
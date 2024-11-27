//<!--22021332d Chan Hei-->
//<!--22020839d Wong Sing Ho Samuel-->
import dotenv from "dotenv";
dotenv.config();
if (!process.env.CONNECTION_STR) {
  console.error('CONNECTION_STR is not defined');
  process.exit(1);
}
export default {
  CONNECTION_STR: process.env.CONNECTION_STR,
};
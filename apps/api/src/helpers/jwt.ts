import { UserLogin } from "../interfaces/user.interface";
import { ResponseError } from "./error";
import { getUserByEmail } from "./user.prisma";
import { UserToken } from "../interfaces/middleware.interface";
import { sign } from "jsonwebtoken";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../config";

export const putUserAccessToken = async (user?: UserLogin, email?: string) => {
  //kalo nda` lewat login bisa lewat yang lain, untuk generate token, dari email misalnya
  const userData = user || (await getUserByEmail(email!));
  if (userData) {
    delete userData.password;
  }
  const dataBundleUser = { ...userData } as UserToken;
  if (!dataBundleUser) throw new ResponseError(401, "unauthorize email");

  const accessToken = sign(dataBundleUser, JWT_ACCESS_SECRET, {
    expiresIn: "1d",
  });

  const refreshToken = sign(
    { email: dataBundleUser.email },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "3d",
    }
  );

  return {
    accessToken,
    refreshToken,
  };
};

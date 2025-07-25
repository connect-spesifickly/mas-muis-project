import { compare } from "bcrypt";
import { getUserByEmail } from "../helpers/user.prisma";
import { UserLogin } from "../interfaces/user.interface";
import { ResponseError } from "../helpers/error";
import { putUserAccessToken } from "../helpers/jwt";
import prisma from "../prisma";
import { generateHashedPassword } from "../utils/generate-password";
import jwt from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_ACCESS_SECRET } from "../config";
import { Role } from "@prisma/client";

class AuthService {
  async login(data: { email: string; password: string }) {
    const { email, password } = data;
    const user = (await getUserByEmail(email)) as UserLogin;
    if (!(await compare(password, user.password as string))) {
      throw new ResponseError(401, "Invalid password");
    }
    const token = await putUserAccessToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role, // tambahkan role di response
      },
      token,
    };
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    role: Role | undefined;
  }) {
    const { email, password, name, role } = data;
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ResponseError(409, "Email already registered");
    }
    // Hash password
    const hashedPassword = await generateHashedPassword(password);
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
    return {
      id: user.id,
      email: user.email,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
        email: string;
      };
      const user = await getUserByEmail(payload.email);
      if (!user) throw new ResponseError(404, "User not found");
      if (!user.password)
        throw new ResponseError(401, "User has no password set");
      return await putUserAccessToken({
        ...user,
        password: user.password as string,
      });
    } catch (err) {
      throw new ResponseError(401, "Invalid or expired refresh token");
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = jwt.verify(token, JWT_ACCESS_SECRET) as { email: string };
      const user = await getUserByEmail(payload.email);
      if (!user) throw new ResponseError(404, "User not found");
      const hashedPassword = await generateHashedPassword(newPassword);
      await prisma.user.update({
        where: { email: payload.email },
        data: { password: hashedPassword },
      });
      return { message: "Password updated successfully" };
    } catch (err) {
      throw new ResponseError(400, "Invalid or expired reset token");
    }
  }
}

export default new AuthService();

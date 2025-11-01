import jwt from "jsonwebtoken";

const dateExpire = 14;

export function generateToken(userId, res) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: `${dateExpire}d`,
  });
  res.cookie("jwt", token, {
    maxAge: dateExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return token;
}

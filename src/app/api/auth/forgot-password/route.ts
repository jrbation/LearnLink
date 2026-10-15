import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Do not reveal whether user exists for privacy/security
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      await prisma.verificationToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          type: "password_reset",
          expiresAt,
        },
      });

      // Also create an in-app security notification for account safety
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Password Reset Requested",
          message: "A password reset request was initiated for your account. If this was not you, please secure your credentials.",
          type: "GENERAL",
        },
      });
    }

    return NextResponse.json({
      message: "If an account exists, reset instructions have been issued.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request." },
      { status: 500 }
    );
  }
}

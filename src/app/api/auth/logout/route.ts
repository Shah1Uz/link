import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SESSION_COOKIES = [
  "biospace_session",
  "biospace_impersonate",
  "__session",
  "__client_uat",
  "__clerk_db_jwt",
  "__clerk_handshake",
];

function applyLogoutCookies(response: NextResponse) {
  SESSION_COOKIES.forEach((name) => {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: name === "biospace_session" || name === "biospace_impersonate",
      sameSite: "lax",
    });
  });
  return response;
}

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    SESSION_COOKIES.forEach((name) => {
      try {
        cookieStore.set(name, "", {
          path: "/",
          maxAge: 0,
          expires: new Date(0),
        });
        cookieStore.delete(name);
      } catch {}
    });

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    return applyLogoutCookies(response);
  } catch (error: any) {
    const fallbackResponse = NextResponse.json(
      { error: error.message || "Failed to log out" },
      { status: 500 }
    );
    return applyLogoutCookies(fallbackResponse);
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    SESSION_COOKIES.forEach((name) => {
      try {
        cookieStore.set(name, "", {
          path: "/",
          maxAge: 0,
          expires: new Date(0),
        });
        cookieStore.delete(name);
      } catch {}
    });

    const signInUrl = new URL("/sign-in", request.url);
    const response = NextResponse.redirect(signInUrl);
    return applyLogoutCookies(response);
  } catch {
    const signInUrl = new URL("/sign-in", request.url);
    const response = NextResponse.redirect(signInUrl);
    return applyLogoutCookies(response);
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { adminEnabled, isAdminAuthorized } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  if (!adminEnabled()) {
    return new NextResponse("Not Found", { status: 404 });
  }
  if (!isAdminAuthorized(request.headers.get("authorization"))) {
    return new NextResponse("認証が必要です", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="yoserun admin", charset="UTF-8"' },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

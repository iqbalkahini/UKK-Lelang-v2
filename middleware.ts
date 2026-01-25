import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { redirectAfterLogin } from "./lib/auth/actions";
import { getUserRole } from "./lib/auth/role";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // -------------------------------------------------------------
  // ROLE PROTECTION LOGIC
  // -------------------------------------------------------------

  const path = request.nextUrl.pathname;

  // 1. Cek apakah user mencoba mengakses halaman yang dilindungi
  const isAdminRoute = path.startsWith("/admin");
  const isPetugasRoute = path.startsWith("/petugas");
  const isMasyarakatRoute = path.startsWith("/masyarakat");
  const isLoginPage = path === "/auth/login";
  const isRegisterPage = path === "/auth/sign-up";
  const isLandingPage = path === "/";

  // 2. Jika user sudah login tapi mencoba akses halaman login/register/landing
  // Redirect ke dashboard sesuai role
  if ((isLoginPage || isRegisterPage || isLandingPage) && user) {
    // Ambil data user dari tabel 'users' untuk cek basic role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData) {
      const userRole = userData.role;

      // Jika role adalah masyarakat, redirect ke /masyarakat/dashboard
      if (userRole === "masyarakat") {
        return NextResponse.redirect(
          new URL("/masyarakat/dashboard", request.url),
        );
      }

      // Jika role adalah petugas, cek level untuk tentukan admin atau petugas
      if (userRole === "petugas") {
        const { data: petugasData } = await supabase
          .from("tb_petugas")
          .select(
            `
            level:tb_level (
              level
            )
          `,
          )
          .eq("user_id", user.id)
          .single();

        // @ts-ignore
        const levelName = petugasData?.level?.level;

        if (levelName === "administrator") {
          return NextResponse.redirect(
            new URL("/admin/dashboard", request.url),
          );
        } else if (levelName === "petugas") {
          return NextResponse.redirect(
            new URL("/petugas/dashboard", request.url),
          );
        }
      }
    }
  }

  // 3. Proteksi halaman berdasarkan role
  // console.log("User : ", user);
  if (isAdminRoute || isPetugasRoute || isMasyarakatRoute) {
    if (!user) {
      // Jika belum login, lempar ke login
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    // Ambil data user dari tabel 'users' untuk cek basic role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData) {
      // Data user tidak ditemukan di tabel users -> redirect error/login
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    // Basic Role check
    let userRole = userData.role; // 'masyarakat' or 'petugas'

    // Jika ingin tahu apakah dia admin atau petugas biasa, kita perlu cek tb_petugas
    // Namun untuk efisiensi middleware, kita bisa cek dasar dulu.

    // ATURAN 1: MASYARAKAT
    if (isMasyarakatRoute) {
      if (userRole !== "masyarakat") {
        // Petugas/Admin tidak boleh masuk halaman masyarakat (Strict)
        // Atau bisa kita redirect ke dashboard mereka masing-masing
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // ATURAN 2: ADMIN & PETUGAS (Perlu cek detail level)
    if (isAdminRoute || isPetugasRoute) {
      if (userRole !== "petugas") {
        // Masyarakat mencoba masuk halaman admin/petugas
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Cek Level Petugas
      const { data: petugasData } = await supabase
        .from("tb_petugas")
        .select(
          `
            level:tb_level (
            level
            )
        `,
        )
        .eq("user_id", user.id)
        .single();

      // @ts-ignore
      const levelName = petugasData?.level?.level; // 'administrator' | 'petugas'

      if (isAdminRoute && levelName !== "administrator") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if (isPetugasRoute && levelName !== "petugas") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback, auth/confirm (Supabase auth flows)
     * - api/ (API routes)
     * - Static assets (images, etc.)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|auth/confirm|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

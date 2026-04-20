import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function createClient() {
  const cookieStore = await cookies(); // ✅ await is required in Next.js 15
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

// POST — Save a new result
export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const body = await req.json();
    const { name, personality, journey, guidance, selected_option } = body;

    const { error } = await supabase.from("student_results").insert({
      user_id:         session.user.id,
      name:            name || "Student",
      personality:     personality || "Explorer",
      journey:         journey || [],
      guidance:        guidance || {},
      selected_option: selected_option || "",
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — Fetch all saved results for logged-in user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("student_results")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Fetch error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — Delete a specific result by id
export async function DELETE(req) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const { id } = await req.json();

    const { error } = await supabase
      .from("student_results")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
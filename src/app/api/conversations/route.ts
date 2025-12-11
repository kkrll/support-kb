import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const adminPassword = searchParams.get("admin_password");

  const conversationId = searchParams.get("id");
  if (conversationId) {
    try {
      const { data: conversation, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();
      if (error) throw error;
      // Get messages for this conversation
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (messagesError) throw messagesError;
      return NextResponse.json({ conversation, messages });
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
      return NextResponse.json(
        { error: "Failed to fetch conversation" },
        { status: 500 }
      );
    }
  }

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`*, messages(count)`)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  // Check admin password
  const { searchParams } = new URL(req.url);
  const adminPassword = searchParams.get("admin_password");

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const conversationId = searchParams.get("id");
  if (!conversationId) {
    return NextResponse.json(
      { error: "Conversation ID required" },
      { status: 400 }
    );
  }
  try {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}

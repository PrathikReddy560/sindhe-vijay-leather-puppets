import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const statusMessages: Record<string, string> = {
  pending: "Your order has been received and is pending confirmation.",
  confirmed: "Great news! Your order has been confirmed and is being prepared.",
  shipped: "Your order has been shipped! It's on its way to you.",
  delivered: "Your order has been delivered. Thank you for shopping with us!",
  cancelled: "Your order has been cancelled. If you have questions, please contact us.",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const { userId, customerName, orderId, newStatus, orderTotal, items } = await req.json();

    if (!userId || !orderId || !newStatus) {
      throw new Error("Missing required fields: userId, orderId, newStatus");
    }

    // Look up user email server-side using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userData?.user?.email) {
      console.error("Could not find user email:", userError);
      return new Response(JSON.stringify({ error: "Customer email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerEmail = userData.user.email;

    const statusEmoji: Record<string, string> = {
      pending: "⏳", confirmed: "✅", shipped: "🚚", delivered: "📦", cancelled: "❌",
    };

    const itemsHtml = items?.map((item: any) =>
      `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.product_name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${item.price?.toLocaleString("en-IN")}</td>
      </tr>`
    ).join("") || "";

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#ffffff;padding:32px;">
        <h2 style="color:#1a1a1a;margin-bottom:4px;">Order Status Update ${statusEmoji[newStatus] || ""}</h2>
        <p style="color:#666;margin-top:0;">Hi ${customerName || "Customer"},</p>
        <p style="color:#333;">${statusMessages[newStatus] || "Your order status has been updated."}</p>
        <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:24px 0;">
          <p style="margin:0 0 4px;font-weight:600;color:#1a1a1a;">Order #${orderId}</p>
          <p style="margin:0;color:#666;">Status: <strong style="color:#1a1a1a;text-transform:capitalize;">${newStatus}</strong></p>
          ${orderTotal ? `<p style="margin:4px 0 0;color:#666;">Total: <strong style="color:#1a1a1a;">₹${Number(orderTotal).toLocaleString("en-IN")}</strong></p>` : ""}
        </div>
        ${items?.length ? `
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead><tr style="background:#f0f0f0;">
            <th style="padding:8px;text-align:left;">Item</th>
            <th style="padding:8px;text-align:center;">Qty</th>
            <th style="padding:8px;text-align:right;">Price</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>` : ""}
        <p style="color:#999;font-size:12px;margin-top:32px;">Sindhe Vijay Leather Puppets</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Sindhe Vijay Leather Puppets <onboarding@resend.dev>",
        to: [customerEmail],
        subject: `Order #${orderId} - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(JSON.stringify({ error: result }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

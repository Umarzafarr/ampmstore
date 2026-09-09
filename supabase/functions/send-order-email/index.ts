import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, customerName, customerEmail, customerPhone, items, total, address, paymentMethod, paymentScreenshotUrl } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const itemsHtml = items
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.sku || "N/A"}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">PKR ${Number(item.price).toLocaleString()}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">PKR ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
      )
      .join("");

    const screenshotSection = paymentScreenshotUrl
      ? `<div style="margin: 16px 0; padding: 12px; background: #f0f9ff; border-radius: 8px;">
           <p style="font-weight: bold; color: #333;">💳 Payment Screenshot:</p>
           <img src="${paymentScreenshotUrl}" alt="Payment Screenshot" style="max-width: 400px; border-radius: 8px; margin-top: 8px; border: 1px solid #ddd;" />
         </div>`
      : "";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Order Received! 🛒</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${customerPhone || "N/A"}</p>
        <p><strong>Shipping Address:</strong> ${address}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod === "cod" ? "💵 Cash on Delivery" : "💳 Online Payment (SadaPay)"}</p>
        
        ${screenshotSection}
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: left;">SKU</th>
              <th style="padding: 8px; text-align: left;">Qty</th>
              <th style="padding: 8px; text-align: left;">Price</th>
              <th style="padding: 8px; text-align: left;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <h3 style="text-align: right; color: #333;">Total: PKR ${Number(total).toLocaleString()}</h3>
      </div>
    `;

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "am/pm Vape Store <onboarding@resend.dev>",
        to: ["uzaff55@gmail.com"],
        subject: `New Order #${orderId.slice(0, 8)} from ${customerName} - ${paymentMethod === "cod" ? "COD" : "Online Payment"}`,
        html: emailHtml,
      }),
    });

    const resData = await res.json();
    console.log("Resend gateway response:", JSON.stringify(resData));

    if (!res.ok) {
      throw new Error(`Email send failed: ${JSON.stringify(resData)}`);
    }

    return new Response(JSON.stringify({ success: true, message: "Order notification sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

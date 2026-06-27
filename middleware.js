export const config = {
  matcher: "/((?!assets|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.[\\w]+$).*)",
};

const BOT_REGEX = /Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|GPTBot|ChatGPT-User|PerplexityBot|ClaudeBot|Applebot/i;

export default async function middleware(request) {
  const ua = request.headers.get("user-agent") || "";
  if (!BOT_REGEX.test(ua)) return; // real visitors → normal SPA, untouched

  const url = new URL(request.url);
  const host = request.headers.get("host");

  try {
    const apiRes = await fetch(
      `https://marinepanel-backend.onrender.com/seo/render?path=${encodeURIComponent(url.pathname)}`,
      { headers: { "x-childpanel-domain": host, "x-reseller-domain": host } }
    );
    const html = await apiRes.text();
    return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  } catch {
    return; // backend down → fall back to normal SPA rather than erroring
  }
}

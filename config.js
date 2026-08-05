// Paste values from Supabase: Project Settings > API.
// The publishable/anon key is expected to be visible in a browser app.
window.EASYINVOICE_CONFIG = {
  // Default PIN is 123456. Replace pinHash with the SHA-256 hash of your chosen 6-digit PIN.
  security: {
    pinEnabled: true,
    pinHash: "e3438ccc9b4d32373ad2caeca59c4549ded7d400bea84f987c7d6ad4f634980a"
  },
  cloud: {
    enabled: true,
    supabaseUrl: "https://zceebdudxkpjwpnnklet.supabase.co",
    supabasePublishableKey: "sb_publishable_Z4MDOgasCdKLUruOq0xwkw_mFC2NzHW",
    workspaceId: "easyinvoice-shree-7f92b3c9d7x5411a81z2026private"
  }
};

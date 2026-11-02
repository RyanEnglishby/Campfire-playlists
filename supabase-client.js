// Shared Supabase client -- one GoTrueClient instance for the whole page.
//
// Campfire Groups (groups.js), sign-in (auth.js), and synced Memories
// (memories.js) all talk to the same Supabase project. Auth sessions are
// tracked client-side by the SDK's own GoTrueClient, which reads/writes a
// shared localStorage key -- creating more than one client against the same
// project is a known source of "multiple GoTrueClient instances" session
// drift, so every feature gets its client from here instead of calling
// supabase.createClient() itself.
(function () {
  "use strict";

  // The anon key is meant to be public (same trust model as any Supabase
  // static-site setup) -- real protection is each table's RLS policies, not
  // secrecy of this key. Same project Campfire Groups already uses.
  var SUPABASE_URL = "https://gvsvobehytjgidclilwa.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_CudMVeTx70qoNujEcYmb1Q_ZHVA0w4x";
  var SUPABASE_CONFIGURED =
    SUPABASE_URL.indexOf("YOUR_SUPABASE") === -1 &&
    SUPABASE_ANON_KEY.indexOf("YOUR_SUPABASE") === -1;

  var client = null;

  function isReady() {
    // SUPABASE_CONFIGURED alone isn't enough -- the CDN script (loaded via
    // its own <script> tag before this file) can fail to load for reasons
    // that have nothing to do with configuration: an ad blocker, a
    // corporate firewall, or a network hiccup.
    return SUPABASE_CONFIGURED && !!(window.supabase && window.supabase.createClient);
  }

  function getClient() {
    if (!isReady()) return null;
    if (!client) client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return client;
  }

  window.CampfireSupabase = { isReady: isReady, getClient: getClient };
})();

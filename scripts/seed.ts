/**
 * Seed script: creates test users and products.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Run: npm run seed
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  console.error(
    "Get service role key from: Supabase Dashboard → Settings → API → service_role"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_USERS = [
  {
    email: "buyer@test.com",
    password: "password123",
    full_name: "Test Buyer",
    role: "buyer" as const,
  },
  {
    email: "seller@test.com",
    password: "password123",
    full_name: "Test Seller",
    role: "seller" as const,
  },
  {
    email: "admin@test.com",
    password: "password123",
    full_name: "Test Admin",
    role: "admin" as const,
  },
];

async function main() {
  console.log("🌱 Seeding test data...\n");

  const sellerIds: Record<string, string> = {};

  for (const user of TEST_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        role: user.role,
      },
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        console.log(`⏭️  ${user.email} — already exists, skipping`);
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find((u) => u.email === user.email);
        if (existing && user.role === "seller") {
          sellerIds[user.email] = existing.id;
        }
      } else {
        console.error(`❌ ${user.email}:`, error.message);
      }
    } else if (data.user) {
      console.log(`✅ ${user.email} — created (role: ${user.role})`);
      if (user.role === "seller") {
        sellerIds[user.email] = data.user.id;
      }
    }
  }

  // Update profiles with correct role (trigger may have set default 'buyer')
  for (const user of TEST_USERS) {
    await supabase
      .from("profiles")
      .update({ role: user.role })
      .eq("full_name", user.full_name);
  }

  const sellerId = sellerIds["seller@test.com"] ?? Object.values(sellerIds)[0];

  if (sellerId) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("seller_id", sellerId)
      .limit(1)
      .single();

    if (!existing) {
      const products = [
        {
          seller_id: sellerId,
          title: "Vintage Camera",
          description: "Classic film camera in great condition",
          price: 29900,
          category: "Electronics",
          status: "active",
          images: [],
        },
        {
          seller_id: sellerId,
          title: "Handmade Wooden Desk",
          description: "Solid oak desk, handcrafted",
          price: 45000,
          category: "Furniture",
          status: "active",
          images: [],
        },
        {
          seller_id: sellerId,
          title: "Designer Sunglasses",
          description: "Brand new, never worn",
          price: 12000,
          category: "Fashion",
          status: "active",
          images: [],
        },
      ];

      for (const p of products) {
        const { error } = await supabase.from("products").insert(p);
        if (error) {
          console.error("❌ Product insert:", error.message);
        } else {
          console.log(`✅ Product: ${p.title}`);
        }
      }
    } else {
      console.log("⏭️  Products already exist, skipping");
    }
  } else {
    console.log("⚠️  No seller found, skipping products. Run seed again after profiles sync.");
  }

  console.log("\n✅ Seed complete!\n");
  console.log("Test accounts:");
  TEST_USERS.forEach((u) => console.log(`  ${u.email} / ${u.password}`));
}

main().catch(console.error);

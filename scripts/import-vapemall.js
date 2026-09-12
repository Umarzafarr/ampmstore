import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import crypto from "crypto";

// Read from process.env or .env file
function getEnv(key) {
  if (process.env[key]) return process.env[key];
  if (fs.existsSync(".env")) {
    const lines = fs.readFileSync(".env", "utf8").split("\n");
    for (const l of lines) {
      const [k, ...v] = l.split("=");
      if (k?.trim() === key) return v.join("=").replace(/^["']|["']$/g, "").trim();
    }
  }
  return "";
}

const SUPABASE_URL = getEnv("VITE_SUPABASE_URL") || "https://tvpnjarioubhoffsmqxk.supabase.co";
const SUPABASE_KEY = getEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function toUUID(id) {
  const hash = crypto.createHash("md5").update("vapemall-" + id).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function cleanTitle(title) {
  if (!title) return "";
  return title
    .replace(/\s+at\s+best\s+price\s+(online\s+)?in\s+pakistan/gi, "")
    .replace(/\s+best\s+price\s+(online\s+)?in\s+pakistan/gi, "")
    .replace(/\s+online\s+in\s+pakistan/gi, "")
    .replace(/\s+in\s+pakistan/gi, "")
    .replace(/\s+price\s+in\s+pakistan/gi, "")
    .replace(/\s*\|\s*shop\s+now!?/gi, "")
    .replace(/\s*\|\s*vape\s+shop\s+near\s+you/gi, "")
    .trim();
}

function cleanDescription(html) {
  if (!html) return "";
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
  return text.slice(0, 1500); // keep clean concise description
}

// Category definitions
const TARGET_CATEGORIES = [
  {
    name: "Pod Kits",
    description: "Refillable pod starter kits and smart compact systems",
    slug: "pod-kits"
  },
  {
    name: "Disposable Vapes",
    description: "High-puff rechargeable smart disposables",
    slug: "disposables"
  },
  {
    name: "E-Liquids & Nic Salts",
    description: "Premium imported salt nicotine and freebase e-juices",
    slug: "e-liquids"
  },
  {
    name: "Coils & Cartridges",
    description: "Replacement coils, pods, and mesh atomizers",
    slug: "coils-cartridges"
  },
  {
    name: "Mod Kits & Devices",
    description: "High-wattage box mods, dual battery devices, and advanced kits",
    slug: "mods"
  },
  {
    name: "Tanks & Rebuildables",
    description: "Sub-ohm tanks, RDAs, RTAs, cotton, and specialty coils",
    slug: "tanks"
  },
  {
    name: "Accessories & Hardware",
    description: "High-drain batteries, fast chargers, lanyards, and tools",
    slug: "accessories"
  }
];

function mapCategoryName(product) {
  const type = (product.product_type || "").trim().toLowerCase();
  const title = (product.title || "").toLowerCase();
  const tags = (product.tags || []).map((t) => t.toLowerCase());
  const tagStr = tags.join(" ");

  // 1. Disposables
  if (
    type === "disposable" ||
    title.includes("disposable") ||
    title.includes("puffs") ||
    tagStr.includes("disposable")
  ) {
    return "Disposable Vapes";
  }

  // 2. Coils & Replacement Pods
  if (
    type === "coils" ||
    type === "replacement coils" ||
    type === "replacement pods" ||
    title.includes("replacement coil") ||
    title.includes("replacement pod") ||
    title.includes("empty cartridge") ||
    title.includes("replacement cartridge") ||
    title.includes("mesh coil")
  ) {
    return "Coils & Cartridges";
  }

  // 3. Pod Kits
  if (
    type === "pod kit" ||
    title.includes("pod kit") ||
    title.includes("pod system") ||
    title.includes("starter kit") ||
    tagStr.includes("pod kit") ||
    tagStr.includes("pod system")
  ) {
    return "Pod Kits";
  }

  // 4. Mod Kits & Box Mods
  if (
    type === "mod kit" ||
    type === "box mod" ||
    type === "mod" ||
    title.includes("box mod") ||
    title.includes("mod kit") ||
    title.includes("squonk")
  ) {
    return "Mod Kits & Devices";
  }

  // 5. Tanks & Rebuildables
  if (
    type === "tank" ||
    type === "sub ohm tanks" ||
    type === "mtl tank" ||
    type === "rda" ||
    type === "rta" ||
    type === "bf rda" ||
    type === "rba" ||
    type === "gta" ||
    type === "wire" ||
    type === "cotton" ||
    title.includes("sub-ohm tank") ||
    title.includes("atomizer")
  ) {
    return "Tanks & Rebuildables";
  }

  // 6. Accessories
  if (
    type === "charger" ||
    type === "battery" ||
    type === "accessory" ||
    type === "diy kit" ||
    type === "cleaners"
  ) {
    return "Accessories & Hardware";
  }

  // 7. E-Liquid (Largest category: salt nic, freebase)
  if (
    type === "e-liquid" ||
    title.includes("salt") ||
    title.includes("e-liquid") ||
    title.includes("ejuice") ||
    title.includes("30ml") ||
    title.includes("60ml") ||
    title.includes("100ml") ||
    title.includes("120ml") ||
    tagStr.includes("nic salt") ||
    tagStr.includes("e-liquid")
  ) {
    return "E-Liquids & Nic Salts";
  }

  // Default fallback
  return "E-Liquids & Nic Salts";
}

async function ensureCategories() {
  console.log("Setting up categories in Supabase...");
  const { data: existing, error: fetchErr } = await supabase.from("categories").select("*");
  if (fetchErr) {
    console.error("Error fetching existing categories:", fetchErr);
  }

  const categoryMap = new Map(); // name -> id
  if (existing) {
    for (const c of existing) {
      categoryMap.set(c.name.toLowerCase(), c.id);
    }
  }

  for (const target of TARGET_CATEGORIES) {
    const existingId = categoryMap.get(target.name.toLowerCase());
    if (existingId) {
      categoryMap.set(target.name, existingId);
      continue;
    }

    // Check if close match exists (e.g. "Pod Systems" -> "Pod Kits")
    let matchedId = null;
    for (const [name, id] of categoryMap.entries()) {
      if (name.includes("pod") && target.name.includes("Pod")) matchedId = id;
      else if (name.includes("disposable") && target.name.includes("Disposable")) matchedId = id;
      else if (name.includes("nicotine") && target.name.includes("E-Liquid")) matchedId = id;
      else if (name.includes("coil") && target.name.includes("Coil")) matchedId = id;
    }

    if (matchedId) {
      // Update name to target
      await supabase.from("categories").update({ name: target.name, description: target.description }).eq("id", matchedId);
      categoryMap.set(target.name, matchedId);
      console.log(`Updated category ${target.name} (id: ${matchedId})`);
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from("categories")
        .insert({
          name: target.name,
          description: target.description
        })
        .select()
        .single();
      if (insErr) {
        console.error(`Error inserting category ${target.name}:`, insErr);
      } else if (inserted) {
        categoryMap.set(target.name, inserted.id);
        console.log(`Created new category ${target.name} (id: ${inserted.id})`);
      }
    }
  }

  return categoryMap;
}

async function fetchAllProducts() {
  const allProducts = [];
  let page = 1;

  while (true) {
    console.log(`Fetching VapeMall.pk products page ${page}...`);
    try {
      const res = await fetch(`https://vapemall.pk/products.json?limit=250&page=${page}`);
      if (!res.ok) {
        console.warn(`Page ${page} returned status ${res.status}`);
        break;
      }
      const data = await res.json();
      if (!data.products || data.products.length === 0) {
        console.log(`No more products on page ${page}. Finished.`);
        break;
      }
      allProducts.push(...data.products);
      console.log(`Fetched ${data.products.length} products (Total so far: ${allProducts.length})`);
      if (data.products.length < 250) break;
      page++;
      // Brief pause between pages to be respectful
      await new Promise((r) => setTimeout(r, 400));
    } catch (e) {
      console.error(`Error fetching page ${page}:`, e);
      break;
    }
  }

  return allProducts;
}

async function run() {
  console.log("=== VAPEMALL.PK FULL EXTRACTION & POPULATION ===");
  const categoryMap = await ensureCategories();
  console.log("Resolved category mappings:", Object.fromEntries(categoryMap.entries()));

  const rawProducts = await fetchAllProducts();
  console.log(`\nSuccessfully downloaded ${rawProducts.length} raw products from VapeMall.pk!`);

  // Transform products
  const formattedProducts = [];
  const categoryCounts = {};

  for (const raw of rawProducts) {
    const targetCatName = mapCategoryName(raw);
    const catId = categoryMap.get(targetCatName) || null;
    categoryCounts[targetCatName] = (categoryCounts[targetCatName] || 0) + 1;

    const primaryVariant = (raw.variants && raw.variants[0]) || {};
    const primaryImage = (raw.images && raw.images[0] && raw.images[0].src) || null;

    let price = parseFloat(primaryVariant.price);
    if (isNaN(price) || price <= 0) price = 2500;

    const stock = primaryVariant.available ? 50 : 0;
    const title = cleanTitle(raw.title);
    const description = cleanDescription(raw.body_html);
    const sku = primaryVariant.sku || `ASH-${raw.id}`;
    const id = toUUID(raw.id);

    formattedProducts.push({
      id,
      category_id: catId,
      name: title,
      sku,
      description,
      price,
      stock,
      image_url: primaryImage,
      categories: { name: targetCatName }
    });
  }

  console.log("\nProducts Breakdown by Target Category:");
  console.table(categoryCounts);

  // 1. Save full JSON cache locally
  const dataDir = "./src/data";
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(`${dataDir}/products.json`, JSON.stringify(formattedProducts, null, 2));
  console.log(`\nSaved ${formattedProducts.length} products to ${dataDir}/products.json (${(fs.statSync(`${dataDir}/products.json`).size / 1024 / 1024).toFixed(2)} MB)`);

  // 2. Batch insert into Supabase
  console.log("\nBatch inserting into Supabase 'products' table...");
  const BATCH_SIZE = 100;
  let insertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < formattedProducts.length; i += BATCH_SIZE) {
    const chunk = formattedProducts.slice(i, i + BATCH_SIZE).map(p => ({
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      sku: p.sku,
      description: p.description,
      price: p.price,
      stock: p.stock,
      image_url: p.image_url,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from("products").upsert(chunk, { onConflict: "id" });
    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error.message);
      errorCount += chunk.length;
    } else {
      insertedCount += chunk.length;
      process.stdout.write(`\rInserted/Updated: ${insertedCount} / ${formattedProducts.length} products...`);
    }
  }

  console.log(`\n\nDatabase sync completed!`);
  console.log(`- Total Success: ${insertedCount}`);
  console.log(`- Total Errors: ${errorCount}`);
}

run().catch(console.error);

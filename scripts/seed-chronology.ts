import { MongoClient } from "mongodb";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv();

const DB_NAME = "kaklong-debt";
const CHRONOLOGY_COLLECTION = "chronology";

interface ChronologySeed {
  title: string;
  date: string;
  time?: string;
  location: string;
  description: string;
  category: string;
  attachments: [];
  createdAt: string;
  updatedAt: string;
}

const events: ChronologySeed[] = [
  {
    title: "Perkenalan di Facebook Dating",
    date: "2024-05-05",
    location: "",
    description:
      "Kami mula kenal daripada Facebook (FB) Dating setelah 'matched'. Daripada 'chat' di FB Dating, Defendan meminta untuk sambung perbualan di aplikasi Telegram. Kemudian, kami saling perkenalkan diri dalam perbualan 'online call' di aplikasi tersebut. Dia mendakwa dengan memperkenalkan dirinya sebagai orang yang bekerja di Depot Pertahanan Sg. Buloh dan mengurus 'events', bukan 'askar biasa' seperti di ATM. Dia juga mendakwa dirinya sebagai seorang duda dan mempunyai seorang anak, serta tidak mahu memberitahu punca perceraian.",
    category: "communication",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Pemindahan Wang RM20",
    date: "2024-05-06",
    location: "",
    description:
      "Memindahkan duit RM20 melalui QR, daripada akaun MAE (semasa) saya. (Tiada 'remark', tidak ingat sebab pemindahan wang)",
    category: "payment",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Defendan Jalani Pembedahan ACL",
    date: "2024-05-08",
    location: "KPJ",
    description:
      "Defendan memaklumkan bahawa dia menjalani pembedahan ACL di KPJ, dan dia mendakwa bahawa dia sedang menunggu duit Perkeso lebih kurang RM30,000. Dia juga mendakwa bahawa dia menjalani beberapa sesi fisioterapi. Di Telegram, saya menasihati dia selesaikan hutang dan sebagainya.",
    category: "incident",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Pemindahan Wang RM120",
    date: "2024-05-10",
    location: "",
    description:
      "Saya memindahkan wang RM120 kepada Defendan melalui QR. Tiada 'remark'. Tidak ingat sebab pemindahan wang.",
    category: "payment",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Kos Pembedahan ACL",
    date: "2024-05-10",
    location: "",
    description:
      "Saya ada menyimpan dakwaan daripada Defendan iaitu kos pembedahan ACL ialah +- RM40,000. +- RM30,000 daripada kos tersebut dibayar oleh insurans, +- RM7,000 dibayar sendiri.",
    category: "incident",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Perbualan Mengenai Insuran KPJ",
    date: "2024-05-10",
    location: "",
    description:
      "Perbualan mengenai insuran di KPJ",
    category: "communication",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Pelbagai Transaksi kepada Defendan",
    date: "2024-05-06",
    location: "",
    description:
      "Banyak transaksi telah dilakukan kepada Defendan. Selalunya transaksi dilakukan sebab Defendan ingin meminjam duit dan berjanji untuk bayar semula. (Transaksi berlaku dalam tempoh 6 - 12 Mei 2024)",
    category: "payment",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Permintaan Bayaran Semula",
    date: "2024-05-14",
    location: "",
    description:
      "Mungkin saya meminta bayaran semula daripada Defendan, tapi dia mendakwa bahawa dia menunggu duit KWSP (EPF) masuk.",
    category: "communication",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Pengenalan Sistem Cashout",
    date: "2024-05-14",
    location: "",
    description:
      "Defendan memperkenalkan sistem 'cashout' untuk memperoleh wang melalui hutang BNPL secara berperingkat. Saya memperoleh maklumat mengenai 'cashout' daripada nombor telefon WhatsApp agen 'cashout' dalam perbualan kami di Telegram. Agen bernama Alia.",
    category: "payment",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Memberi QR Maybank untuk Bayaran",
    date: "2024-05-14",
    location: "",
    description:
      "Saya memberi Defendan gambar QR akaun Maybank saya untuk dia membayar balik hutang dia dengan saya.",
    category: "payment",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Pemindahan Wang RM10",
    date: "2024-05-14",
    location: "",
    description:
      "Pemindahan RM10 kepada Defendan, tidak ingat sebab pemindahan. Duit tersebut dikeluarkan dari Tabung Maybank saya.",
    category: "payment",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Pemindahan Duit Cashout kepada Defendan",
    date: "2024-05-14",
    location: "",
    description:
      "Pemindahan keseluruhan duit 'cashout' daripada Alia, agen 'cashout' (AJ STREET EMPIRE) kepada Defendan. RM510 from 'cashout', RM90 upah agen 'cashout'.",
    category: "payment",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Kereta Defendan Di-Towing",
    date: "2024-06-01",
    location: "",
    description:
      "Defendan memberi gambar melalui Telegram bahawa keretanya dibawa oleh lori 'towing' dan mendakwa bahawa keretanya rosak.",
    category: "incident",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Cadangan Guna SPayLater",
    date: "2024-06-02",
    location: "",
    description:
      "Mungkin Defendan nak pinjam duit, tapi menggunakan 'cashout'. Dalam perbualan Telegram, saya mencadangkan dia untuk menggunakan SPayLater saya.",
    category: "payment",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection(CHRONOLOGY_COLLECTION);

  const existing = await collection.countDocuments();
  console.log(`Existing events: ${existing}`);

  const result = await collection.deleteMany({});
  console.log(`Deleted ${result.deletedCount} existing events`);

  const insertResult = await collection.insertMany(events);
  console.log(`Inserted ${insertResult.insertedCount} events`);

  await client.close();
  console.log("Done!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

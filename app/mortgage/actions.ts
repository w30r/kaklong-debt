"use server";

import clientPromise from "@/lib/mongodb";
import { MortgageMonth, MemberContribution, MONTHLY_TARGET } from "@/types/mortgage";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

const DB_NAME = "kaklong-debt";
const MONTHS_COLLECTION = "mortgage_months";
const CONTRIBUTIONS_COLLECTION = "mortgage_contributions";

export async function getMortgageMonths(): Promise<MortgageMonth[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const months = await db
      .collection(MONTHS_COLLECTION)
      .find({})
      .sort({ year: -1, month: -1 })
      .toArray();
    return months.map((m) => ({ ...m, _id: m._id.toString() })) as MortgageMonth[];
  } catch (error) {
    console.error("Failed to fetch mortgage months:", error);
    return [];
  }
}

export async function getAllContributions(): Promise<MemberContribution[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const contribs = await db
      .collection(CONTRIBUTIONS_COLLECTION)
      .find({})
      .sort({ year: -1, month: -1 })
      .toArray();
    return contribs.map((c) => ({ ...c, _id: c._id.toString() })) as MemberContribution[];
  } catch (error) {
    console.error("Failed to fetch contributions:", error);
    return [];
  }
}

async function recalculateMonth(year: number, month: number) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const contribs = await db
    .collection(CONTRIBUTIONS_COLLECTION)
    .find({ year, month })
    .toArray();

  const totalCollected = contribs.reduce((sum, c) => sum + c.amountPaid, 0);
  const extraAmount = Math.max(0, totalCollected - MONTHLY_TARGET);

  const monthDoc = await db.collection(MONTHS_COLLECTION).findOne({ year, month });
  if (monthDoc) {
    await db.collection(MONTHS_COLLECTION).updateOne(
      { _id: monthDoc._id },
      { $set: { totalCollected, extraAmount, updatedAt: new Date().toISOString() } }
    );
  }

  revalidatePath("/mortgage");
}

export async function addContribution(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const memberName = formData.get("memberName") as string;
    const year = parseInt(formData.get("year") as string);
    const month = parseInt(formData.get("month") as string);
    const amountPaid = parseFloat(formData.get("amountPaid") as string);

    if (!memberName || isNaN(year) || isNaN(month) || isNaN(amountPaid) || amountPaid <= 0) {
      return { success: false, error: "Invalid input data" };
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const monthExists = await db.collection(MONTHS_COLLECTION).findOne({ year, month });
    if (!monthExists) {
      await db.collection(MONTHS_COLLECTION).insertOne({
        year,
        month,
        monthlyAmount: MONTHLY_TARGET,
        isPaidToBank: false,
        paidDate: null,
        totalCollected: 0,
        extraAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const existing = await db.collection(CONTRIBUTIONS_COLLECTION).findOne({ memberName, year, month });
    if (existing) {
      await db.collection(CONTRIBUTIONS_COLLECTION).updateOne(
        { _id: existing._id },
        { $set: { amountPaid, paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() } }
      );
    } else {
      await db.collection(CONTRIBUTIONS_COLLECTION).insertOne({
        memberName,
        year,
        month,
        amountPaid,
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await recalculateMonth(year, month);
    return { success: true };
  } catch (error) {
    console.error("Failed to add contribution:", error);
    return { success: false, error: "Failed to save contribution" };
  }
}

export async function togglePaidToBank(
  year: number,
  month: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const monthDoc = await db.collection(MONTHS_COLLECTION).findOne({ year, month });
    if (!monthDoc) {
      return { success: false, error: "Month not found" };
    }

    if (!monthDoc.isPaidToBank && monthDoc.totalCollected < MONTHLY_TARGET) {
      return { success: false, error: `Total collected (RM ${monthDoc.totalCollected}) is less than RM ${MONTHLY_TARGET}` };
    }

    await db.collection(MONTHS_COLLECTION).updateOne(
      { year, month },
      {
        $set: {
          isPaidToBank: !monthDoc.isPaidToBank,
          paidDate: monthDoc.isPaidToBank ? null : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
    );

    revalidatePath("/mortgage");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle paid to bank:", error);
    return { success: false, error: "Failed to update month" };
  }
}

export async function deleteContribution(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const contrib = await db.collection(CONTRIBUTIONS_COLLECTION).findOne({ _id: new ObjectId(id) });
    if (!contrib) {
      return { success: false, error: "Contribution not found" };
    }

    await db.collection(CONTRIBUTIONS_COLLECTION).deleteOne({ _id: new ObjectId(id) });

    await recalculateMonth(contrib.year, contrib.month);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete contribution:", error);
    return { success: false, error: "Failed to delete contribution" };
  }
}

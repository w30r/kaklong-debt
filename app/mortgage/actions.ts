"use server";

import clientPromise from "@/lib/mongodb";
import { MortgageMonth, MemberContribution, MONTHLY_TARGET, REGULAR_MEMBERS, REGULAR_SHARE, CURRENT_OUTSTANDING, buildAmortizationSchedule, findPaymentsMade } from "@/types/mortgage";
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

export async function backfillMortgageHistory(): Promise<{
  success: boolean;
  monthsCreated: number;
  error?: string;
}> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const existingCount = await db.collection(MONTHS_COLLECTION).countDocuments();
    if (existingCount > 1) {
      return { success: false, monthsCreated: 0, error: "History already populated" };
    }

    const schedule = buildAmortizationSchedule();
    const paymentsMade = findPaymentsMade(schedule, CURRENT_OUTSTANDING);

    const currentYear = 2026;
    const currentMonth = 5;
    const totalMonthIndex = currentYear * 12 + currentMonth;
    const firstMonthIndex = totalMonthIndex - paymentsMade + 1;

    const startYear = Math.floor((firstMonthIndex - 1) / 12);
    const startMonth = ((firstMonthIndex - 1) % 12) + 1;

    let monthsCreated = 0;

    for (let i = 0; i < paymentsMade; i++) {
      const y = startYear + Math.floor((startMonth + i - 1) / 12);
      const m = ((startMonth + i - 1) % 12) + 1;

      const existingMonth = await db
        .collection(MONTHS_COLLECTION)
        .findOne({ year: y, month: m });
      if (existingMonth) continue;

      const paidDate = new Date(y, m - 1, 15, 12, 0, 0).toISOString();

      await db.collection(MONTHS_COLLECTION).insertOne({
        year: y,
        month: m,
        monthlyAmount: MONTHLY_TARGET,
        isPaidToBank: true,
        paidDate,
        totalCollected: MONTHLY_TARGET,
        extraAmount: 0,
        createdAt: paidDate,
        updatedAt: paidDate,
      });

      for (let mi = 0; mi < REGULAR_MEMBERS.length; mi++) {
        const memberPaidDate = new Date(
          y,
          m - 1,
          14 + (mi + 1),
          10,
          0,
          0
        ).toISOString();
        await db.collection(CONTRIBUTIONS_COLLECTION).insertOne({
          memberName: REGULAR_MEMBERS[mi],
          year: y,
          month: m,
          amountPaid: REGULAR_SHARE,
          paidAt: memberPaidDate,
          createdAt: memberPaidDate,
          updatedAt: memberPaidDate,
        });
      }

      monthsCreated++;
    }

    revalidatePath("/mortgage");
    return { success: true, monthsCreated };
  } catch (error) {
    console.error("Failed to backfill history:", error);
    return { success: false, monthsCreated: 0, error: "Failed to backfill history" };
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

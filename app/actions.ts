"use server";

import clientPromise from "@/lib/mongodb";
import { BankDebt } from "@/types/bank-debt";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

const DB_NAME = "kaklong-debt";
const COLLECTION_NAME = "debts";

export async function getDebts(): Promise<BankDebt[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const debts = await db
      .collection(COLLECTION_NAME)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return debts.map((debt) => ({
      ...debt,
      _id: debt._id.toString(),
    })) as BankDebt[];
  } catch (error) {
    console.error("Failed to fetch debts:", error);
    return [];
  }
}

export async function addDebt(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const bank = formData.get("bank") as string;
    const type = formData.get("type") as string;
    const totalAmount = parseFloat(formData.get("totalAmount") as string);
    const outstanding = parseFloat(formData.get("outstanding") as string);
    const monthlyPayment = parseFloat(formData.get("monthlyPayment") as string);
    const interestRate = parseFloat(formData.get("interestRate") as string);
    const nextPaymentDate = formData.get("nextPaymentDate") as string;

    if (!bank || !type || isNaN(outstanding)) {
      return {
        success: false,
        error: "Bank, type, and outstanding amount are required",
      };
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const newDebt: Omit<BankDebt, "_id"> = {
      bank,
      type,
      totalAmount: isNaN(totalAmount) ? 0 : totalAmount,
      outstanding,
      monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
      interestRate: isNaN(interestRate) ? 0 : interestRate,
      nextPaymentDate,
      status: "up-to-date",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection(COLLECTION_NAME).insertOne(newDebt);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to add debt:", error);
    return { success: false, error: "Failed to add debt" };
  }
}

export async function updateDebt(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const updateData: Partial<BankDebt> = {
      bank: formData.get("bank") as string,
      type: formData.get("type") as string,
      totalAmount: parseFloat(formData.get("totalAmount") as string) || 0,
      outstanding: parseFloat(formData.get("outstanding") as string) || 0,
      monthlyPayment: parseFloat(formData.get("monthlyPayment") as string) || 0,
      interestRate: parseFloat(formData.get("interestRate") as string) || 0,
      nextPaymentDate: formData.get("nextPaymentDate") as string,
      status: formData.get("status") as BankDebt["status"],
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection(COLLECTION_NAME)
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update debt:", error);
    return { success: false, error: "Failed to update debt" };
  }
}

export async function markAsPaidOff(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          outstanding: 0,
          monthlyPayment: 0,
          nextPaymentDate: "—",
          status: "paid-off",
          updatedAt: new Date().toISOString(),
        },
      },
    );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark debt as paid off:", error);
    return { success: false, error: "Failed to update debt" };
  }
}

export async function deleteDebt(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete debt:", error);
    return { success: false, error: "Failed to delete debt" };
  }
}

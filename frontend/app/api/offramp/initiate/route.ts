
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, beneficiary_id, wallet_id } = body;

    // TODO: The asset is not being collected from the user.
    // For now, we'll hardcode the asset.
    const asset = "base:usdc";

    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offramp/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet_id,
        amount,
        beneficiary_id,
        asset,
      }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: data.message, error: data.error },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({ message: data.message, data: data.data });
  } catch (error: any) {
    return NextResponse.json(
      { message: "An unexpected error occurred.", error: error.message },
      { status: 500 }
    );
  }
}

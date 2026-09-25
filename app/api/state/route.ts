import { NextResponse } from "next/server";
import {
  StorageNotConfiguredError,
  countListings,
  deleteListing,
  putListing,
  readState,
  restoreDemoListings,
  writeSettings,
} from "@/lib/server/db";
import type { Listing } from "@/lib/types";
import { MAX_LISTINGS, parseListingInput, parseSettings } from "@/lib/validate";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function errorResponse(error: unknown) {
  // Not an error for the client: it switches to saving on the device.
  if (error instanceof StorageNotConfiguredError) {
    return NextResponse.json({ configured: false }, { headers: NO_STORE });
  }
  console.error("[api/state]", error);
  return NextResponse.json({ error: "storage-error" }, { status: 500, headers: NO_STORE });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400, headers: NO_STORE });
}

export async function GET() {
  try {
    return NextResponse.json(await readState(), { headers: NO_STORE });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("invalid-json");
  }
  if (typeof body !== "object" || body === null) return badRequest("invalid-body");
  const op = body as Record<string, unknown>;

  try {
    switch (op.type) {
      case "add": {
        const input = parseListingInput(op.listing);
        if (!input || typeof op.id !== "string" || op.id.length === 0 || op.id.length > 64 || op.id.startsWith("demo-")) {
          return badRequest("invalid-listing");
        }
        if ((await countListings()) >= MAX_LISTINGS) return badRequest("too-many-listings");
        const listing: Listing = { ...input, id: op.id, createdAt: Date.now() };
        await putListing(listing);
        break;
      }
      case "remove": {
        if (typeof op.id !== "string") return badRequest("invalid-id");
        await deleteListing(op.id);
        break;
      }
      case "settings": {
        await writeSettings(parseSettings(op.settings));
        break;
      }
      case "restoreDemos": {
        await restoreDemoListings();
        break;
      }
      default:
        return badRequest("unknown-operation");
    }
    return NextResponse.json(await readState(), { headers: NO_STORE });
  } catch (error) {
    return errorResponse(error);
  }
}

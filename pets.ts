import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { MutationCtx } from "./_generated/server";

// ── Helper ──────────────────────────────────────────────────────────────────
async function requireAdminSession(ctx: MutationCtx, sessionToken: string) {
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    if (session) await ctx.db.delete(session._id); // lazy cleanup
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Admin session expired or invalid. Please log in again." });
  }
}

// ── Queries (read-only — admin page is already behind the session check on the frontend) ──
export const getAllPets = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pets").order("desc").collect();
  },
});

export const getPetById = query({
  args: { id: v.id("pets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const searchPets = query({
  args: {
    searchTerm: v.optional(v.string()),
    petType: v.optional(v.union(v.literal("dog"), v.literal("cat"), v.literal("other"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    let pets = await ctx.db.query("pets").order("desc").collect();

    if (args.petType && args.petType !== "all") {
      pets = pets.filter(pet => pet.petType === args.petType);
    }

    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const term = args.searchTerm.toLowerCase().trim();
      pets = pets.filter(pet =>
        pet.petName.toLowerCase().includes(term) ||
        pet.ownerName.toLowerCase().includes(term) ||
        pet.phoneNumber.includes(term)
      );
    }

    return pets;
  },
});

export const getPetsWithDueItems = query({
  args: {},
  handler: async (ctx) => {
    const pets = await ctx.db.query("pets").collect();
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return pets.filter(pet => {
      if (pet.followUpDate) {
        const followUpDate = new Date(pet.followUpDate);
        if (followUpDate >= now && followUpDate <= oneWeekFromNow) return true;
      }
      if (pet.vaccines && pet.vaccines.length > 0) {
        for (const vaccine of pet.vaccines) {
          const vaccineDate = new Date(vaccine.date);
          if (vaccineDate >= now && vaccineDate <= oneWeekFromNow) return true;
        }
      }
      return false;
    });
  },
});

// ── Validators ───────────────────────────────────────────────────────────────
const paymentValidator = v.object({
  description: v.string(),
  amount: v.number(),
  status: v.union(v.literal("paid"), v.literal("unpaid")),
  date: v.string(),
});

const vaccineValidator = v.object({
  name: v.string(),
  date: v.string(),
});

// ── Mutations (session token required) ───────────────────────────────────────
export const createPet = mutation({
  args: {
    sessionToken: v.string(),
    petName: v.string(),
    ownerName: v.string(),
    phoneNumber: v.string(),
    dateOfBirth: v.optional(v.string()),
    age: v.optional(v.string()),
    petType: v.union(v.literal("dog"), v.literal("cat"), v.literal("other")),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    breed: v.optional(v.string()),
    vaccines: v.optional(v.array(vaccineValidator)),
    medication: v.optional(v.string()),
    drNote: v.optional(v.string()),
    followUpDate: v.optional(v.string()),
    payments: v.optional(v.array(paymentValidator)),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);
    const { sessionToken: _, ...petData } = args;
    return await ctx.db.insert("pets", petData);
  },
});

export const updatePet = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("pets"),
    petName: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    age: v.optional(v.string()),
    petType: v.optional(v.union(v.literal("dog"), v.literal("cat"), v.literal("other"))),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    breed: v.optional(v.string()),
    vaccines: v.optional(v.array(vaccineValidator)),
    medication: v.optional(v.string()),
    drNote: v.optional(v.string()),
    followUpDate: v.optional(v.string()),
    payments: v.optional(v.array(paymentValidator)),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);
    const { sessionToken: _, id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
    return await ctx.db.get(id);
  },
});

export const deletePet = mutation({
  args: { sessionToken: v.string(), id: v.id("pets") },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);
    const pet = await ctx.db.get(args.id);
    if (!pet) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Pet not found." });
    }
    await ctx.db.delete(args.id);
  },
});

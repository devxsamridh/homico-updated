import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildLayout, type PlannedFloor } from "@/lib/floorplan-layout";

export type { RoomType, Opening, PlannedRoom, PlannedFloor } from "@/lib/floorplan-layout";

const PlannerInput = z.object({
  plotLength: z.number().positive(),
  plotWidth: z.number().positive(),
  facing: z.enum(["North", "South", "East", "West"]),
  plotType: z.enum(["Corner", "Regular", "Irregular"]),
  floors: z.number().int().min(1).max(5),
  bedrooms: z.number().int().min(0).max(10),
  bathrooms: z.number().int().min(0).max(10),
  livingRooms: z.number().int().min(0).max(5),
  kitchen: z.number().int().min(0).max(3),
  diningRoom: z.number().int().min(0).max(3),
  balcony: z.number().int().min(0).max(6),
  parking: z.number().int().min(0).max(6),
  poojaRoom: z.number().int().min(0).max(2),
  homeOffice: z.number().int().min(0).max(3),
  storeRoom: z.number().int().min(0).max(3),
  utilityRoom: z.number().int().min(0).max(3),
  garden: z.boolean(),
  style: z.enum(["Modern", "Contemporary", "Traditional", "Luxury", "Minimal"]),
  budget: z.enum(["Economy", "Standard", "Premium", "Luxury"]),
  familySize: z.number().int().min(1).max(20),
  priority: z.enum([
    "Maximum Space",
    "Better Ventilation",
    "Natural Lighting",
    "Vastu Friendly",
    "Modern Design",
  ]),
});

export type PlannerInputType = z.infer<typeof PlannerInput>;

export interface PlannerResult {
  summary: string;
  builtUpArea: string;
  estimatedCost: string;
  timeline: string;
  floorPlan: PlannedFloor[];
  materials: Array<{ item: string; quantity: string }>;
  elevation: string[];
  doorsWindows: string[];
  tips: string[];
}

export const generateHomePlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }): Promise<PlannerResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    // Geometry is generated deterministically so rooms never overlap or float.
    const floorPlan = buildLayout(data);
    const builtUp = floorPlan.reduce((s, f) => s + f.widthFt * f.lengthFt, 0);

    const prompt = `You are an expert Indian residential architect. A scaled floor plan has already been drafted. Write the accompanying project report and return ONLY strict JSON:

{
  "summary": string,            // 2-3 sentences about this specific home
  "builtUpArea": string,        // e.g. "1,860 sq ft"
  "estimatedCost": string,      // INR range, e.g. "₹32L – ₹38L"
  "timeline": string,           // e.g. "8-10 months"
  "materials": Array<{ "item": string, "quantity": string }>,  // 8-12 key items
  "elevation": string[],        // 3 short front elevation ideas
  "doorsWindows": string[],     // 3 door/window recommendations
  "tips": string[]              // 4-6 short design tips
}

Project data:
- Plot: ${data.plotLength}ft x ${data.plotWidth}ft (${data.plotLength * data.plotWidth} sq ft), facing ${data.facing}, ${data.plotType}
- Floors: ${data.floors}; total built-up approx ${Math.round(builtUp)} sq ft
- Rooms: ${data.bedrooms} bed, ${data.bathrooms} bath, ${data.livingRooms} living, ${data.kitchen} kitchen, ${data.diningRoom} dining, ${data.balcony} balcony, ${data.parking} parking, ${data.poojaRoom} pooja, ${data.homeOffice} office, ${data.storeRoom} store, ${data.utilityRoom} utility
- Garden: ${data.garden ? "Yes" : "No"}
- Style: ${data.style}, Budget: ${data.budget}, Family: ${data.familySize}, Priority: ${data.priority}

Respond with ONLY the JSON object, no markdown.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: [
          { role: "system", content: "You output only valid JSON. No markdown fences." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("AI is busy right now. Please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
      throw new Error(`AI request failed: ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: Partial<PlannerResult>;
    try {
      parsed = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      throw new Error("AI returned an invalid response. Please retry.");
    }

    return {
      summary: parsed.summary ?? "A functional, well-ventilated home laid out for your family's needs.",
      builtUpArea: parsed.builtUpArea ?? `${Math.round(builtUp).toLocaleString("en-IN")} sq ft`,
      estimatedCost: parsed.estimatedCost ?? "—",
      timeline: parsed.timeline ?? "8-10 months",
      floorPlan,
      materials: Array.isArray(parsed.materials) ? parsed.materials : [],
      elevation: Array.isArray(parsed.elevation) ? parsed.elevation : [],
      doorsWindows: Array.isArray(parsed.doorsWindows) ? parsed.doorsWindows : [],
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
    };
  });

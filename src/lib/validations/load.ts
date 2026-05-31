import { z } from "zod";

export const SHIPMENT_TYPES = ["freight", "last_mile"] as const;

export const loadSchema = z.object({
  shipmentType: z.enum(SHIPMENT_TYPES),

  shipperId: z.string().uuid("Please select a shipper").optional(),

  originCity:     z.string().min(1, "Origin city required"),
  originState:    z.string().min(1, "Origin state required"),
  originPostcode: z.string().min(2, "Origin postcode required"),
  originAddress:  z.string().min(5, "Origin address required"),

  destinationCity:     z.string().min(1, "Destination city required"),
  destinationState:    z.string().min(1, "Destination state required"),
  destinationPostcode: z.string().min(2, "Destination postcode required"),
  destinationAddress:  z.string().min(5, "Destination address required"),

  cargoDescription: z.string().min(3, "Cargo description required"),

  weightKg: z.coerce.number().positive("Must be positive").optional(),
  pieces:   z.coerce.number().int().positive("Must be positive").optional(),

  estimatedPickupDate:   z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),

  quotedPrice: z.coerce.number().min(0, "Must be 0 or more").optional(),

  referenceNumber:     z.string().optional(),
  specialInstructions: z.string().optional(),
});

export type LoadFormValues = z.infer<typeof loadSchema>;

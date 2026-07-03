import { redirect } from "next/navigation";

export default function ShipperCreateLoadPage() {
  redirect("/shipper/loads?create=true");
}

import { useParams } from "@solidjs/router";
import { LayoutHeader } from "~/component/layout/Layout";

export default function Place() {
  const params = useParams();

  return (
    <div>
      <LayoutHeader title="Place Details" />
      <h2>Place ID: {params.id}</h2>
    </div>
  );
}

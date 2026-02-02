import { useNavigate, useParams } from "@solidjs/router"
import { createEffect, createMemo, createResource } from "solid-js"
import usePlaces from '../hooks/usePlaces'
import usePhoton from "../hooks/usePhoton";
import { Header } from '../components/Layout.jsx'
import X from 'lucide-solid/icons/x'
import useMap from "../hooks/useMap.js";
import { useSheet } from "../context/SheetProvider.jsx";

export default function Place() {
  const map = useMap();
  const sheet = useSheet()
  const params = useParams();
  const { getPlaceCache, getPlaceName, getPlaceAddress, decodePlaceId } = usePlaces()
  const { reverseResult } = usePhoton();
  const navigate = useNavigate()

  const cached = createMemo(() => getPlaceCache(params.id));


  const [fetchedPlace] = createResource(
    () => cached() ? null : params.id,
    async (id) => {
      const data = await reverseResult(id);
      return data;
    }
  );


  const place = createMemo(() => cached() ?? fetchedPlace())

  createEffect(() => {
    const { lat, lng } = decodePlaceId(params.id)
    sheet.snapTo(1)
    map.flyTo(lng, lat, -200)
    map.addMarker(lng, lat)
  })

  return (
    <Show when={place()}>
      <Header>
        <nav class="flex justify-between items-center">
          <h1>{getPlaceName(place())}</h1>
          <button onClick={() => navigate(-1)}><X class="w-5 h-5 text-neutral-500" /></button>
        </nav>
      </Header>
      <p class="text-neutral-500">{getPlaceAddress(place())}</p>
      <div className="flex gap-3">
        <button className="p-4 w-full dark:bg-neutral-800/50 bg-neutral-100 rounded-xl">Saved</button>
        <button className="p-4 w-full dark:bg-neutral-800/50 bg-neutral-100 rounded-xl">Itinerary</button>
      </div>
    </Show>
  )
}

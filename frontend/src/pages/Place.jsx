import { useNavigate, useParams } from "@solidjs/router"
import { createEffect, Show } from "solid-js"
import { getPlaceName, getPlaceAddress, decodePlaceId, usePlaceById } from "../hooks/places";
import { Header } from '../components/Layout.jsx'
import X from 'lucide-solid/icons/x'
import useMap from "../hooks/useMap.js";
import { useSheet } from "../context/SheetProvider.jsx";

export default function Place() {
  const map = useMap();
  const sheet = useSheet()
  const params = useParams();
  const place = usePlaceById(() => params.id)
  const navigate = useNavigate()



  createEffect(() => {
    const { lat, lng } = decodePlaceId(params.id)
    sheet.snapTo(1)
    map.flyTo(lng, lat, -200)
    map.addMarker(lng, lat)
  })

  const Button = (props) => {
    return <button {...props} className="p-4 w-full dark:bg-neutral-800/50 bg-neutral-100 rounded-xl">{props.children}</button>
  }

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
        <Button>Saved</Button>
        <Button onClick={() => navigate(`/direction?to=${params.id}`)}>Direction</Button>
      </div>
    </Show>
  )
}

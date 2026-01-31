import { useNavigate, useParams } from "@solidjs/router"
import { createMemo, createResource } from "solid-js"
import usePlaces from '../hooks/usePlaces'
import usePhoton from "../hooks/usePhoton";
import { Header } from '../components/Layout.jsx'
import X from 'lucide-solid/icons/x'

export default function Place() {
  const params = useParams();
  const { getCache, addCache, parseId, getPlaceName, getPlaceAddress } = usePlaces()
  const { reverseResult } = usePhoton();
  const navigate = useNavigate()

  const cached = createMemo(() => getCache(params.id));


  const [place] = createResource(
    () => cached() ? null : params.id,
    async (id) => {
      const data = await reverseResult(parseId(id));
      addCache(data.features[0]);
      return data;
    }
  );


  const resolvedPlace = createMemo(() => cached() ?? place())

  return (
    <Show when={resolvedPlace()}>
      <Header>
        <nav class="flex justify-between items-center">
          <h1>{getPlaceName(resolvedPlace())}</h1>
          <button onClick={() => navigate(-1)}><X /></button>
        </nav>
      </Header>

      <p class="text-neutral-500">{getPlaceAddress(resolvedPlace())}</p>
    </Show>
  )
}

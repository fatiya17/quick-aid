import DisasterMap from "@/components/DisasterMap";
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';

export default function InteractiveMapPage() {
  return <DisasterMap />;
}

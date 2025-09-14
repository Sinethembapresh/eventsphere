import Gallery from "./gallery";
import { withAuth } from "@/middleware/withAuth";

function GalleryPage() {
  return <Gallery />;
}

export default withAuth(GalleryPage);

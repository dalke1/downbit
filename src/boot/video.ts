import { boot } from "quasar/wrappers";
import VueVideoPlayer from '@videojs-player/vue'
import 'video.js/dist/video-js.css'



export default boot(({ app }) => {
  app.use(VueVideoPlayer)
});

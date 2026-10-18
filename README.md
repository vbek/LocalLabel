# LocalLabel

A CVAT-style image and video annotation tool that runs entirely inside Chrome as an extension. Open a folder from your disk, label it, export standard dataset formats. No server, no upload, no account.

## Try it now (unpacked)

1. Open `chrome://extensions` and switch on **Developer mode** (top right).
2. Click **Load unpacked** and pick this folder (the one containing `manifest.json`).
3. Click the LocalLabel icon in the toolbar. The app opens in a tab.
4. Click **Open folder**, choose a folder of images and/or videos, add a label, and start drawing.

## Features

| Area | What you get |
| --- | --- |
| Media | Images (jpg, png, webp, bmp, gif, avif, **tif/tiff**) and videos Chrome can decode (mp4/H.264, webm, mov). Folders are scanned recursively. |
| Shapes | Rectangle (with rotation), polygon, polyline, points, ellipse, skeleton (keypoints with edges), pixel masks (brush, eraser, polygon → mask). |
| Freehand | With the polygon or polyline tool, hold **Shift** and move the mouse to trace (no click or button needed); **releasing Shift completes the shape**. You can also click some points first, then hold Shift to trace the rest. Traces are smoothed of sub-pixel jitter. |
| Editing | Move, resize, rotate, vertex drag, add vertex (double-click an edge), remove vertex (Alt+click), z-order, hide, lock, occluded, copy/paste, unlimited undo/redo. |
| Labels | Colours, per-label attributes (select, checkbox, text, number), skeleton definitions. |
| Video | Frame stepping and playback, interpolated tracks with keyframes, "outside" markers, propagate a shape forward. |
| Formats | Import and export LocalLabel JSON, CVAT XML 1.1 (images and video), COCO 1.0 (boxes, polygons, RLE masks, keypoints), YOLO detection / OBB / segmentation, Pascal VOC. Optional export of images and video frames. |
| AI assist | Load any ONNX model from disk and auto-annotate the current image, all images, or every Nth video frame. Built in: YOLO detection (v5/v8/v11/v10/26), YOLO-seg, **semantic segmentation**, **instance segmentation** (masks + scores + labels) and query-based models (Mask2Former-style). Configurable input size, layout, mean/std, RGB/BGR and letterbox/stretch for your own architectures. Results become masks or traced polygons. Runs on WebGPU or WASM inside the browser. |
| Storage | Autosaves to the browser (IndexedDB). "Save to folder" writes `.locallabel/project.json` next to your files. |

### Using your own segmentation model (ResNet, U-Net, DeepLab, Mask R-CNN, ...)

Convert it to ONNX once (`torch.onnx.export`), then pick the `.onnx` file in **AI assist** and open **Model settings**:

- **Input:** width × height, NCHW or NHWC, letterbox or stretch, RGB or BGR, pixel range (0–1 or 0–255), and mean/std (there's an ImageNet preset). Read from the model where possible.
- **Output** (auto-detected, or pick one):

| Your model outputs | Choose | Becomes |
| --- | --- | --- |
| `[1, C, H, W]` class logits/probabilities (or `[1, H, W]` class ids, or `[1, 1, H, W]` binary) | Semantic | one mask per class (background index skipped), optionally split into separate objects |
| masks `[N, 1, H, W]` or `[1, N, H, W]` + scores `[N]` + labels `[N]` (torchvision Mask R-CNN style) | Instance | one mask per instance above the confidence threshold |
| masks `[1, Q, H, W]` + class logits `[1, Q, C+1]`, last class = "no object" | Query masks | one mask per query |
| YOLO-seg `output0` + `output1` prototypes | YOLO-seg | one mask per detection |

**Auto-run:** turn on *Auto-run* (top bar, or the checkbox in AI assist) and the model runs on every image or video frame you open — no dialog. Frames that already have AI results are skipped, so your edits are never overwritten. The last model is kept in the browser, so it doesn't need picking again after a restart. Every AI run is one undo step (Ctrl+Z).

**Editing results:** segmentation results are saved as polygons by default, so every vertex is draggable. If you keep them as masks, a selected mask shows its outline as points too: drag a point to reshape the mask, double-click the outline to add a point, Alt+click to remove one, or use *To polygons*.

Mask outputs can be any resolution (e.g. ¼ of the input); they're upsampled smoothly to the image. Logits are detected and passed through a sigmoid automatically. Class names come from the model's `names` metadata, or type them in the settings. Settings are remembered per model file.

To embed class names in your ONNX file:

```python
import onnx
m = onnx.load('model.onnx')
m.metadata_props.add(key='names', value=str({0: 'background', 1: 'crack', 2: 'rust'}))
onnx.save(m, 'model.onnx')
```

### Getting a YOLO model for AI assist

```bash
pip install ultralytics
yolo export model=yolo11n.pt format=onnx   # produces yolo11n.onnx with class names embedded
```

Then in LocalLabel: **AI assist → choose the .onnx file → Run**. Detected classes are matched to your labels by name.

## Keyboard shortcuts

Press `?` in the app for the full list. The essentials: `V R P L O E K` tools, `B`/`X` brush/eraser, `Enter`/`Esc` finish/cancel, `1–9` label, `D`/`F` previous/next frame or file, `Space` play, `T` track mode, `Ctrl+Z` undo, `Del` delete.

## Project layout

```
manifest.json        MV3 manifest (only permission: unlimitedStorage)
background.js        opens the app tab when the toolbar icon is clicked
app.html / app.css   the app shell
js/main.js           UI wiring, dialogs, shortcuts
js/canvas.js         rendering, hit testing, drawing and editing tools
js/store.js          project model, tracks/interpolation, undo/redo
js/media.js          folder scanning, image decoding, video frame seeking
js/formats.js        import/export codecs
js/mask.js           RLE masks, COCO RLE, contour tracing
js/tiff.js           TIFF decoding (8/16/32-bit, float, multi-band, tiled, LZW/Deflate/JPEG/CCITT, palette/CMYK/YCbCr)
js/ai.js, ai-worker.js  configurable preprocessing + decoders (boxes, semantic, instance, query masks, YOLO-seg); ONNX Runtime in a worker
js/db.js, js/zip.js  IndexedDB persistence, zip read/write
vendor/              ONNX Runtime Web 1.30.0, geotiff.js 3.0.5, UTIF.js 3.1.0 (all MIT), bundled so no code is fetched remotely
```

No build step: the files are loaded as-is, which keeps Chrome Web Store review simple.

## Known limits

- TIFF: only the first page of multi-page files is shown. 16-bit and float single-band images are contrast-stretched (0.5–99.5 percentile) for display; annotations are always in original pixel coordinates. Files above about 268 megapixels are too large for the browser.

- Video frames are addressed by seeking (`(frame + 0.5) / fps`). It is accurate for constant-frame-rate files; variable-frame-rate video may be off by a frame. Frame-exact WebCodecs decoding is planned.

- Chrome cannot decode every codec (for example HEVC on some systems, or ProRes). Convert such files to H.264 MP4 or WebM first.

## License

Licensed under the MIT License. Copyright (c) 2026 BIBEK KOIRALA. See LICENSE for details. ONNX Runtime Web is © Microsoft, MIT licensed (vendor/ONNXRUNTIME-LICENSE). Third-party components retain their respective licenses and copyright notices.

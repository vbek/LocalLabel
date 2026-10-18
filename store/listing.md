# Chrome Web Store listing — LocalLabel

**Name:** LocalLabel – Image & Video Annotation

**Category:** Developer Tools (alternative: Productivity)

**Single purpose:** Annotate local images and videos to create machine-learning datasets.

**Short description (≤132 chars):**
Label local images and videos for ML: boxes, polygons, masks, tracks, AI assist. Your files never leave your computer.

**Detailed description:**

LocalLabel is a full image and video annotation tool that runs entirely in your browser. Open a folder from your computer, draw labels, and export datasets in the formats your training code expects. There is no server and no upload: your images, videos and annotations stay on your machine.

Annotation tools
• Bounding boxes with rotation, polygons, polylines, points, ellipses
• Skeletons / keypoints with custom node and edge definitions
• Pixel masks with brush, eraser and polygon-to-mask
• Per-label attributes (dropdowns, checkboxes, text, numbers), occluded, z-order, lock, hide
• Unlimited undo/redo and CVAT-style keyboard shortcuts

Video
• Frame-by-frame stepping and playback
• Interpolated tracks with keyframes, like CVAT
• Propagate shapes across frames

AI assist
• Load your own YOLO model (.onnx) and auto-annotate a frame, a folder or a video
• Runs locally on WebGPU or WebAssembly; nothing is sent anywhere

Import and export
• CVAT XML 1.1, COCO, YOLO (detection, OBB, segmentation), Pascal VOC, and LocalLabel JSON
• Optionally export images and video frames alongside the labels

Privacy
• No account, no analytics, no network requests
• Projects autosave in your browser; optionally save them into the folder itself

**Permission justification — unlimitedStorage:**
Annotation projects (including pixel masks for large datasets) are stored locally in IndexedDB. This permission prevents Chrome from evicting a user's saved work when the dataset is large.

**Remote code:** No. All code, including ONNX Runtime Web, is packaged in the extension.

**Data usage disclosures:** Does not collect any of the listed data types. Certify: no sale of data, no use unrelated to the single purpose, no use for creditworthiness.

**Privacy policy URL:** host PRIVACY.md (e.g. GitHub Pages) and paste its URL.

**Assets:** icons/icon128.png (store icon); screenshots in store/ (1280×800).

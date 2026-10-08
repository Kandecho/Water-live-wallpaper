Water HD — Meniscus Study 02 (prototype 0.2.0)

This prototype uses the UNCHANGED original AOSP background and leaf atlas.
No new HD leaf artwork is included. It is separate from classic release 1.0.1.

Preview: open preview.html in a WebGL browser for the comparison panel.
Wallpaper: use index.html for a clean screen without the panel.

Click: a spreading ripple. Hold and drag: a restrained trail of ripples.
Space: pause/resume. H: panel. T: meniscus on/off. C: lighting/tilt. L: leaves.
Pause and toggle T to compare the exact same scene with and without menisci.
The FPS indicator measures render calls, not full desktop GPU performance.

Surface-tension appearance: an alpha-derived distance/gradient atlas is created
once at startup, with padding around each original leaf cell. A shallow local
depression decays away from each floating leaf's silhouette. Its gradient bends
the already-rendered pond reflection and changes directional illumination.
The reduced contact shadow avoids doubling the dark rim. Airborne leaves have
no meniscus; contact begins on landing. The atlas is auxiliary data, not new art.

This is a visual capillary approximation, not a surface-tension force solver:
leaves do not attract/cluster, deform, wet progressively, or couple their menisci.
The original low-resolution leaf artwork and flat interior shading remain.
The snapshot pass costs one screen-sized RGB texture and one GPU copy per frame
when menisci and leaves are enabled. There is no CPU pixel readback per frame.

Timing is independent of rendering FPS, up to 60 FPS. Wallpaper Engine respects
your global FPS setting. No external dependencies or internet access are needed.
Native engine compatibility and 4K desktop performance still need target testing.

Sucrose: drag this ZIP into its library and choose Use.
Lively: import this ZIP into its library (not yet tested in Lively).
Wallpaper Engine: extract the ZIP and create a NEW project from index.html.
Do not replace the published classic Workshop project with this study.

Source: https://github.com/Kandecho/Water-live-wallpaper/tree/main/wallpaper-hd
License and provenance: LICENSE.txt and NOTICE.txt.

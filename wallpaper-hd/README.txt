Water HD — Meniscus Study 02 (prototype 0.2.1)

This prototype uses the UNCHANGED original AOSP background and leaf atlas.
No new HD leaf artwork is included. It is separate from classic release 1.0.1.

Preview: open preview.html in a WebGL browser for the comparison panel.
Wallpaper: use index.html for a clean screen without the panel.

Click: a spreading ripple. Hold and drag: a restrained trail of ripples.
Space: pause/resume. H: panel. T: meniscus on/off. C: lighting/tilt. L: leaves.
Pause and toggle T to compare the exact same scene with and without menisci.
The FPS indicator measures render calls, not full desktop GPU performance.

Surface-tension appearance: each original leaf has three small contact patches,
chosen as plausible low points of a gently curled leaf and snapped to its alpha
contour. These choices are art direction, not a reconstruction of 3D geometry.
The depression decays over 2.4 source pixels and ends within 8 pixels, instead of
the previous broad 29-pixel rim. Its complete height gradient includes the ends
of each wet patch, so they taper naturally into the dry edge. Contact patches
remain fixed to the leaf as it drifts/rotates; passing waves change their shading.
The T comparison toggles only the meniscus, keeping the soft shadow constant.

The auxiliary height/gradient atlas is made once at startup from the unchanged
original alpha. Its gradient bends a GPU copy of the rendered water and changes
directional illumination. Airborne leaves have no meniscus; contact starts on
landing. No replacement artwork is generated.

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

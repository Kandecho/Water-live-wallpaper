Water HD — Water & Leaf Study 01 (prototype 0.1.0)

This prototype explores water lighting and leaf integration using the UNCHANGED
original AOSP background and leaf atlas. No new HD leaf artwork is included.
It is separate from the classic 1.0.1 release and its Steam Workshop item.

Preview: open preview.html in a WebGL browser for the comparison panel.
Wallpaper: use index.html for a clean screen without the panel.

Click: a spreading ripple. Hold and drag: a restrained trail of ripples.
Space: pause/resume. H: show/hide the panel. C: fusion on/off. L: show/hide leaves.
The comparison switches work while paused, for inspecting the same frame.
The FPS indicator measures render calls in this preview, not full desktop GPU performance.

Fusion adds shared directional light, a soft contact shadow, and small delayed
leaf tilts sampled from the same analytic wave field. Fully transparent RGB no
longer leaks into sprite edges because textures use premultiplied alpha.
A soft shadow atlas is made once at startup from the existing leaf image.

Timing is independent of rendering FPS. Target: up to 60 FPS. Wallpaper Engine
respects your global FPS setting; set it to 60 to evaluate the full prototype.
No extra fluid solver, physics engine, dependencies, or internet access.

Sucrose: drag this ZIP into its library and choose Use.
Lively: import this ZIP into its library (not yet tested in Lively).
Wallpaper Engine: extract the ZIP and create a NEW project from index.html.
Do not replace the existing classic Workshop project with this study.

Validation: analytic height/normal agreement, 15/30/60/144 Hz timing, bounded
wave sources, landing once, ten simulated minutes, and portrait/ultrawide grids.
Browser render checks and interactive preview verified; native engine behavior
and 4K desktop performance still require testing on the target setup.

Source: https://github.com/Kandecho/Water-live-wallpaper/tree/main/wallpaper-hd
License and provenance: LICENSE.txt and NOTICE.txt.
